export type Difficulty = 'easy' | 'medium' | 'hard'

export interface AssignmentResponse {
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

export type AssignmentSchemaResponse = TableSchema[]



export interface ExecuteRequestBody {
  assignmentId: string
  sql: string
}

export interface QueryResult {
  columns: string[]
  rows: Record<string, unknown>[]
  rowCount: number
  duration: number  
}



export interface HintRequestBody {
  assignmentId: string
  currentQuery: string
}

export interface HintResponse {
  hint: string
}



export interface AttemptResponse {
  _id: string
  assignmentId: string
  assignmentTitle: string
  query: string
  status: 'success' | 'error'
  rowCount: number
  executedAt: string
}



export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  message: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError


declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}