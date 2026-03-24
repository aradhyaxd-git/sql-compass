const BLOCKED_KEYWORDS = [
  'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
  'TRUNCATE', 'GRANT', 'REVOKE', 'EXECUTE', 'EXEC',
  'pg_', 'information_schema', 'pg_catalog',
  '--', '/*', '*/',
]

const MAX_QUERY_LENGTH = 2000

export interface SanitizeResult {
  safe: boolean
  reason?: string
}

export function sanitizeSQL(sql: string): SanitizeResult {
  if (!sql || sql.trim().length === 0) {
    return { safe: false, reason: 'Query is empty' }
  }

  if (sql.length >MAX_QUERY_LENGTH) {
    return { safe: false, reason: `Query exceeds maximum length of ${MAX_QUERY_LENGTH} characters` }
  }

  const normalized = sql.trim().toUpperCase()

  if (!normalized.startsWith('SELECT') && !normalized.startsWith('WITH')) {
    return {
      safe: false,
      reason: 'Only SELECT queries are allowed in the sandbox',
    }
  }

  
  for (const keyword of BLOCKED_KEYWORDS) {
    if (normalized.includes(keyword.toUpperCase())) {
      return {
        safe: false,
        reason: `Query contains blocked keyword: ${keyword}`,
      }
    }
  }

  return { safe: true }
}