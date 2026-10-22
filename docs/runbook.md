# Operations & Incident Runbook

This runbook guides engineers through operating, diagnosing, monitoring, and resolving production incidents on the SQL Compass platform.

---

## 1. System Overview & SLO Targets

### Service Level Objectives (SLOs)
- **API Availability**: $\ge 99.9\%$ monthly uptime.
- **Query Execution Latency (p95)**: $\le 800\text{ ms}$ for read queries within limits.
- **Hint Generation Latency (p95)**: $\le 3,500\text{ ms}$ for cache misses; $\le 5\text{ ms}$ for cache hits.
- **Result Memory Budget**: Strictly capped at 2 MB payload per execution.
- **Database Statement Timeout**: 5,000 ms hard limit on sandbox queries.

---

## 2. Health & Diagnostic Endpoints

### 2.1. Liveness Probe
- **Endpoint**: `GET /health`
- **Purpose**: Fast health check for container liveness and load balancers.
- **Expected Status**: `200 OK`
```json
{
  "status": "active",
  "timestamp": "2026-10-22T08:00:00.000Z"
}
```

### 2.2. Readiness Probe (Deep Dependency Check)
- **Endpoint**: `GET /health/deep`
- **Purpose**: Confirms active network connectivity and query responsiveness to both PostgreSQL and MongoDB.
- **Expected Status**: `200 OK` (or `503 Service Unavailable` if a database is unreachable)
```json
{
  "status": "healthy",
  "checks": {
    "postgres": "ok",
    "mongodb": "ok",
    "server": "ok"
  },
  "timestamp": "2026-10-22T08:00:00.000Z"
}
```

### 2.3. Prometheus Metrics Scrape
- **Endpoint**: `GET /metrics`
- **Format**: Standard OpenMetrics / Prometheus text.
- **Key Metrics to Monitor**:
  - `sqlcompass_concurrency_rejected_total`: Indicates users submitting concurrent queries.
  - `sqlcompass_query_error_total`: Tracks runtime SQL syntax or constraint failures.
  - `sqlcompass_hints_cached_total` vs `sqlcompass_hints_total`: Tracks LLM hint cache hit ratios.

---

## 3. Automated Test Suites & Verification

Always run test suites before releasing or after environment changes:

```bash
cd backend
npm test
```

Verification covers:
1. `sqlSanitizer.test.ts`: AST query validation and restricted statement filtering.
2. `judgeService.test.ts`: Result comparison and type normalization.
3. `hintCacheService.test.ts`: Query hashing, TTL expiration, and entry eviction.
4. `concurrencyGuard.test.ts`: Single-query locking per user.
5. `dialectLinter.test.ts`: Cross-dialect SQL syntax hinting.
6. `metricsService.test.ts`: Prometheus metrics calculation.
7. `writeSandbox.test.ts`: Ephemeral rollback verification.
8. `mcpServer.test.ts`: Model Context Protocol stdio tools.
9. `securityHardening.test.ts`: Malformed cookie resilience, CORS validation, and memory payload enforcement.

---

## 4. Incident Response Procedures

### 4.1. Postgres Connection Pool Starvation
- **Symptoms**: Queries timing out; `error: timeout exceeded when connecting to database` in Winston logs.
- **Diagnosis**:
  ```bash
  # Check active connections in Postgres console
  SELECT count(*), state FROM pg_stat_activity GROUP BY state;
  ```
- **Remediation**:
  1. Verify pool connection limits in `backend/src/config/db.postgres.ts` (default `max: 10`).
  2. Confirm statement timeouts are firing at 5,000 ms.
  3. Terminate stuck transactions if necessary:
     ```sql
     SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
     WHERE state = 'active' AND query_start < now() - interval '30 seconds';
     ```

---

### 4.2. Google Gemini API Quota or Timeout Errors
- **Symptoms**: Hint generation returns fallback error message; `llm_error` events in server logs.
- **Diagnosis**:
  Check logs for HTTP 429 (ResourceExhausted) or HTTP 504.
- **Mitigation**:
  1. The hint cache service (`hintCacheService.ts`) automatically absorbs repetitive queries without hitting the API.
  2. Verify `HINT_CACHE_TTL_SECONDS` is set to at least 600 seconds.
  3. If primary Gemini key is exhausted, update `GEMINI_API_KEY` in Render environment settings to initiate an immediate rolling restart.

---

### 4.3. High Server RSS Memory Usage
- **Symptoms**: Render alerts container approaching memory threshold (512 MB on free/starter tier).
- **Guards in Place**:
  - `validateAndFormatResults` enforces a 2 MB hard cap per query result.
  - Hint inputs are clamped to 4,000 characters.
  - LangGraph checkpointer memory leaks removed (SC-05/SC-06).
  - Hint cache is bounded to 500 entries with automatic FIFO eviction.
- **Remediation**:
  If a leak occurs, capture heap profile and trigger a zero-downtime deploy on Render.

---

### 4.4. Malformed Authentication Tokens
- **Symptoms**: Suspicious traffic sending corrupted headers or cookies.
- **Mitigation**:
  The authentication middleware (`auth.ts`) safely wraps token decoding in `try/catch`. Malformed inputs are rejected cleanly with HTTP `401 Unauthorized` without crashing the Express process.

---

## 5. Routine Maintenance

### 5.1. Refreshing Sandbox Data
If sample data in PostgreSQL requires a fresh reset:
```bash
# 1. Re-run table DDL scripts in Neon console
# 2. Re-seed MongoDB assignments and validate reference queries
cd backend
npm run seed
```

### 5.2. Rotating Credentials
When rotating database strings or API tokens:
1. Update secrets in Render Dashboard (or Vercel Dashboard for frontend keys).
2. Render automatically triggers a rolling deployment.
3. Test `/health/deep` to confirm the new credentials connect cleanly before marking the maintenance window complete.
