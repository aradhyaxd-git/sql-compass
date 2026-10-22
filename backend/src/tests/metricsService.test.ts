import assert from 'node:assert'
import { metrics, formatPrometheusMetrics } from '../services/metricsService.js'

function runTests(): void {
  metrics.recordExecutionSuccess()
  metrics.recordExecutionError()
  metrics.recordConcurrencyRejected()
  metrics.recordVerdict(true)
  metrics.recordVerdict(false)
  metrics.recordHintRequest(true)
  metrics.recordHintRequest(false)

  const output = formatPrometheusMetrics()

  assert.ok(output.includes('sql_compass_executions_total{status="success"} 1'))
  assert.ok(output.includes('sql_compass_executions_total{status="error"} 1'))
  assert.ok(output.includes('sql_compass_executions_total{status="concurrency_rejected"} 1'))
  assert.ok(output.includes('sql_compass_verdicts_total{result="correct"} 1'))
  assert.ok(output.includes('sql_compass_verdicts_total{result="incorrect"} 1'))
  assert.ok(output.includes('sql_compass_hint_requests_total{source="all"} 2'))
  assert.ok(output.includes('sql_compass_hint_requests_total{source="cache"} 1'))
  assert.ok(output.includes('sql_compass_active_executions'))
  assert.ok(output.includes('sql_compass_db_pool_clients'))

  console.log('[SUCCESS] metricsService test suite passed successfully.')
}

runTests()
