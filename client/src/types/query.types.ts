export interface SampleMismatch {
  rowIndex: number
  columnIndex?: number
  actualValue?: unknown
  message?: string
}

export interface VerdictDiff {
  expectedRowCount: number
  actualRowCount: number
  expectedColumnCount: number
  actualColumnCount: number
  sampleMismatches?: SampleMismatch[]
}

export interface JudgeVerdict {
  correct: boolean
  reason: string
  message: string
  diff?: VerdictDiff
}

export interface ExecutionPlanSummary {
  totalCost: number
  startupCost: number
  planRows: number
  planWidth: number
  nodeTypes: string[]
  hasSeqScan: boolean
  hasIndexScan: boolean
}

export interface QueryResult {
  columns: string[]
  rows: Record<string, unknown>[]
  rawTuples?: unknown[][]
  rowCount: number
  duration: number
  verdict?: JudgeVerdict
  xpEarned?: number
  executionPlan?: ExecutionPlanSummary
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
  correct?: boolean
  verdictReason?: string
  rowCount: number
  xpEarned?: number
  executedAt: string
}

export interface HintData {
  hint: string
  level?: 1 | 2 | 3
  errorClass?: string | null
  concept?: string | null
  fromCache?: boolean
}

export interface HintResponse {
  hint: string
  level?: 1 | 2 | 3
  errorClass?: string | null
  concept?: string | null
  fromCache?: boolean
}