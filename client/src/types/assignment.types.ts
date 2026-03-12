export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Assignment {
  _id: string
  title: string
  description: string
  difficulty: Difficulty
  tags: string[]
  tableNames: string[]
  createdAt: string
}

export interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
}

export interface TableSchema {
  tableName: string
  columns: ColumnInfo[]
  sampleRows: Record<string, unknown>[]
}

export type AssignmentSchema = TableSchema[]