# API Reference Documentation

## Overview

SQL Compass API is a RESTful API built with Express.js that provides SQL execution, hint generation, and user progress tracking.

**Base URL**: `http://localhost:5000/api`

**Authentication**: All endpoints require Clerk JWT token in `Authorization` header
```
Authorization: Bearer <clerk_jwt_token>
```

**Response Format**: All responses are JSON with structure:
```json
{
  "status": "success" | "error",
  "data": {},
  "error": "Error message if status=error"
}
```

---

## Authentication

### Clerk JWT Verification

The `auth` middleware verifies all requests:

```javascript
// middleware/auth.ts
import { clerkClient } from '@clerk/express';

export const verifyAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  try {
    const decoded = await clerkClient.verifyToken(token);
    req.user = { id: decoded.sub, email: decoded.email };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Token valid but user lacks permission

---

## Rate Limiting

All endpoints are protected with rate limiting:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/query` | 20 requests | 5 minutes |
| `/api/hints` | 10 requests | 10 minutes |
| `/api/assignments` | 100 requests | 10 minutes |
| `/api/profile/*` | 50 requests | 10 minutes |

Rate limit headers in response:
```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 18
X-RateLimit-Reset: 1711353600
```

**Rate Limit Exceeded** (429):
```json
{
  "error": "Too many requests. Try again after 5 minutes.",
  "retryAfter": 300
}
```

---

## Endpoints

### 1. GET /assignments

Fetch all SQL practice assignments.

**Authentication**: Required

**Query Parameters**: None

**Response (200 OK)**:
```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "List All Employees",
      "description": "Retrieve the names and departments of all employees...",
      "difficulty": "easy",
      "tags": ["SELECT", "FROM"],
      "tableNames": ["employees"],
      "createdAt": "2025-03-15T10:00:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Join Orders with Customers",
      "difficulty": "medium",
      "tags": ["JOIN", "SELECT"],
      "tableNames": ["orders", "customers"]
    }
  ]
}
```

**Error Response (500 Internal Server Error)**:
```json
{
  "status": "error",
  "error": "Failed to fetch assignments"
}
```

---

### 2. GET /assignments/:id

Fetch a single assignment with full schema details.

**Authentication**: Required

**Parameters**:
- `id` (path): Assignment ObjectID

**Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "List All Employees",
    "description": "Retrieve the names and departments...",
    "difficulty": "easy",
    "tags": ["SELECT"],
    "tableNames": ["employees"],
    "schemaDetails": [
      {
        "tableName": "employees",
        "columns": [
          {
            "name": "id",
            "type": "INTEGER",
            "nullable": false,
            "primaryKey": true
          },
          {
            "name": "name",
            "type": "VARCHAR(100)",
            "nullable": false
          },
          {
            "name": "department",
            "type": "VARCHAR(50)",
            "nullable": true
          }
        ],
        "sampleRows": [
          { "id": 1, "name": "Alice Johnson", "department": "Engineering" },
          { "id": 2, "name": "Bob Smith", "department": "Marketing" }
        ]
      }
    ]
  }
}
```

---

### 3. POST /query

Execute a SQL query against the PostgreSQL sandbox.

**Authentication**: Required

**Request Body**:
```json
{
  "query": "SELECT * FROM employees WHERE salary > 50000;",
  "assignmentId": "507f1f77bcf86cd799439011"
}
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Alice Johnson",
      "salary": 95000
    },
    {
      "id": 2,
      "name": "Bob Smith",
      "salary": 82000
    }
  ],
  "rowCount": 2,
  "duration": 45,
  "xpEarned": 20
}
```

**Error Response (200 with error status)**:
```json
{
  "status": "error",
  "data": [],
  "error": "column \"salary\" does not exist",
  "rowCount": 0,
  "duration": 12,
  "xpEarned": 0
}
```

**Rate Limited (429)**:
```json
{
  "status": "error",
  "error": "Too many requests. 20 queries per 5 minutes allowed.",
  "retryAfter": 285
}
```

**Validation Errors (400 Bad Request)**:
```json
{
  "status": "error",
  "error": "Query exceeds maximum length of 2000 characters"
}
```

---

### 4. POST /hints

Request an AI-generated hint for a query.

**Authentication**: Required

**Request Body**:
```json
{
  "assignmentId": "507f1f77bcf86cd799439011",
  "userQuery": "SELECT * FROM employees;",
  "dbSchema": "Table: employees (id INTEGER PRIMARY KEY, name VARCHAR(100), salary INTEGER)"
}
```

**Success Response (200 OK)**:
```json
{
  "status": "success",
  "hint": "You're selecting all columns from the employees table. Remember to use the WHERE clause to filter results. Try adding: WHERE salary > 50000",
  "success": true
}
```

**Error Response - User hasn't executed yet (400)**:
```json
{
  "status": "error",
  "error": "Please execute a query first before requesting hints"
}
```

**Error Response - Rate Limited (429)**:
```json
{
  "status": "error",
  "error": "Too many hint requests. Maximum 10 hints per 10 minutes.",
  "retryAfter": 600
}
```

**Error Response - LLM API Failure (503)**:
```json
{
  "status": "error",
  "error": "Hint service temporarily unavailable. Please try again later.",
  "fallbackHint": "Consider using the WHERE clause to filter your results."
}
```

---

### 5. GET /profile/stats

Fetch user statistics and progress.

**Authentication**: Required

**Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "userId": "user_2abc123def456",
    "email": "user@example.com",
    "totalXP": 280,
    "rank": "Learner",
    "successfulAttempts": 14,
    "totalAttempts": 32,
    "successRate": 43.75,
    "joinedDate": "2025-03-15T08:30:00Z",
    "nextRankXP": 300,
    "xpToNextRank": 20
  }
}
```

**Ranking System**:
- `0-99 XP`: Novice
- `100-299 XP`: Learner
- `300+ XP`: Master

---

### 6. GET /profile/attempts

Fetch user's attempt history (Flight Log).

**Authentication**: Required

**Query Parameters**:
- `limit` (optional, default=50): Max results to return
- `skip` (optional, default=0): Pagination offset
- `sortBy` (optional, default="recent"): "recent" | "xp" | "difficulty"

**Response (200 OK)**:
```json
{
  "status": "success",
  "data": {
    "attempts": [
      {
        "_id": "507f...",
        "assignmentTitle": "List All Employees",
        "assignmentDifficulty": "easy",
        "status": "success",
        "rowCount": 5,
        "executedAt": "2025-03-25T14:30:00Z",
        "xpEarned": 20,
        "query": "SELECT * FROM employees;",
        "duration": 45
      },
      {
        "_id": "508f...",
        "assignmentTitle": "Join Orders with Customers",
        "assignmentDifficulty": "medium",
        "status": "error",
        "error": "column \"price\" does not exist",
        "executedAt": "2025-03-25T13:15:00Z",
        "xpEarned": 0
      }
    ],
    "totalCount": 32,
    "page": 1,
    "totalPages": 1
  }
}
```

---

## Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 400 | Bad Request | Invalid query parameters or request body |
| 400 | Query exceeds max length | Query > 2000 characters |
| 401 | Unauthorized | Missing/invalid JWT token |
| 403 | Forbidden | User lacks permission for resource |
| 404 | Not Found | Assignment/resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded (see X-RateLimit headers) |
| 500 | Internal Server Error | Database error or unexpected fault |
| 503 | Service Unavailable | LLM API unreachable (hints) |

---

## Implementation Details

### Query Execution Flow

```typescript
// controllers/executionController.ts
export const executeQuery = async (req, res) => {
  try {
    const { query, assignmentId } = req.body;
    const userId = req.user.id;

    // 1. Validate
    if (!query || query.length > 2000) {
      return res.status(400).json({ 
        error: 'Query must be 1-2000 characters'
      });
    }

    // 2. Verify assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // 3. Execute query
    const startTime = Date.now();
    const result = await executionService.runQuery(query, assignmentId);
    const duration = Date.now() - startTime;

    // 4. Save attempt
    const xpEarned = result.status === 'success' ? 20 : 0;
    await attemptService.saveAttempt({
      userId,
      assignmentId,
      query,
      status: result.status,
      rowCount: result.data?.length || 0,
      xpEarned,
      error: result.error
    });

    // 5. Return response
    res.json({
      status: result.status,
      data: result.data || [],
      rowCount: result.data?.length || 0,
      duration,
      xpEarned
    });
  } catch (error) {
    // Save failed attempt
    await attemptService.saveAttempt({
      userId: req.user.id,
      assignmentId: req.body.assignmentId,
      status: 'error',
      error: 'Server error: ' + error.message,
      xpEarned: 0
    });

    res.status(500).json({
      status: 'error',
      error: 'Query execution failed'
    });
  }
};
```

### SQL Injection Prevention

```typescript
// services/sqlSanitizer.ts
export const sanitizeQuery = (query: string): boolean => {
  // Check for dangerous keywords (basic check)
  const dangerous = ['DROP', 'DELETE FROM', 'TRUNCATE', 'ALTER TABLE'];
  const upperQuery = query.toUpperCase();
  
  return !dangerous.some(keyword => upperQuery.includes(keyword));
};

// services/executionService.ts
export const runQuery = async (query, assignmentId) => {
  // Use parameterized queries (pg module handles this)
  const result = await pool.query(query, []);
  // Never build query strings manually!
};
```

### Attempt Recording

```typescript
// services/attemptService.ts
export const saveAttempt = async (attemptData) => {
  const attempt = new Attempt({
    userId: attemptData.userId,
    assignmentId: attemptData.assignmentId,
    query: attemptData.query,
    status: attemptData.status,
    rowCount: attemptData.rowCount,
    xpEarned: attemptData.xpEarned,
    executedAt: new Date()
  });

  await attempt.save();

  // Update user XP
  await User.updateOne(
    { _id: attemptData.userId },
    {
      $inc: { totalXP: attemptData.xpEarned },
      $set: { 
        rank: calculateRank(totalXP + attemptData.xpEarned)
      }
    },
    { upsert: true }
  );
};
```

---

## Testing with cURL

### Test Query Execution
```bash
curl -X POST http://localhost:5000/api/query \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT * FROM employees LIMIT 5;",
    "assignmentId": "507f1f77bcf86cd799439011"
  }'
```

### Test Hint Generation
```bash
curl -X POST http://localhost:5000/api/hints \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assignmentId": "507f1f77bcf86cd799439011",
    "userQuery": "SELECT * FROM employees;",
    "dbSchema": "employees(id, name, salary)"
  }'
```

### Test Rate Limiting
```bash
# Run 21 times in quick succession to trigger 429
for i in {1..21}; do
  curl -X POST http://localhost:5000/api/query \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"query":"SELECT 1;","assignmentId":"507f1f77bcf86cd799439011"}'
done
```

---

## Environment Variables

**Backend .env**:
```
# Server
PORT=5000
NODE_ENV=development

# Clerk Auth
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...

# Databases
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/sql-compass
POSTGRES_URL=postgresql://user:pass@ep-xxx.neon.tech/sql_practice

# Google AI
GOOGLE_API_KEY=AIzaSy...

# Rate Limiting
RATE_LIMIT_WINDOW_MS=300000
RATE_LIMIT_MAX_REQUESTS=20
HINT_RATE_LIMIT_WINDOW_MS=600000
HINT_RATE_LIMIT_MAX=10
```

**Frontend .env.local**:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:5000
```

---

## Monitoring & Observability

### Key Metrics to Track

1. **Query Execution**:
   - Average response time
   - Error rate
   - Errors by type (SQL syntax, connection, timeout)

2. **API Health**:
   - Requests per second
   - Rate limit violations
   - Authentication failures

3. **User Engagement**:
   - Active users
   - Assignments completed
   - Hints requested
   - XP distribution

4. **Infrastructure**:
   - Database connection count
   - Query execution duration
   - API response latency

### Logging Strategy

```typescript
// Log all query executions
logger.info('Query executed', {
  userId,
  assignmentId,
  status,
  duration,
  rowCount,
  timestamp
});

// Log errors
logger.error('Query failed', {
  userId,
  error: error.message,
  query: query.substring(0, 100), // First 100 chars only
  timestamp
});

// Log rate limit hits
logger.warn('Rate limit exceeded', {
  userId,
  endpoint,
  timestamp
});
```

---

## Version History

### v1.0.0 (Current)
- Basic query execution
- Hint generation (Gemini AI)
- User profiles with XP tracking
- Flight logs for attempt history

### v1.1.0 (Planned)
- Web notifications for achievements
- Query templates/favorites
- Collaborative editing
- Mobile app version

---

## Support & Troubleshooting

**Query Returns 0 rows:**
- Verify table exists: `\dt` in PostgreSQL
- Check WHERE conditions
- Use `LIMIT` to test: `SELECT * FROM table LIMIT 5;`

**Hint Generation Fails:**
- Check rate limit: `X-RateLimit-Remaining` header
- Google API quota exhausted (check credentials)
- Network connectivity to Google

**Authentication Error (401):**
- Verify JWT token is fresh
- Check Clerk secret key in `.env`
- Token may be expired (re-login)

**Rate Limit Error (429):**
- Wait for reset time in response
- Reduce request frequency
- Implement exponential backoff

---

## Contact & Support

- **GitHub Issues**: Report bugs
- **Email**: support@sqlcompass.dev
- **Discord**: [Join community server]
- **Email**: developer@sqlcompass.dev
