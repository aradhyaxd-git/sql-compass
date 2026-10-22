# SQL Compass

SQL Compass is a production-grade, full-stack SQL learning and interview preparation platform featuring an isolated execution sandbox, automated reference evaluation, and an AI-powered pedagogical hint graph.

---

## Key Features

- **Curated Interview Curriculum**: 39 progressive challenges across 7 categories, covering basic queries, aggregates, multi-table joins, subqueries, window functions (`DENSE_RANK`, `LAG`), set operations (`UNION ALL`), and DML operations (`DELETE ... RETURNING`, `UPDATE ... RETURNING`).
- **Deterministic SQL Sandbox**: Secure, query-level AST parsing powered by `pgsql-ast-parser`. Enforces statement limits, execution timeouts, table denylists (`pg_stat_activity`, `pg_shadow`), and blocks dangerous internal functions.
- **Transactional DML Sandbox**: Write operations run inside ephemeral `BEGIN ... ROLLBACK` transactions, allowing users to practice modifications without mutating shared persistent tables.
- **Order-Aware Reference Judge**: Normalizes, types, and compares user execution results against reference query outputs with configurable positional ordering and multiset validation.
- **Pedagogical Hint Graph**: Progressive, multi-tiered AI guidance (Level 1: Directional nudge, Level 2: Clause syntax scaffold, Level 3: Conceptual breakdown) with solution leak prevention.
- **In-Memory Caching and Rate Limiting**: Built-in TTL-based query reference caching, hint caching, single-query concurrency guards, and per-user endpoint rate limiters without mandatory external dependencies.
- **Observability and Security**: Structured Winston JSON logging with correlation IDs, Prometheus metrics endpoint (`/metrics`), deep readiness health checks (`/health/deep`), strict CORS, and hardened security headers.

---

## Tech Stack

### Frontend (`client/`)
- **Framework**: React 19, TypeScript
- **Bundler & Dev Server**: Vite 7
- **Styling**: Tailwind CSS v4
- **Editor**: CodeMirror 6 with SQL language grammar and OneDark theme
- **State & Data Fetching**: TanStack React Query v5
- **Authentication**: Clerk React SDK
- **Animation & UI**: Framer Motion, Lucide React

### Backend (`backend/`)
- **Runtime**: Node.js 22 LTS, TypeScript
- **Web Framework**: Express.js
- **SQL Parser**: `pgsql-ast-parser`
- **Database Clients**: `pg` (PostgreSQL sandbox), `mongoose` (MongoDB persistence)
- **AI / LangGraph**: `@langchain/google-genai` (Gemini 2.0 Flash), `@langchain/langgraph`
- **Security & Limiting**: `@clerk/backend`, `express-rate-limit`, `cors`
- **Logging & Metrics**: `winston`, Prometheus metrics exporter

### Infrastructure
- **Frontend Hosting**: Vercel (Single Page Application with client rewrites)
- **Backend Hosting**: Render (Node.js Web Service)
- **PostgreSQL Sandbox**: Neon Serverless PostgreSQL or local PostgreSQL
- **Persistence Store**: MongoDB Atlas (Assignments, User Stats, Attempt History)

---

## System Architecture

```
                      +-----------------------------+
                      |   Vercel: React 19 Client   |
                      |  CodeMirror 6 + Clerk Auth  |
                      +--------------+--------------+
                                     |
                                     | HTTPS / JSON
                                     v
                      +-----------------------------+
                      |   Render: Express Backend   |
                      |  Security Headers & RateLim |
                      +--------------+--------------+
                                     |
         +---------------------------+---------------------------+
         |                           |                           |
         v                           v                           v
+------------------+       +-------------------+       +-------------------+
|  AST Sanitizer   |       |    Judge Engine   |       |    Hint Graph     |
| pgsql-ast-parser |       | Result Normalizer |       |  LangGraph Agent  |
+--------+---------+       +---------+---------+       +---------+---------+
         |                           |                           |
         v                           v                           v
+------------------+       +-------------------+       +-------------------+
|  Postgres Sandbox|       |   Postgres Pool   |       |  Gemini 2.0 API   |
| Read / Rollback  |       | Reference Queries |       | Safe Hint Output  |
+------------------+       +-------------------+       +-------------------+
```

---

## Local Development Setup

### Prerequisites
- Node.js 20+ (Node.js 22 LTS recommended)
- PostgreSQL (local instance or Neon connection string)
- MongoDB (local instance or MongoDB Atlas URI)
- Clerk API Keys (publishable key and secret key)
- Google Gemini API Key

### 1. Clone Repository
```bash
git clone https://github.com/aradhyaxd-git/sql-compass.git
cd sql-compass
```

### 2. Configure Backend Environment
Create `backend/.env`:
```env
PORT=6000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...

# Databases
MONGO_URI=mongodb://localhost:27017/sqlcompass
NEON_DATABASE_URL=postgres://user:password@localhost:5432/sqlcompass_sandbox
SANDBOX_RO_URL=postgres://user:password@localhost:5432/sqlcompass_sandbox

# AI Hint Engine
GEMINI_API_KEY=AIzaSy...
HINT_GRAPH=true
HINT_CACHE_TTL_SECONDS=600
```

### 3. Configure Frontend Environment
Create `client/.env`:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_BASE_URL=
```
Note: In local development, leaving `VITE_API_BASE_URL` empty routes requests through Vite's development proxy to `http://localhost:6000`.

### 4. Install Dependencies & Build
```bash
# Install backend dependencies
cd backend
npm install
npm run build

# Seed database with 39 interview challenges
npm run seed

# Run test suites
npm test

# Start backend server
npm run dev
```

In a separate terminal:
```bash
# Install client dependencies & start dev server
cd client
npm install
npm run dev
```
Access the application at `http://localhost:5173`.

---

## Testing & Quality Gates

The backend includes 9 automated verification suites:

```bash
cd backend
npm test
```

Verification includes:
1. `sqlSanitizer.test.ts`: Legitimate query parsing, comment stripping, AST validation, and injection prevention.
2. `judgeService.test.ts`: Unordered multiset matching, order-dependent validation, and null-tolerant comparison.
3. `hintCacheService.test.ts`: SHA-256 query hashing, TTL expiration, and entry eviction.
4. `concurrencyGuard.test.ts`: Single-query per-user locking and race condition protection.
5. `dialectLinter.test.ts`: Cross-dialect translation hints (MySQL/SQL Server to PostgreSQL).
6. `metricsService.test.ts`: Prometheus metrics calculation.
7. `writeSandbox.test.ts`: Ephemeral rollback verification on `UPDATE` and `DELETE` queries.
8. `mcpServer.test.ts`: Model Context Protocol JSON-RPC tool endpoints.
9. `securityHardening.test.ts`: Malformed cookie crash resilience, CORS validation, and result payload budget enforcement.

---

## Production Deployment

### Frontend on Vercel
1. Import the repository on [Vercel](https://vercel.com).
2. Set **Root Directory** to `client`.
3. Set **Framework Preset** to `Vite`.
4. Configure Environment Variables:
   - `VITE_CLERK_PUBLISHABLE_KEY`: Clerk publishable key.
   - `VITE_API_BASE_URL`: Full URL of the deployed Render backend (e.g., `https://sql-compass-api.onrender.com`).
5. Deploy. Routing rewrites are handled by [`client/vercel.json`](./client/vercel.json).

### Backend on Render
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect the repository and configure:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. Configure Environment Variables:
   - `NODE_ENV`: `production`
   - `CLIENT_ORIGIN`: Your production Vercel frontend URL (e.g., `https://your-app.vercel.app`).
   - `CLERK_SECRET_KEY`: Clerk secret key.
   - `CLERK_PUBLISHABLE_KEY`: Clerk publishable key.
   - `MONGO_URI`: MongoDB Atlas connection string.
   - `NEON_DATABASE_URL`: Neon PostgreSQL sandbox connection string.
   - `SANDBOX_RO_URL`: Neon PostgreSQL read-only connection string.
   - `GEMINI_API_KEY`: Google Gemini API key.
   - `HINT_GRAPH`: `true`
   - `HINT_CACHE_TTL_SECONDS`: `600`
4. The service will automatically listen on the port injected by Render via `process.env.PORT`.

---

## Documentation Index

- [Architecture Reference](./docs/architecture.md): Comprehensive system design, data flows, and security model.
- [API Reference](./docs/api-reference.md): REST endpoint contracts, schemas, and error responses.
- [Deployment Guide](./docs/deployment.md): Step-by-step production operations and platform configuration.
- [Operations Runbook](./docs/runbook.md): Health monitoring, alerts, failure recovery, and diagnostic procedures.
- [Interview & System Design Guide](./docs/interview-guide.md): Technical deep-dives, trade-offs, and behavioral talking points.

---

## License

This project is licensed under the MIT License.
