import { parse, type Statement } from 'pgsql-ast-parser'

const DANGEROUS_FUNCTIONS = new Set([
  'pg_sleep',
  'set_config',
  'pg_read_file',
  'pg_write_file',
  'pg_read_binary_file',
  'pg_ls_dir',
  'pg_stat_file',
  'current_setting',
  'lo_import',
  'lo_export',
  'dblink',
  'dblink_exec',
  'query_to_xml',
  'pg_backend_pid',
  'pg_terminate_backend',
  'pg_cancel_backend',
])

const MAX_QUERY_LENGTH = 4000

export interface SanitizeResult {
  safe: boolean
  reason?: string
}

function findDangerousFunction(node: unknown): string | null {
  if (!node || typeof node !== 'object') {
    return null
  }

  const record = node as Record<string, unknown>

  if (record.type === 'call' && record.function && typeof record.function === 'object') {
    const fnObj = record.function as Record<string, unknown>
    if (typeof fnObj.name === 'string') {
      const fnName = fnObj.name.toLowerCase()
      if (DANGEROUS_FUNCTIONS.has(fnName)) {
        return fnName
      }
    }
  }

  for (const key of Object.keys(record)) {
    const dangerous = findDangerousFunction(record[key])
    if (dangerous) {
      return dangerous
    }
  }

  return null
}

export function sanitizeSQL(sql: string): SanitizeResult {
  if (!sql || sql.trim().length === 0) {
    return { safe: false, reason: 'Query is empty' }
  }

  if (sql.length > MAX_QUERY_LENGTH) {
    return {
      safe: false,
      reason: `Query exceeds maximum length of ${MAX_QUERY_LENGTH} characters`,
    }
  }

  let ast: Statement[]
  try {
    ast = parse(sql)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return {
      safe: false,
      reason: `SQL syntax or parsing error: ${msg}`,
    }
  }

  if (!ast || ast.length === 0) {
    return { safe: false, reason: 'No executable SQL statement found' }
  }

  if (ast.length > 1) {
    return {
      safe: false,
      reason: 'Multiple statements are not permitted. Execute exactly one query.',
    }
  }

  const statement = ast[0]
  if (statement.type !== 'select' && statement.type !== 'with') {
    return {
      safe: false,
      reason: `Only read-only SELECT or WITH statements are allowed. Encountered: ${statement.type.toUpperCase()}`,
    }
  }

  const dangerousFn = findDangerousFunction(statement)
  if (dangerousFn) {
    return {
      safe: false,
      reason: `Call to restricted function '${dangerousFn}' is blocked`,
    }
  }

  return { safe: true }
}