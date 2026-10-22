# API Reference Documentation

## Overview

The SQL Compass API is a RESTful service built with Express.js and TypeScript. It coordinates database execution inside an isolated PostgreSQL sandbox, validates solutions against reference queries, serves progressive pedagogical hints via LangGraph, and records user XP and flight logs in MongoDB.

- **Default Local Base URL**: `http://localhost:6000/api`
- **Default Production Base URL**: `https://<render-service-name>.onrender.com/api`

---

## Authentication & Headers

Protected endpoints require a Clerk-issued JWT token passed in the standard `Authorization` header:

```http
Authorization: Bearer <clerk_session_jwt>
```

Authentication is verified using `@clerk/backend` with:
- Strict audience and origin checks (`authorizedParties: [CLIENT_ORIGIN]`).
- Safe cookie parsing resilient against malformed encoding attacks.
- Extraction of user identification into `req.userId`.

### Security Headers
Every HTTP response includes standard security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` (production only)

### Standard Response Structure

#### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Human-readable description of the error",
  "hint": "Optional dialect translation or guidance hint"
}
```

---

## Rate Limiting & Concurrency Controls

Endpoints are safeguarded by in-memory rate limiting and active execution guards:

| Endpoint | Target | Limit | Window | Store |
|---|---|---|---|---|
| Global (all routes) | IP address | 100 requests | 15 minutes | In-memory |
| `POST /api/execute` | User ID (or IP) | 20 executions | 5 minutes | In-memory |
| `POST /api/hints` | User ID (or IP) | 10 hints | 10 minutes | In-memory |
| Active Execution Guard | User ID (or IP) | 1 concurrent query | Lock duration | In-memory `Set` |

When a rate limit is exceeded, the server returns HTTP `429 Too Many Requests`:
```json
{
  "success": false,
  "message": "Too many requests. Please slow down and try again shortly."
}
```

When a user attempts to run a query while another query is already in-flight:
```json
{
  "success": false,
  "message": "A query is already executing for your account. Please wait for it to complete."
}
```

---

## Endpoints

### 1. Assignments

#### GET /api/assignments
Retrieves the complete catalog of practice assignments.

- **Authentication**: Optional (attaches user context if present)
- **Status Codes**: `200 OK`, `500 Internal Server Error`

**Response Example (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "6718a2bc5f1234567890abcd",
      "title": "Employees Earning More Than Their Managers",
      "difficulty": "easy",
      "description": "Find employees who earn more than their managers. Return the employee name under the alias Employee.",
      "tags": ["JOIN", "SELF JOIN", "WHERE"],
      "tableNames": ["employees"],
      "createdAt": "2026-10-22T08:00:00.000Z"
    }
  ]
}
```

---

#### GET /api/assignments/:id
Fetches details of a single assignment by its MongoDB ObjectId.

- **Authentication**: Optional
- **Path Parameters**:
  - `id` (string, required): 24-character hexadecimal MongoDB ObjectId.
- **Status Codes**: `200 OK`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`

**Response Example (200 OK)**:
```json
{
  "success": true,
  "data": {
    "_id": "6718a2bc5f1234567890abcd",
    "title": "Department Top Three Salaries",
    "difficulty": "hard",
    "description": "Find employees who earn top 3 unique salaries in each department.",
    "tags": ["DENSE_RANK", "WINDOW FUNCTION", "JOIN", "CTE"],
    "tableNames": ["employees", "departments"],
    "schemaDetails": "TABLE: EMPLOYEES\n...",
    "orderMatters": false,
    "createdAt": "2026-10-22T08:00:00.000Z",
    "updatedAt": "2026-10-22T08:00:00.000Z"
  }
}
```

---

#### GET /api/assignments/:id/schema
Fetches interactive schema metadata and sample rows for the database tables referenced by the assignment.

- **Authentication**: Optional
- **Path Parameters**:
  - `id` (string, required): 24-character hexadecimal MongoDB ObjectId.
- **Status Codes**: `200 OK`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`

**Response Example (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "tableName": "employees",
      "columns": [
        { "name": "id", "type": "integer", "nullable": false },
        { "name": "name", "type": "character varying", "nullable": false },
        { "name": "salary", "type": "integer", "nullable": false },
        { "name": "manager_id", "type": "integer", "nullable": true }
      ],
      "sampleRows": [
        { "id": 1, "name": "Joe", "salary": 70000, "manager_id": 3 },
        { "id": 2, "name": "Henry", "salary": 80000, "manager_id": 4 }
      ]
    }
  ]
}
```

---

### 2. Query Execution & Evaluation

#### POST /api/execute
Executes a SQL statement within the secure sandbox, compares the resulting dataset against the canonical solution, and updates user progress.

- **Authentication**: Required (`Bearer <token>`)
- **Rate Limit**: 20 requests per 5 minutes per user
- **Safety Constraints**:
  - Query length capped at 10,000 characters.
  - Multi-statement queries blocked.
  - Disallowed functions (`pg_sleep`, file/system functions) blocked via AST.
  - Restricted system tables (`pg_stat_activity`, `pg_shadow`, `pg_authid`) blocked.
  - Write queries executed inside ephemeral `BEGIN ... ROLLBACK` transactions.
  - Results capped at 500 rows and 2 MB memory payload budget.
- **Status Codes**: `200 OK`, `400 Bad Request`, `404 Not Found`, `429 Too Many Requests`, `500 Internal Server Error`

**Request Body**:
```json
{
  "assignmentId": "6718a2bc5f1234567890abcd",
  "sql": "SELECT e1.name AS \"Employee\" FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.id WHERE e1.salary > e2.salary"
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "columns": ["Employee"],
    "rows": [
      { "Employee": "Joe" }
    ],
    "rawTuples": [
      ["Joe"]
    ],
    "rowCount": 1,
    "duration": 18,
    "verdict": {
      "correct": true,
      "reason": "exact_match",
      "message": "Correct! Your query produced the expected results."
    },
    "xpEarned": 25
  }
}
```

**Syntax / Runtime Error Response (400 Bad Request)**:
```json
{
  "success": false,
  "message": "relation \"employee\" does not exist",
  "hint": "PostgreSQL table names are case-sensitive if quoted; did you mean 'employees'?"
}
```

---

### 3. Pedagogical Hints

#### POST /api/hints
Generates progressive, contextual AI hints using LangGraph and Gemini 2.0 Flash.

- **Authentication**: Required (`Bearer <token>`)
- **Rate Limit**: 10 requests per 10 minutes per user
- **Input Cap**: `currentQuery` capped at 4,000 characters.
- **Cache**: 10-minute in-memory TTL keyed by assignment, query hash, and level.
- **Status Codes**: `200 OK`, `400 Bad Request`, `404 Not Found`, `429 Too Many Requests`, `500 Internal Server Error`

**Request Body**:
```json
{
  "assignmentId": "6718a2bc5f1234567890abcd",
  "currentQuery": "SELECT name FROM employees WHERE salary > 50000",
  "level": 1
}
```

**Parameter Details**:
- `assignmentId` (string, required): Target assignment ObjectId.
- `currentQuery` (string, optional): Current SQL draft in the editor.
- `level` (number, optional, 1-3, default 1):
  - `1`: Directional nudge highlighting the conceptual strategy.
  - `2`: Syntactic scaffolding showing relevant clauses or joins without exact answers.
  - `3`: Near-solution conceptual breakdown with strict solution leak guard protection.

**Response Example (200 OK)**:
```json
{
  "success": true,
  "data": {
    "hint": "Consider how an employee record can be connected to another record in the same table using the manager_id field.",
    "level": 1,
    "errorClass": null,
    "concept": "Self-join on primary key and foreign key",
    "fromCache": false
  }
}
```

---

### 4. User Profile & Flight Log

#### GET /api/profile/stats
Fetches the current user's aggregated learning statistics, XP, and solve counts.

- **Authentication**: Required (`Bearer <token>`)
- **Status Codes**: `200 OK`, `500 Internal Server Error`

**Response Example (200 OK)**:
```json
{
  "success": true,
  "data": {
    "userId": "user_2test123",
    "totalXp": 450,
    "level": 3,
    "totalAttempts": 18,
    "successfulAttempts": 12,
    "completedAssignmentsCount": 10,
    "accuracy": 66.7,
    "streakDays": 4
  }
}
```

---

#### GET /api/profile/attempts
Retrieves the paginated flight log of execution attempts for the authenticated user.

- **Authentication**: Required (`Bearer <token>`)
- **Query Parameters**:
  - `assignmentId` (string, optional): Filter attempts by specific assignment ObjectId.
  - `limit` (number, optional, 1-100, default 20): Maximum records returned.
- **Status Codes**: `200 OK`, `500 Internal Server Error`

**Response Example (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "6718b5de9f22334455667788",
      "userId": "user_2test123",
      "assignmentId": "6718a2bc5f1234567890abcd",
      "assignmentTitle": "Employees Earning More Than Their Managers",
      "query": "SELECT e1.name AS \"Employee\" ...",
      "status": "success",
      "correct": true,
      "verdictReason": "exact_match",
      "rowCount": 1,
      "xpAwarded": 25,
      "createdAt": "2026-10-22T08:15:00.000Z"
    }
  ]
}
```

---

### 5. Health & Observability

#### GET /health
Basic liveness probe for load balancers.

- **Authentication**: None
- **Response**:
```json
{
  "status": "active",
  "timestamp": "2026-10-22T08:30:00.000Z"
}
```

---

#### GET /health/deep
Readiness probe testing live connections to PostgreSQL sandbox and MongoDB Atlas.

- **Authentication**: None (protected by global IP rate limiter)
- **Response**:
```json
{
  "status": "healthy",
  "checks": {
    "postgres": "ok",
    "mongodb": "ok",
    "server": "ok"
  },
  "timestamp": "2026-10-22T08:30:00.000Z"
}
```

---

#### GET /metrics
Prometheus metrics format exporter.

- **Authentication**: None (protected by global IP rate limiter)
- **Metrics Exported**:
  - `sqlcompass_http_requests_total`
  - `sqlcompass_query_executions_total`
  - `sqlcompass_query_success_total`
  - `sqlcompass_query_error_total`
  - `sqlcompass_concurrency_rejected_total`
  - `sqlcompass_verdicts_correct_total`
  - `sqlcompass_verdicts_incorrect_total`
  - `sqlcompass_hints_total`
  - `sqlcompass_hints_cached_total`
