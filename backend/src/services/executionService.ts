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

export const executeUserQuery = async (
  sql: string,
  options: { bypassLimit?: boolean } = {}
): Promise<QueryResult> => {
  const { safe, reason } = sanitizeSQL(sql)
  if (!safe) {
    throw new Error(reason ?? 'Query failed safety check')
  }

  const cleanedSQL = sql.trim().replace(/;+\s*$/, '')
  const finalSQL = options.bypassLimit
    ? `${cleanedSQL}\n`
    : `SELECT * FROM (\n${cleanedSQL}\n) AS _user_query LIMIT ${ROW_LIMIT}`

  const client = await sandboxPool.connect()
  const startTime = Date.now()

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
    const columns = result.fields.map(f => f.name)
    const rawTuples = result.rows as unknown[][]
    const rows = rawTuples.map((tuple) => {
      const rowObj: Record<string, unknown> = {}
      columns.forEach((col, idx) => {
        rowObj[col] = tuple[idx]
      })
      return rowObj
    })

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