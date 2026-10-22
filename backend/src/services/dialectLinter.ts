export interface DialectDiagnostic {
  pattern: RegExp
  dialect: 'MySQL' | 'SQLite' | 'Oracle' | 'SQL Server'
  message: string
}

const DIALECT_RULES: DialectDiagnostic[] = [
  {
    pattern: /\bIFNULL\s*\(/i,
    dialect: 'MySQL',
    message: 'IFNULL() is MySQL syntax. In PostgreSQL, use COALESCE(val, default).',
  },
  {
    pattern: /\bNVL\s*\(/i,
    dialect: 'Oracle',
    message: 'NVL() is Oracle syntax. In PostgreSQL, use COALESCE(val, default).',
  },
  {
    pattern: /\bLIMIT\s+\d+\s*,\s*\d+/i,
    dialect: 'MySQL',
    message: 'LIMIT offset, count is MySQL syntax. In PostgreSQL, use LIMIT count OFFSET offset.',
  },
  {
    pattern: /\bGROUP_CONCAT\s*\(/i,
    dialect: 'MySQL',
    message: 'GROUP_CONCAT() is MySQL/SQLite syntax. In PostgreSQL, use STRING_AGG(expression, delimiter).',
  },
  {
    pattern: /`[^`]+`/,
    dialect: 'MySQL',
    message: 'Backticks are MySQL identifier quotes. In PostgreSQL and ANSI SQL, use double quotes ("identifier").',
  },
  {
    pattern: /\bCURDATE\s*\(\s*\)/i,
    dialect: 'MySQL',
    message: 'CURDATE() is MySQL syntax. In PostgreSQL, use CURRENT_DATE.',
  },
  {
    pattern: /\bDATE_ADD\s*\(/i,
    dialect: 'MySQL',
    message: "DATE_ADD() is MySQL syntax. In PostgreSQL, use date + INTERVAL '1 day'.",
  },
  {
    pattern: /\bDATE_SUB\s*\(/i,
    dialect: 'MySQL',
    message: "DATE_SUB() is MySQL syntax. In PostgreSQL, use date - INTERVAL '1 day'.",
  },
]

export function checkDialectCompatibility(sql: string): {
  hasDialectIssue: boolean
  hints: string[]
} {
  const hints: string[] = []

  for (const rule of DIALECT_RULES) {
    if (rule.pattern.test(sql)) {
      hints.push(rule.message)
    }
  }

  return {
    hasDialectIssue: hints.length > 0,
    hints,
  }
}
