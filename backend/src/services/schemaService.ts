import { sandboxPool } from '../config/db.postgres.js'
import type { AssignmentSchemaResponse, ColumnInfo, TableSchema } from '../types/index.js'
const SAMPLE_ROW_LIMIT = 3


export const getSchemaForTables = async (
  tableNames: string[]
): Promise<AssignmentSchemaResponse> => {
  const client = await sandboxPool.connect()

  try {
    const result: AssignmentSchemaResponse = []

    for (const tableName of tableNames) {
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

      const columns: ColumnInfo[] = columnQuery.rows.map((row) => ({
        name: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === 'YES',
      }))

      const sampleQuery = await client.query(
        `SELECT * FROM "${tableName}" LIMIT $1`,
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