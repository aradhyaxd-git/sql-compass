import { sandboxPool } from '../config/db.postgres.js'
import type { AssignmentSchemaResponse, ColumnInfo, TableSchema } from '../types/index.js'

const SAMPLE_ROW_LIMIT = 3
const VALID_IDENTIFIER_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/

export const getSchemaForTables = async (
  tableNames: string[]
): Promise<AssignmentSchemaResponse> => {
  const client = await sandboxPool.connect()

  try {
    const result: AssignmentSchemaResponse = []

    for (const rawName of tableNames) {
      const tableName = String(rawName).trim()
      if (!VALID_IDENTIFIER_REGEX.test(tableName)) {
        throw new Error(`Invalid table name identifier: ${tableName}`)
      }

      const columnQuery = await client.query<{
        column_name: string
        data_type: string
        is_nullable: string
      }>(
        `SELECT column_name, data_type, is_nullable
         FROM information_schema.columns
         WHERE table_name = $1
           AND table_schema = 'public'
         ORDER BY ordinal_position`,
        [tableName]
      )

      if (columnQuery.rows.length === 0) {
        continue
      }

      const columns: ColumnInfo[] = columnQuery.rows.map((row) => ({
        name: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === 'YES',
      }))

      const escapedIdentifier = `"${tableName.replace(/"/g, '""')}"`
      const sampleQuery = await client.query(
        `SELECT * FROM ${escapedIdentifier} LIMIT $1`,
        [SAMPLE_ROW_LIMIT]
      )

      const sampleRows = sampleQuery.rows as Record<string, unknown>[]

      const tableSchema: TableSchema = {
        tableName,
        columns,
        sampleRows,
      }

      result.push(tableSchema)
    }

    return result
  } finally {
    client.release()
  }
}

export const formatSchemaTextForPrompt = async (tableNames: string[]): Promise<string> => {
  const schemas = await getSchemaForTables(tableNames)
  return schemas
    .map((table) => {
      const colList = table.columns
        .map((c) => `  ${c.name} (${c.type}${c.nullable ? ', nullable' : ''})`)
        .join('\n')
      return `TABLE ${table.tableName}:\n${colList}`
    })
    .join('\n\n')
}