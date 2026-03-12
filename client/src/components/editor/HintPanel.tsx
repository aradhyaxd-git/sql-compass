import { motion, AnimatePresence } from 'framer-motion'

const D = {
  hull:'#090914',
  deck:'#0e0e1c',
  border: 'rgba(255,255,255,0.07)',
  t2:'#94a3b8',
  t3:'#4a5568',
  t4:'#1e2a40',
  signal:'#22d3ee',
  mono:"'JetBrains Mono', monospace",
  body:"'DM Sans', sans-serif",
}

function SignalIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M2 20h.01M7 20v-4M12 20V8M17 20V4"/>
      <circle cx="21" cy="5" r="2" fill="currentColor" stroke="none"/>
    </svg>
  )
}


function CloseIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

function Transmitting() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 1, 0.2], scaleY: [0.5, 1, 0.5] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
            style={{ width: 3, height: 12, borderRadius: 2, background: D.signal, transformOrigin: 'center' }}
          />
        ))}
      </div>
      <span style={{ fontFamily: D.mono, fontSize: 10, color: D.t3, letterSpacing: '0.08em' }}>
        TRANSMITTING SIGNAL...
      </span>
    </div>
  )
}

interface HintPanelProps {
  hint: string | null
  isLoading: boolean
  onRequest: () => void
  onClear: () => void
}

export default function HintPanel({ hint, isLoading, onRequest, onClear }: HintPanelProps) {
  return (
    <div style={{
      borderTop: `1px solid ${D.border}`,
      background: D.hull,
      padding: '12px 16px',
    }}>
     
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: D.signal }}>
          <SignalIcon />
          <span style={{ fontFamily: D.mono, fontSize: 9, color: D.t3, letterSpacing: '0.12em' }}>
            SIGNAL INTEL
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {hint && !isLoading && (
            <button onClick={onClear} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: D.t4, padding: 3, display: 'flex', alignItems: 'center',
              transition: 'color 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = D.t2}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = D.t4}
            >
              <CloseIcon />
            </button>
          )}
          <button
            onClick={onRequest}
            disabled={isLoading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 12px',
              background: isLoading ? 'transparent' : 'rgba(34,211,238,0.07)',
              border: `1px solid ${isLoading ? D.t4 : 'rgba(34,211,238,0.2)'}`,
              borderRadius: 5,
              fontFamily: D.mono, fontSize: 9, letterSpacing: '0.1em',
              color: isLoading ? D.t4 : D.signal,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {!isLoading && <SignalIcon />}
            {isLoading ? 'RECEIVING...' : 'REQUEST SIGNAL'}
          </button>
        </div>
      </div>

      
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Transmitting />
          </motion.div>
        )}

        {hint && !isLoading && (
          <motion.div key="hint"
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            style={{
              fontSize: 12, color: D.t2, lineHeight: 1.7,
              fontFamily: D.body,
              background: 'rgba(34,211,238,0.04)',
              border: `1px solid rgba(34,211,238,0.1)`,
              borderLeft: `2px solid ${D.signal}`,
              borderRadius: '0 5px 5px 0',
              padding: '8px 12px',
            }}
          >
            {hint}
          </motion.div>
        )}

        {!hint && !isLoading && (
          <motion.p key="empty"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ fontFamily: D.mono, fontSize: 10, color: D.t4, letterSpacing: '0.06em' }}
          >
            STUCK? REQUEST A SIGNAL — DIRECTION, NOT ANSWERS.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}