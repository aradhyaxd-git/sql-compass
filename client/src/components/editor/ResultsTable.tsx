import { motion } from 'framer-motion'
import type { QueryState } from '@/types/query.types'

const D = {
  hull:'#090914',
  deck:'#0e0e1c',
  border: 'rgba(255,255,255,0.07)',
  t1:'#f1f5f9',
  t2:'#94a3b8',
  t3:'#4a5568',
  t4:'#1e2a40',
  online: '#10d98a',
  alert: '#fb7185',
  mono:"'JetBrains Mono', monospace",
  body:"'DM Sans', sans-serif",
}

function ErrorMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={D.alert} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}

function IdleState() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10 }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={D.t4} strokeWidth="1.5" strokeLinecap="round">
        <polygon points="5,3 19,12 5,21"/>
      </svg>
      <span style={{ fontFamily: D.mono, fontSize: 10, color: D.t4, letterSpacing: '0.1em' }}>
        RUN A QUERY TO SEE RESULTS
      </span>
    </div>
  )
}

function ExecutingState() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0,1,2].map(i => (
          <motion.div key={i}
            animate={{ opacity: [0.2, 1, 0.2], scaleY: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            style={{ width: 3, height: 14, borderRadius: 2, background: D.online, transformOrigin: 'center' }}
          />
        ))}
      </div>
      <span style={{ fontFamily: D.mono, fontSize: 10, color: D.t4, letterSpacing: '0.1em' }}>
        EXECUTING...
      </span>
    </div>
  )
}

interface Props { queryState: QueryState }

export default function ResultsTable({ queryState }: Props) {
  if (queryState.status === 'idle')    return <IdleState />
  if (queryState.status === 'loading') return <ExecutingState />

  if (queryState.status === 'error') {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '14px 16px' }}>
        <ErrorMark />
        <div>
          <p style={{ fontFamily: D.mono, fontSize: 10, color: D.alert, letterSpacing: '0.08em', marginBottom: 6 }}>
            QUERY ERROR
          </p>
          <p style={{ fontFamily: D.mono, fontSize: 11, color: D.t3, lineHeight: 1.65 }}>
            {queryState.error.message}
          </p>
          {queryState.error.hint && (
            <p style={{ fontFamily: D.body, fontSize: 12, color: D.t3, marginTop: 6 }}>
              {queryState.error.hint}
            </p>
          )}
        </div>
      </div>
    )
  }

  const { columns, rows, rowCount, duration } = queryState.data

  if (rows.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8 }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={D.online} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span style={{ fontFamily: D.mono, fontSize: 10, color: D.t4, letterSpacing: '0.08em' }}>
          QUERY OK — 0 ROWS RETURNED
        </span>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
     
      <div style={{
        padding: '6px 16px',
        borderBottom: `1px solid ${D.border}`,
        display: 'flex', alignItems: 'center', gap: 8,
        flexShrink: 0,
      }}>
        
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={D.online} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span style={{ fontFamily: D.mono, fontSize: 10, color: D.online, letterSpacing: '0.06em' }}>
          {rowCount} {rowCount === 1 ? 'ROW' : 'ROWS'}
        </span>
        <span style={{ fontFamily: D.mono, fontSize: 10, color: D.t4, letterSpacing: '0.06em' }}>
          · {duration}ms
        </span>
      </div>

      
     <div style={{ flex: 1, overflow: 'auto' }}>
        <table style={{ width: '100%', fontFamily: D.mono, fontSize: 11, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: D.deck }}>
              {columns.map(col => (
                <th key={col} style={{
                  textAlign: 'left', padding: '7px 16px',
                  color: D.t3, fontWeight: 500,
                  borderBottom: `1px solid ${D.border}`,
                  whiteSpace: 'nowrap', letterSpacing: '0.05em', fontSize: 10,
                }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ borderBottom: `1px solid rgba(255,255,255,0.03)` }}>
                {columns.map(col => (
                  <td key={col} style={{
                    padding: '6px 16px', color: D.t2,
                    whiteSpace: 'nowrap', maxWidth: 240,
                    overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {row[col] === null
                      ? <span style={{ color: D.t4, fontStyle: 'italic' }}>null</span>
                      : String(row[col])
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}