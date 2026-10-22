# Interview Preparation & System Design Deep-Dive

This guide prepares engineers to discuss SQL Compass in technical interviews, system design rounds, and behavioral engineering discussions.

---

## 1. System Design Walkthrough: End-to-End Query Lifecycle

### Question: "Walk me through what happens when a student writes and executes a SQL query."

### Answer:
The query lifecycle spans three distinct execution stages: client dispatch, safety and sandboxing, and evaluation and persistence.

#### Stage 1: Client Dispatch
1. The student enters SQL in CodeMirror 6 (configured with SQL language grammar and OneDark theme).
2. The user triggers execution (click or keyboard shortcut).
3. The client's `useQueryExecution` hook invokes TanStack Query mutation with payload `{ assignmentId, sql }`.
4. Axios interceptors inject the authenticated Clerk JWT Bearer token into the `Authorization` header.

#### Stage 2: Gateway & Safety Pipeline
1. **API Gateway**: Express receives `POST /api/execute`.
2. **Authentication Middleware**: `@clerk/backend` verifies token signature, checks authorized parties, and binds `req.userId`.
3. **Rate Limiting**: `queryLimiter` verifies the user has not exceeded 20 queries per 5 minutes.
4. **Concurrency Guard**: `concurrencyGuard` locks the user's ID in an in-memory `Set`. If a query is already running, the server rejects immediately with HTTP 429.
5. **AST Sanitization (`pgsql-ast-parser`)**:
   - Rejects queries exceeding 10,000 characters.
   - Enforces exactly one statement (rejects stacked semicolons).
   - Traverses the AST to ensure only `SELECT`, `WITH`, or sandboxed `INSERT`/`UPDATE`/`DELETE` exist.
   - Blocks dangerous system functions (`pg_sleep`, `set_config`, file I/O, process termination, advisory locks).
   - Blocks access to system catalog tables (`pg_stat_activity`, `pg_shadow`, `pg_authid`).
6. **Execution Sandbox**:
   - Read queries run directly with a 5,000 ms statement timeout.
   - Write queries run inside an isolated `BEGIN ... ROLLBACK` block with `SET LOCAL statement_timeout = '5000'`.
7. **Payload Budgeting (`validateAndFormatResults`)**:
   - Caps result rows at 500.
   - Accumulates byte sizes and aborts if payload exceeds 2 MB, preventing server RSS exhaustion.

#### Stage 3: Evaluation & Persistence
1. **Reference Judge (`judgeService`)**:
   - Retrieves the cached reference result (from an in-memory TTL map) or queries PostgreSQL.
   - If `orderMatters: false`, performs `O(N)` multiset frequency matching with type-tolerant normalization (e.g. numeric casting and UTC timestamp parsing).
   - If `orderMatters: true`, validates rows index-for-index.
2. **Persistence (`attemptService`)**:
   - Saves flight log record in MongoDB (`status`, `rowCount`, `correct`, `verdictReason`).
   - If correct, awards XP and updates user level and solve streaks.
3. **Response**: Client receives formatted columns, rows, execution duration, judge verdict, and XP delta.

---

## 2. Technical Architectural Trade-Offs

### 2.1. AST Parsing vs Regular Expressions
- **The Problem**: Regex-based SQL sanitization (e.g., checking for `DROP` or `DELETE` keywords) is trivial to bypass using multi-line comments (`DROP/**/TABLE`), nested subqueries, hexadecimal literals, or whitespace tricks.
- **The Solution**: We integrated `pgsql-ast-parser` to parse statements into a formal Abstract Syntax Tree. We inspect the root statement type, recursively validate all clauses in `UNION ALL` or `WITH` queries, and inspect every function call and table reference directly on AST nodes.

### 2.2. In-Memory Store vs External Redis for Single-Instance Hosting
- **The Problem**: A distributed Redis cluster adds operational cost, network hops, and connection pooling complexity.
- **The Solution**: For a single Node.js instance on Render, we use in-process structures:
  - `Map<string, CachedHint>` with SHA-256 query hashes and FIFO eviction.
  - `Map<string, CacheEntry>` with 15-minute TTL for reference answers.
  - `Set<string>` for the concurrency guard.
- **Trade-Off Discussed in Interview**: Explain that in-memory structures provide sub-millisecond retrieval with zero external dependencies. If the platform needs to scale horizontally across multiple container replicas, an abstraction layer can swap these stores to Redis or Upstash Redis using `REDIS_URL` without altering core business logic.

### 2.3. Transaction Rollback Sandboxing
- **The Problem**: Allowing students to run `DELETE` or `UPDATE` queries on practice tables could wipe or corrupt shared data for other users.
- **The Solution**: We wrap all write operations in an explicit PostgreSQL transaction with a `ROLLBACK` in the `finally` block. By requiring a `RETURNING` clause, users inspect the exact records their statement affected without persisting changes to the table.

---

## 3. Behavioral & Engineering Incident Retrospectives

### Story 1: Pre-Launch Security Audit & Process Crash Bug (SC-01)
- **Situation**: During a pre-launch vulnerability audit, we discovered that sending a malformed URL-encoded cookie (`__session=%E0%A4%A`) triggered an unhandled `URIError` in `decodeURIComponent` inside our authentication middleware.
- **Task**: Prevent the unhandled rejection from crashing the Node.js API process.
- **Action**: We wrapped token extraction in defensive `try/catch` blocks, gracefully falling back to Bearer tokens and returning HTTP 401 instead of crashing. We also installed global `unhandledRejection` and `uncaughtException` monitors on the Express process.
- **Result**: Zero API process crashes under malformed requests; confirmed with automated regression tests.

### Story 2: Preventing Server Memory Exhaustion (SC-03)
- **Situation**: Queries like `SELECT repeat('A', 40000000)` or `INSERT ... RETURNING *` bypassed row caps and caused Node.js RSS memory to spike by over 300 MB per request, risking OOM termination on 512 MB containers.
- **Task**: Bound memory allocation across all query execution paths.
- **Action**: Implemented `validateAndFormatResults`, which inspects string and scalar byte lengths during array formatting. If memory exceeds 2 MB or row count exceeds 500, execution aborts with a clear, actionable error.
- **Result**: Memory consumption remains predictable under arbitrary student queries, preserving API stability.

### Story 3: Multi-Tier Pedagogical Hint Pipeline
- **Situation**: Naive single-prompt LLM hints frequently leaked the exact solution query, defeating the educational purpose.
- **Task**: Provide escalating guidance without giving away answers.
- **Action**: Designed a LangGraph state machine with three explicit levels:
  - Level 1: Conceptual hints focusing on table relationships and strategy.
  - Level 2: Clause syntax scaffolding (e.g. suggesting specific join keys or window partitioning).
  - Level 3: Near-solution structural guidance protected by a solution leak guard that scans the generated output against the reference query.
- **Result**: Students receive progressive nudges that encourage active problem-solving while preserving curriculum integrity.

---

## 4. Key SQL Patterns in the Curriculum

Be prepared to explain these core interview patterns covered in the 39 challenges:

1. **Window Functions**:
   - `DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC)` vs `RANK()` and `ROW_NUMBER()`.
   - `LAG(total_amount) OVER (PARTITION BY customer_id ORDER BY order_date ASC)` for consecutive value comparisons.
2. **Self-Joins**:
   - Joining a table to itself (`employees e1 JOIN employees e2 ON e1.manager_id = e2.id`) to compare hierarchical relationships.
3. **Aggregations & Filtering**:
   - `WHERE` (filters rows before aggregation) vs `HAVING` (filters groups after aggregation).
   - `COUNT(*)` vs `COUNT(column_name)` (handling of nulls).
4. **Set Operations**:
   - `UNION ALL` (concatenates result sets without deduplication overhead) vs `UNION` (performs duplicate elimination).
5. **DML with RETURNING**:
   - `DELETE FROM customers WHERE id NOT IN (...) RETURNING id, email` to inspect mutated rows in transaction sandboxes.
