import { motion } from 'framer-motion'
import { C, F } from './landingTokens'

const TICKER_ITEMS = [
  'SELECT',
  'FROM',
  'WHERE',
  'JOIN',
  'GROUP BY',
  'ORDER BY',
  'HAVING',
  'INNER JOIN',
  'LEFT JOIN',
  'WINDOW',
  'OVER',
  'PARTITION BY',
  'CTE',
  'UNION',
  'DISTINCT',
  'COUNT(*)',
  'AVG()',
  'MAX()',
  'MIN()',
  'SUM()',
  'RANK()',
  'ROW_NUMBER()',
  'COALESCE',
  'CASE WHEN',
  'INDEX',
  'EXPLAIN',
]

export default function SQLTicker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <div
      style={{
        overflow: 'hidden',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        padding: '10px 0',
        background: 'rgba(8,8,15,0.6)',
      }}
    >
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        style={{
          display: 'flex',
          gap: 0,
          whiteSpace: 'nowrap',
          width: 'max-content',
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            style={{
              fontFamily: F.sql,
              fontSize: 11,
              color: i % 7 === 0 ? C.pLight : i % 5 === 0 ? C.signal : C.t3,
              padding: '0 24px',
              letterSpacing: '0.08em',
              borderRight: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  )
}
