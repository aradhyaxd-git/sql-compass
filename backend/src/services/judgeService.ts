import { executeUserQuery } from './executionService.js'
import type { QueryResult } from '../types/index.js'

export type VerdictReason =
  | 'match'
  | 'column_count_mismatch'
  | 'row_count_mismatch'
  | 'values_mismatch'
  | 'order_mismatch'
  | 'execution_error'

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
  reason: VerdictReason
  message: string
  diff?: VerdictDiff
}

export function normalizeValue(val: unknown): string {
  if (val === null || val === undefined) {
    return '__NULL__'
  }

  if (val instanceof Date) {
    return val.toISOString()
  }

  if (typeof val === 'number') {
    return Number.isInteger(val) ? val.toString() : val.toFixed(2)
  }

  if (typeof val === 'string') {
    const trimmed = val.trim()
    // Numeric string normalization (e.g. "50000.00" -> "50000.00")
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      const num = Number(trimmed)
      if (!Number.isNaN(num)) {
        return Number.isInteger(num) ? num.toString() : num.toFixed(2)
      }
    }
    // Check if valid ISO date string
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      const date = new Date(trimmed)
      if (!Number.isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]!
      }
    }
    return trimmed.toLowerCase()
  }

  if (typeof val === 'boolean') {
    return val ? 'true' : 'false'
  }

  return String(val).trim().toLowerCase()
}

function rowToTuple(row: Record<string, unknown>, columns: string[]): string[] {
  return columns.map((col) => normalizeValue(row[col]))
}

function tupleToKey(tuple: string[]): string {
  return tuple.join('|||')
}

export function compareResults(
  actual: QueryResult,
  expected: QueryResult,
  orderMatters: boolean = false
): JudgeVerdict {
  const actualColCount = actual.columns.length
  const expectedColCount = expected.columns.length
  const actualRowCount = actual.rows.length
  const expectedRowCount = expected.rows.length

  const baseDiff: VerdictDiff = {
    actualColumnCount: actualColCount,
    expectedColumnCount: expectedColCount,
    actualRowCount,
    expectedRowCount,
  }

  // 1. Column count check
  if (actualColCount !== expectedColCount) {
    return {
      correct: false,
      reason: 'column_count_mismatch',
      message: `Expected ${expectedColCount} column${expectedColCount === 1 ? '' : 's'}, but your query returned ${actualColCount}.`,
      diff: baseDiff,
    }
  }

  // 2. Row count check
  if (actualRowCount !== expectedRowCount) {
    return {
      correct: false,
      reason: 'row_count_mismatch',
      message: `Expected ${expectedRowCount} row${expectedRowCount === 1 ? '' : 's'}, but your query returned ${actualRowCount}.`,
      diff: baseDiff,
    }
  }

  // Extract positional tuples
  const actualTuples = actual.rows.map((r) => rowToTuple(r, actual.columns))
  const expectedTuples = expected.rows.map((r) => rowToTuple(r, expected.columns))

  const sampleMismatches: SampleMismatch[] = []

  // 3. Ordered comparison
  if (orderMatters) {
    for (let i = 0; i < expectedTuples.length; i++) {
      const actualT = actualTuples[i]!
      const expectedT = expectedTuples[i]!

      for (let c = 0; c < expectedT.length; c++) {
        if (actualT[c] !== expectedT[c]) {
          if (sampleMismatches.length < 3) {
            sampleMismatches.push({
              rowIndex: i + 1,
              columnIndex: c + 1,
              actualValue: actual.rows[i]?.[actual.columns[c]!],
              message: `Row #${i + 1}, Column #${c + 1} value did not match expected ordering.`,
            })
          }
        }
      }
    }

    if (sampleMismatches.length > 0) {
      return {
        correct: false,
        reason: 'order_mismatch',
        message: 'The query returned the right count, but the rows are not in the required order.',
        diff: {
          ...baseDiff,
          sampleMismatches,
        },
      }
    }

    return {
      correct: true,
      reason: 'match',
      message: 'All columns, rows, and ordering matched the reference solution!',
      diff: baseDiff,
    }
  }

  // 4. Unordered multiset comparison
  const expectedBag = new Map<string, number>()
  for (const t of expectedTuples) {
    const key = tupleToKey(t)
    expectedBag.set(key, (expectedBag.get(key) ?? 0) + 1)
  }

  const actualBag = new Map<string, number>()
  for (const t of actualTuples) {
    const key = tupleToKey(t)
    actualBag.set(key, (actualBag.get(key) ?? 0) + 1)
  }

  // Find mismatches in actual vs expected
  for (let i = 0; i < actualTuples.length; i++) {
    const key = tupleToKey(actualTuples[i]!)
    const expectedCount = expectedBag.get(key) ?? 0
    const actualCount = actualBag.get(key) ?? 0

    if (actualCount !== expectedCount) {
      if (sampleMismatches.length < 3) {
        sampleMismatches.push({
          rowIndex: i + 1,
          actualValue: actualTuples[i]?.join(', '),
          message: `Unexpected or extra row encountered at row #${i + 1}`,
        })
      }
    }
  }

  if (sampleMismatches.length > 0) {
    return {
      correct: false,
      reason: 'values_mismatch',
      message: 'The row count matches, but some returned values do not match expected records.',
      diff: {
        ...baseDiff,
        sampleMismatches,
      },
    }
  }

  return {
    correct: true,
    reason: 'match',
    message: 'All result set values matched the reference solution!',
    diff: baseDiff,
  }
}

const referenceQueryCache = new Map<string, QueryResult>()

export async function getReferenceQueryResult(referenceSql: string): Promise<QueryResult> {
  const cached = referenceQueryCache.get(referenceSql)
  if (cached) {
    return cached
  }
  const result = await executeUserQuery(referenceSql)
  referenceQueryCache.set(referenceSql, result)
  return result
}

export async function judgeAttempt(
  studentSql: string,
  referenceSql: string,
  orderMatters: boolean = false
): Promise<{
  verdict: JudgeVerdict
  studentResult?: QueryResult
  referenceResult?: QueryResult
}> {
  let studentResult: QueryResult
  try {
    studentResult = await executeUserQuery(studentSql)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return {
      verdict: {
        correct: false,
        reason: 'execution_error',
        message: msg,
      },
    }
  }

  let referenceResult: QueryResult
  try {
    referenceResult = await getReferenceQueryResult(referenceSql)
  } catch (refErr) {
    const msg = refErr instanceof Error ? refErr.message : String(refErr)
    throw new Error(`Reference SQL failed execution: ${msg}`)
  }

  const verdict = compareResults(studentResult, referenceResult, orderMatters)
  return { verdict, studentResult, referenceResult }
}
