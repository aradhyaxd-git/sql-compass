import { sandboxPool } from '../config/db.postgres.js'
import { sanitizeSQL } from './sqlSanitizer.js'
import type { QueryResult } from '../types/index.js'

const ROW_LIMIT = 500
const QUERY_TIMEOUT_MS = 5000

export const executeUserQuery = async (sql: string): Promise<QueryResult> => {
  const { safe, reason } = sanitizeSQL(sql)
  if (!safe) {
    throw new Error(reason ?? 'Query failed safety check')
  }

  const cleanedSQL = sql.trim().replace(/;+$/, '')
  const alreadyHasLimit = /\bLIMIT\b/i.test(cleanedSQL)
  const finalSQL = alreadyHasLimit
    ? cleanedSQL
    : `SELECT * FROM (${cleanedSQL}) AS _user_query LIMIT ${ROW_LIMIT}`

  const client = await sandboxPool.connect()
  const startTime = Date.now()

  try {
    await client.query('BEGIN')
    await client.query(`SET LOCAL statement_timeout = '${QUERY_TIMEOUT_MS}'`) 
    const result = await client.query(finalSQL)
    await client.query('COMMIT')

    const duration = Date.now() - startTime
    const columns = result.fields.map(f => f.name)
    const rows = result.rows as Record<string, unknown>[]

    return { columns, rows, rowCount: rows.length, duration }
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(msg)
  } finally {
    client.release()
  }
}