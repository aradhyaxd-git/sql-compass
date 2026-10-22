import { parse, type Statement } from 'pgsql-ast-parser'

const DANGEROUS_FUNCTIONS = new Set([
  'pg_sleep',
  'pg_sleep_for',
  'pg_sleep_until',
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
  'query_to_xml_and_xmlschema',
  'query_to_xmlschema',
  'cursor_to_xml',
  'cursor_to_xmlschema',
  'pg_backend_pid',
  'pg_terminate_backend',
  'pg_cancel_backend',
  'pg_advisory_lock',
  'pg_advisory_lock_shared',
  'pg_try_advisory_lock',
  'pg_try_advisory_lock_shared',
  'pg_advisory_xact_lock',
  'pg_advisory_xact_lock_shared',
  'pg_try_advisory_xact_lock',
  'pg_try_advisory_xact_lock_shared',
  'pg_advisory_unlock',
  'pg_advisory_unlock_all',
  'pg_advisory_unlock_shared',
])

const MAX_QUERY_LENGTH = 4000

export type StatementCategory = 'read' | 'write'

export interface SanitizeResult {
  safe: boolean
  reason?: string
  category?: StatementCategory
  statementType?: string
}

export interface SanitizeOptions {
  allowWriteSandbox?: boolean
}

const ALLOWED_WRITE_STATEMENTS = new Set([
  'insert',
  'update',
  'delete',
  'create table',
  'alter table',
  'create index',
  'drop table',
])

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

function checkStatementSafety(
  stmt: unknown,
  options: SanitizeOptions = {}
): { safe: boolean; reason?: string; category?: StatementCategory; statementType?: string } {
  if (!stmt || typeof stmt !== 'object') {
    return { safe: false, reason: 'Invalid statement node' }
  }

  const s = stmt as Record<string, unknown>
  const stmtType = String(s.type || '').toLowerCase()

  if (stmtType === 'select') {
    return { safe: true, category: 'read', statementType: 'select' }
  }

  if (stmtType === 'union' || stmtType === 'union all') {
    if (s.left && typeof s.left === 'object') {
      const leftCheck = checkStatementSafety(s.left, options)
      if (!leftCheck.safe) return leftCheck
    }
    if (s.right && typeof s.right === 'object') {
      const rightCheck = checkStatementSafety(s.right, options)
      if (!rightCheck.safe) return rightCheck
    }
    return { safe: true, category: 'read', statementType: stmtType }
  }

  if (stmtType === 'values') {
    return { safe: true, category: 'read', statementType: 'values' }
  }

  if (stmtType === 'with' || stmtType === 'with recursive') {
    if (s.in && typeof s.in === 'object') {
      const inCheck = checkStatementSafety(s.in, options)
      if (!inCheck.safe) {
        return inCheck
      }
    } else {
      return { safe: false, reason: 'WITH statement missing target SELECT' }
    }

    if (Array.isArray(s.bind)) {
      for (const item of s.bind) {
        if (item && typeof item === 'object' && item.statement) {
          const bindCheck = checkStatementSafety(item.statement, options)
          if (!bindCheck.safe) {
            return bindCheck
          }
        }
      }
    }

    return { safe: true, category: 'read', statementType: 'with' }
  }

  if (options.allowWriteSandbox && ALLOWED_WRITE_STATEMENTS.has(stmtType)) {
    return { safe: true, category: 'write', statementType: stmtType }
  }

  return {
    safe: false,
    reason: options.allowWriteSandbox
      ? `Statement type '${stmtType.toUpperCase() || 'UNKNOWN'}' is not permitted in sandbox.`
      : `Only read-only SELECT and WITH statements are allowed. Encountered: ${stmtType.toUpperCase() || 'UNKNOWN'}`,
  }
}

export function sanitizeSQL(sql: string, options: SanitizeOptions = {}): SanitizeResult {
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
  const safetyCheck = checkStatementSafety(statement, options)
  if (!safetyCheck.safe) {
    return safetyCheck
  }

  const dangerousFn = findDangerousFunction(statement)
  if (dangerousFn) {
    return {
      safe: false,
      reason: `Call to restricted function '${dangerousFn}' is blocked`,
    }
  }

  return {
    safe: true,
    category: safetyCheck.category ?? 'read',
    statementType: safetyCheck.statementType,
  }
}