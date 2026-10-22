const MAJOR_CLAUSES = [
  'SELECT',
  'FROM',
  'WHERE',
  'GROUP BY',
  'HAVING',
  'ORDER BY',
  'LIMIT',
  'OFFSET',
  'LEFT JOIN',
  'RIGHT JOIN',
  'INNER JOIN',
  'FULL JOIN',
  'CROSS JOIN',
  'JOIN',
  'UNION ALL',
  'UNION',
  'WITH',
]

const KEYWORDS = [
  ...MAJOR_CLAUSES,
  'AS',
  'AND',
  'OR',
  'ON',
  'IN',
  'IS',
  'NOT',
  'NULL',
  'DISTINCT',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END',
  'BETWEEN',
  'LIKE',
  'ILIKE',
  'ASC',
  'DESC',
  'COUNT',
  'SUM',
  'AVG',
  'MIN',
  'MAX',
  'ROUND',
  'EXTRACT',
]

export function formatSql(sql: string): string {
  if (!sql || !sql.trim()) return sql

  // Protect string literals
  const stringLiterals: string[] = []
  const tokenized = sql.replace(/'(?:''|[^'])*'/g, (match) => {
    stringLiterals.push(match)
    return `__STR_LITERAL_${stringLiterals.length - 1}__`
  })

  // Normalize whitespace
  let clean = tokenized.replace(/\s+/g, ' ').trim()

  // Format multi-word clauses first
  const multiWords = ['GROUP BY', 'ORDER BY', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN', 'CROSS JOIN', 'UNION ALL']
  for (const mw of multiWords) {
    const re = new RegExp(`\\b${mw.replace(' ', '\\s+')}\\b`, 'gi')
    clean = clean.replace(re, `\n${mw}`)
  }

  // Format single-word major clauses
  const singleMajor = ['SELECT', 'FROM', 'WHERE', 'HAVING', 'LIMIT', 'OFFSET', 'JOIN', 'WITH', 'UNION']
  for (const sw of singleMajor) {
    const re = new RegExp(`\\b${sw}\\b`, 'gi')
    clean = clean.replace(re, (_, offset) => {
      // Don't prefix newline if it's already at start or after a newline
      if (offset === 0) return sw.toUpperCase()
      return `\n${sw.toUpperCase()}`
    })
  }

  // Capitalize other keywords
  for (const kw of KEYWORDS) {
    if (multiWords.includes(kw) || singleMajor.includes(kw)) continue
    const re = new RegExp(`\\b${kw}\\b`, 'gi')
    clean = clean.replace(re, kw.toUpperCase())
  }

  // Re-indent lines
  const lines = clean.split('\n').map((l) => l.trim()).filter(Boolean)
  const formatted = lines.map((line, idx) => {
    if (idx === 0) return line
    const isMajor = MAJOR_CLAUSES.some((clause) => line.toUpperCase().startsWith(clause))
    return isMajor ? line : `  ${line}`
  }).join('\n')

  // Restore string literals
  return formatted.replace(/__STR_LITERAL_(\d+)__/g, (_, idx) => {
    return stringLiterals[Number(idx)] || ''
  })
}
