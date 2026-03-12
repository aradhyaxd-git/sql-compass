export interface QueryResult {
  columns: string[]
  rows: Record<string, unknown>[]
  rowCount: number
  duration: number
}

export interface QueryError {
  message: string
  hint?: string
  position?: number
}

export type QueryState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: QueryResult }
  | { status: 'error'; error: QueryError }

export interface Attempt {
  _id: string
  assignmentId: string
  assignmentTitle: string
  query: string
  status: 'success' | 'error'
  rowCount: number
  executedAt: string
}

export interface HintResponse {
  hint: string
}