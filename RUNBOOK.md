# SQL Compass — Production Deployment & Operations Runbook

This runbook guides engineers through deploying, operating, testing, and debugging the SQL Compass platform.

---

## 1. Architecture Overview

SQL Compass separates query execution and pedagogy into two distinct layers:
* **Deterministic Sandbox Layer (Node.js/Express + PostgreSQL):** Executes student queries with `BEGIN READ ONLY`, statement timeouts (5s), and AST static analysis (`pgsql-ast-parser`). Query correctness is verified positionally and as an unordered multiset against reference solutions.
* **Agentic Pedagogy Layer (LangGraph.js + Gemini):** Multi-step stateful graph managing error classification, 3-tier escalating hints (Nudge $\rightarrow$ Concept $\rightarrow$ Near-Solution), and an executable solution leak guard.
* **Dual Persistence:**
  * **PostgreSQL:** Isolated schema tables for student practice.
  * **MongoDB:** User profiles, attempts, and LangGraph checkpointer state.

---

## 2. Quickstart Deployment

### Option A: 1-Command Startup with Docker Compose
```bash
# Start backend, postgres, and mongodb containers
docker compose up -d

# Verify health status
curl http://localhost:5000/health/deep
```

### Option B: Local Development
```bash
# 1. Install dependencies
cd backend
npm install

# 2. Configure environment
cp .env.example .env
# Fill in MONGO_URI, NEON_DATABASE_URL, and LLM_API_KEY

# 3. Seed challenges & reference queries
npm run seed

# 4. Start backend
npm run dev
```

---

## 3. Health Checks & Diagnostics

### Standard Liveness Check
```bash
GET /health
```
Response:
```json
{
  "status": "active",
  "timestamp": "2026-10-11T12:00:00.000Z"
}
```

### Deep Readiness & Dependency Check
```bash
GET /health/deep
```
Response:
```json
{
  "status": "healthy",
  "checks": {
    "postgres": "ok",
    "mongodb": "ok",
    "server": "ok"
  },
  "timestamp": "2026-10-11T12:00:00.000Z"
}
```

---

## 4. Testing & CI Gates

Run the verification suites locally or in CI:

```bash
# 1. Unit Tests (AST Sanitizer, Judge Engine, Hint Cache)
npm test

# 2. Evaluation Suite (40-case golden benchmark)
npm run eval
```

### CI Gate Thresholds:
* **Leak Rate:** $\le 3.0\%$
* **Level 1 Length Compliance:** $\ge 95.0\%$
* **Concept Hit Rate:** $\ge 70.0\%$
* **p95 Latency:** $\le 6,000\text{ ms}$

---

## 5. Operations & Incident Runbook

### Issue 1: High Leak-Guard Retry Alerts (> 20%)
* **Symptom:** Hint latency increases; users report delay in receiving hints.
* **Diagnosis:** Model is outputting query solutions inside prompts that trigger the Leak Guard.
* **Remediation:** Check `backend/src/prompts/hintPrompts.ts`. Verify that negative constraints are enforced and temperature for `classify` and `judge` is pinned at `0.0`.

### Issue 2: Students Blocked by Rate Limiting in Shared Networks
* **Symptom:** `429 Too Many Requests` on `/api/hints`.
* **Resolution:** Ensure `requireAuth` is mounted before `hintLimiter` in `hintRouter.ts`. The limiter keys on `req.userId` rather than shared IP addresses.

### Issue 3: Runaway Queries or Locked Database Connections
* **Symptom:** Postgres connection pool exhaustion.
* **Mitigation:** The engine enforces `statement_timeout = '5000'` and `Promise.race()` wrappers. Check `pg_stat_activity` if orphaned connections persist:
```sql
SELECT pid, query, state, age(clock_timestamp(), query_start) 
FROM pg_stat_activity 
WHERE state != 'idle';
```
