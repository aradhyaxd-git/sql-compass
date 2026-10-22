import { sandboxPool } from '../config/db.postgres.js'
import { sanitizeSQL } from './sqlSanitizer.js'
import type { QueryResult, ExecutionPlanSummary } from '../types/index.js'

const ROW_LIMIT = 500
const QUERY_TIMEOUT_MS = 5000

function parseExecutionPlan(planOutput: unknown): ExecutionPlanSummary | undefined {
  if (!planOutput || !Array.isArray(planOutput) || !planOutput[0]) return undefined
  try {
    const rootPlan = (planOutput[0] as { Plan?: Record<string, unknown> })?.Plan
    if (!rootPlan) return undefined

    const nodeTypes: string[] = []
    let hasSeqScan = false
    let hasIndexScan = false

    const traverse = (node: Record<string, unknown> | undefined) => {
      if (!node || typeof node !== 'object') return
      const type = typeof node['Node Type'] === 'string' ? node['Node Type'] : ''
      if (type) {
        nodeTypes.push(type)
        if (type.toLowerCase().includes('seq scan')) hasSeqScan = true
        if (type.toLowerCase().includes('index')) hasIndexScan = true
      }
      const subPlans = node['Plans']
      if (Array.isArray(subPlans)) {
        subPlans.forEach((sub) => traverse(sub as Record<string, unknown>))
      }
    }

    traverse(rootPlan)

    return {
      totalCost: Number(rootPlan['Total Cost']) || 0,
      startupCost: Number(rootPlan['Startup Cost']) || 0,
      planRows: Number(rootPlan['Plan Rows']) || 0,
      planWidth: Number(rootPlan['Plan Width']) || 0,
      nodeTypes,
      hasSeqScan,
      hasIndexScan,
    }
  } catch {
    return undefined
  }
}

export interface ExecutionOptions {
  bypassLimit?: boolean
  allowWriteSandbox?: boolean
  verificationSql?: string
}

const MAX_RESPONSE_BYTES = 2 * 1024 * 1024 // 2 MB

function validateAndFormatResults(
  fields: Array<{ name: string }>,
  rawRows: unknown[][],
  maxRows: number = ROW_LIMIT
): { columns: string[]; rows: Record<string, unknown>[]; rawTuples: unknown[][] } {
  const columns = fields.map((f) => f.name)
  const cappedRows = rawRows.length > maxRows ? rawRows.slice(0, maxRows) : rawRows

  let totalBytes = 0
  const rows: Record<string, unknown>[] = []

  for (const tuple of cappedRows) {
    const rowObj: Record<string, unknown> = {}
    for (let idx = 0; idx < columns.length; idx++) {
      const val = tuple[idx]
      rowObj[columns[idx]] = val
      if (typeof val === 'string') {
        totalBytes += val.length
      } else if (val !== null && val !== undefined) {
        totalBytes += 8
      }
      if (totalBytes > MAX_RESPONSE_BYTES) {
        throw new Error(
          'Query result exceeds maximum payload memory budget (2 MB). Please refine your projection or add a LIMIT clause.'
        )
      }
    }
    rows.push(rowObj)
  }

  return { columns, rows, rawTuples: cappedRows }
}

export const executeUserQuery = async (
  sql: string,
  options: ExecutionOptions = {}
): Promise<QueryResult> => {
  const allowWrite = options.allowWriteSandbox ?? true
  const { safe, reason, category } = sanitizeSQL(sql, { allowWriteSandbox: allowWrite })
  if (!safe) {
    throw new Error(reason ?? 'Query failed safety check')
  }

  const cleanedSQL = sql.trim().replace(/;+\s*$/, '')
  const client = await sandboxPool.connect()
  const startTime = Date.now()

  if (category === 'write') {
    try {
      await client.query('BEGIN')
      await client.query(`SET LOCAL statement_timeout = '${QUERY_TIMEOUT_MS}'`)

      const userRes = await client.query({
        text: cleanedSQL,
        rowMode: 'array',
      })

      let fields: Array<{ name: string }>
      let rawRows: unknown[][]

      if (options.verificationSql) {
        const verifyClean = options.verificationSql.trim().replace(/;+\s*$/, '')
        const verifyRes = await client.query({
          text: `SELECT * FROM (\n${verifyClean}\n) AS _verification LIMIT ${ROW_LIMIT}`,
          rowMode: 'array',
        })
        fields = verifyRes.fields
        rawRows = verifyRes.rows as unknown[][]
      } else if (userRes.fields && userRes.fields.length > 0) {
        fields = userRes.fields
        rawRows = userRes.rows as unknown[][]
      } else {
        fields = [{ name: 'command' }, { name: 'affected_rows' }]
        rawRows = [[userRes.command, userRes.rowCount ?? 0]]
      }

      await client.query('ROLLBACK')

      const duration = Date.now() - startTime
      const { columns, rows, rawTuples } = validateAndFormatResults(fields, rawRows, ROW_LIMIT)

      return {
        columns,
        rows,
        rawTuples,
        rowCount: rawTuples.length,
        duration,
      } as QueryResult
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {})
      const msg = error instanceof Error ? error.message : String(error)
      throw new Error(msg)
    } finally {
      client.release()
    }
  }

  const finalSQL = options.bypassLimit
    ? `${cleanedSQL}\n`
    : `SELECT * FROM (\n${cleanedSQL}\n) AS _user_query LIMIT ${ROW_LIMIT}`

  try {
    await client.query('BEGIN READ ONLY')
    await client.query(`SET LOCAL statement_timeout = '${QUERY_TIMEOUT_MS}'`)

    let executionPlan: ExecutionPlanSummary | undefined
    try {
      const planRes = await client.query(`EXPLAIN (FORMAT JSON) ${finalSQL}`)
      const rawPlan = planRes.rows?.[0]?.['QUERY PLAN']
      executionPlan = parseExecutionPlan(rawPlan)
    } catch {
      executionPlan = undefined
    }

    const result = await client.query({
      text: finalSQL,
      rowMode: 'array',
    })
    await client.query('COMMIT')

    const duration = Date.now() - startTime
    const { columns, rows, rawTuples } = validateAndFormatResults(
      result.fields,
      result.rows as unknown[][],
      options.bypassLimit ? 10000 : ROW_LIMIT
    )

    return {
      columns,
      rows,
      rawTuples,
      rowCount: rawTuples.length,
      duration,
      executionPlan,
    } as QueryResult
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(msg)
  } finally {
    client.release()
  }
}