import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Award } from 'lucide-react'
import type { JudgeVerdict } from '@/types/query.types'

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
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
        style={{
          padding: '12px 18px',
          background: isCorrect ? 'var(--status-online-bg)' : 'var(--status-warning-bg)',
          borderBottom: isCorrect
            ? '1px solid rgba(16, 185, 129, 0.3)'
            : '1px solid rgba(245, 158, 11, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {isCorrect ? (
          <CheckCircle2 size={18} color="var(--status-online)" style={{ flexShrink: 0 }} />
        ) : (
          <AlertTriangle size={18} color="var(--status-warning)" style={{ flexShrink: 0 }} />
        )}

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: 700,
                color: isCorrect ? 'var(--status-online)' : 'var(--status-warning)',
                letterSpacing: '0.04em',
              }}
            >
              {isCorrect ? 'CHALLENGE SOLVED' : 'OUTPUT MISMATCH'}
            </span>

            {isCorrect && xpEarned > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--status-xp)',
                  background: 'var(--status-xp-bg)',
                  padding: '2px 8px',
                  borderRadius: 4,
                }}
              >
                <Award size={12} />
                +{xpEarned} XP EARNED
              </span>
            )}

            {isCorrect && xpEarned === 0 && (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  background: 'var(--bg-subtle)',
                  padding: '2px 8px',
                  borderRadius: 4,
                }}
              >
                Already Solved
              </span>
            )}

            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
              {rowCount} {rowCount === 1 ? 'row' : 'rows'} · {duration}ms
            </span>
          </div>

          {!isCorrect && verdict?.message && (
            <div style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
              color: 'var(--text-primary)',
              marginTop: 4,
              lineHeight: 1.5,
            }}>
              {verdict.message}
              {verdict.diff && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)', marginLeft: 8 }}>
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
