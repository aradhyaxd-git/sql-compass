import { sandboxPool } from '../config/db.postgres.js'
import { getActiveExecutionCount } from './concurrencyGuard.js'

interface MetricCounters {
  executionsSuccess: number
  executionsError: number
  executionsConcurrencyRejected: number
  verdictsCorrect: number
  verdictsIncorrect: number
  hintRequests: number
  hintCacheHits: number
}

const counters: MetricCounters = {
  executionsSuccess: 0,
  executionsError: 0,
  executionsConcurrencyRejected: 0,
  verdictsCorrect: 0,
  verdictsIncorrect: 0,
  hintRequests: 0,
  hintCacheHits: 0,
}

export const metrics = {
  recordExecutionSuccess: () => {
    counters.executionsSuccess++
  },
  recordExecutionError: () => {
    counters.executionsError++
  },
  recordConcurrencyRejected: () => {
    counters.executionsConcurrencyRejected++
  },
  recordVerdict: (correct: boolean) => {
    if (correct) {
      counters.verdictsCorrect++
    } else {
      counters.verdictsIncorrect++
    }
  },
  recordHintRequest: (fromCache: boolean) => {
    counters.hintRequests++
    if (fromCache) {
      counters.hintCacheHits++
    }
  },
}

export function formatPrometheusMetrics(): string {
  const activeExecutions = getActiveExecutionCount()
  const poolTotal = sandboxPool.totalCount
  const poolIdle = sandboxPool.idleCount
  const poolWaiting = sandboxPool.waitingCount

  return [
    '# HELP sql_compass_executions_total Total number of query executions',
    '# TYPE sql_compass_executions_total counter',
    `sql_compass_executions_total{status="success"} ${counters.executionsSuccess}`,
    `sql_compass_executions_total{status="error"} ${counters.executionsError}`,
    `sql_compass_executions_total{status="concurrency_rejected"} ${counters.executionsConcurrencyRejected}`,
    '',
    '# HELP sql_compass_verdicts_total Total judge verdicts evaluated',
    '# TYPE sql_compass_verdicts_total counter',
    `sql_compass_verdicts_total{result="correct"} ${counters.verdictsCorrect}`,
    `sql_compass_verdicts_total{result="incorrect"} ${counters.verdictsIncorrect}`,
    '',
    '# HELP sql_compass_hint_requests_total Total hint requests processed',
    '# TYPE sql_compass_hint_requests_total counter',
    `sql_compass_hint_requests_total{source="all"} ${counters.hintRequests}`,
    `sql_compass_hint_requests_total{source="cache"} ${counters.hintCacheHits}`,
    '',
    '# HELP sql_compass_active_executions Active concurrent queries in flight',
    '# TYPE sql_compass_active_executions gauge',
    `sql_compass_active_executions ${activeExecutions}`,
    '',
    '# HELP sql_compass_db_pool_clients Current PostgreSQL sandbox pool connections',
    '# TYPE sql_compass_db_pool_clients gauge',
    `sql_compass_db_pool_clients{state="total"} ${poolTotal}`,
    `sql_compass_db_pool_clients{state="idle"} ${poolIdle}`,
    `sql_compass_db_pool_clients{state="waiting"} ${poolWaiting}`,
    '',
  ].join('\n')
}
