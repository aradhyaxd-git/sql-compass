import { motion, AnimatePresence } from 'framer-motion'
import type { JudgeVerdict } from '@/types/query.types'

const D = {
  signal: '#22d3ee',
  online: '#10d98a',
  warning: '#fbbf24',
  error: '#fb7185',
  mono: "'JetBrains Mono', monospace",
  body: "'DM Sans', sans-serif",
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={D.online} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={D.warning} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

interface SuccessBannerProps {
  rowCount: number
  duration: number
  verdict?: JudgeVerdict
  xpEarned?: number
}

export default function SuccessBanner({ rowCount, duration, verdict, xpEarned = 0 }: SuccessBannerProps) {
  const isCorrect = verdict?.correct ?? true

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        style={{
          padding: '12px 16px',
          background: isCorrect
            ? 'linear-gradient(90deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))'
            : 'linear-gradient(90deg, rgba(251,191,36,0.15), rgba(251,191,36,0.05))',
          border: isCorrect
            ? '1px solid rgba(16,185,129,0.35)'
            : '1px solid rgba(251,191,36,0.35)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {isCorrect ? <CheckIcon /> : <AlertIcon />}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: D.mono,
                fontSize: 11,
                color: isCorrect ? D.online : D.warning,
                fontWeight: 600,
                letterSpacing: '0.08em',
              }}
            >
              {isCorrect ? 'MISSION SOLVED' : 'OUTPUT MISMATCH'}
            </span>

            <span
              style={{
                fontFamily: D.mono,
                fontSize: 10,
                color: isCorrect ? D.online : '#94a3b8',
                background: isCorrect ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.06)',
                padding: '2px 8px',
                borderRadius: 4,
                letterSpacing: '0.05em',
              }}
            >
              {isCorrect
                ? xpEarned > 0
                  ? `+${xpEarned} XP EARNED`
                  : 'ALREADY SOLVED (0 XP)'
                : '0 XP EARNED'}
            </span>

            <span style={{ fontFamily: D.mono, fontSize: 10, color: '#64748b' }}>
              {rowCount} {rowCount === 1 ? 'row' : 'rows'} • {duration}ms
            </span>
          </div>

          {!isCorrect && verdict?.message && (
            <div style={{ fontFamily: D.body, fontSize: 12, color: '#e2e8f0', marginTop: 4 }}>
              {verdict.message}
              {verdict.diff && (
                <span style={{ fontFamily: D.mono, fontSize: 10, color: '#94a3b8', marginLeft: 8 }}>
                  [Expected {verdict.diff.expectedRowCount} rows, {verdict.diff.expectedColumnCount} cols]
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
