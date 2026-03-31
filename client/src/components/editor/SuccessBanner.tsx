import { motion, AnimatePresence } from 'framer-motion'

const D = {
  signal: '#22d3ee',
  online: '#10d98a',
  mono: "'JetBrains Mono', monospace",
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={D.online} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

interface SuccessBannerProps {
  rowCount: number
  duration: number
}

export default function SuccessBanner({ rowCount, duration }: SuccessBannerProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        style={{
          padding: '12px 16px',
          background: 'linear-gradient(90deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <CheckIcon />
        <div style={{ flex: 1 }}>
          <span style={{ fontFamily: D.mono, fontSize: 11, color: D.online, fontWeight: 600, letterSpacing: '0.05em' }}>
            QUERY SUBMITTED
          </span>
          <span style={{ fontFamily: D.mono, fontSize: 10, color: '#94a3b8', marginLeft: 12 }}>
            {rowCount} {rowCount === 1 ? 'row' : 'rows'} • {duration}ms • +20 XP earned
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
