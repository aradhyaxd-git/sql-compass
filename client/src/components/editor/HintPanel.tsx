import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, HelpCircle, X, ChevronRight, Zap } from 'lucide-react'
import type { HintData } from '@/types/query.types'

interface HintPanelProps {
  hintData?: HintData | null
  hint: string | null
  isLoading: boolean
  onRequest: () => void
  onClear: () => void
}

function LevelBadge({ level }: { level: 1 | 2 | 3 }) {
  const cfg = {
    1: {
      label: 'Level 1 · Strategic Nudge',
      color: 'var(--status-online)',
      bg: 'var(--status-online-bg)',
      border: 'rgba(16, 185, 129, 0.25)',
    },
    2: {
      label: 'Level 2 · Concept Focus',
      color: 'var(--status-warning)',
      bg: 'var(--status-warning-bg)',
      border: 'rgba(245, 158, 11, 0.25)',
    },
    3: {
      label: 'Level 3 · Query Scaffold',
      color: 'var(--brand-primary)',
      bg: 'var(--brand-muted)',
      border: 'var(--brand-border)',
    },
  }[level]

  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        fontWeight: 600,
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        padding: '2px 8px',
        borderRadius: 4,
        letterSpacing: '0.02em',
      }}
    >
      {cfg.label}
    </span>
  )
}

export default function HintPanel({ hintData, hint, isLoading, onRequest, onClear }: HintPanelProps) {
  const activeLevel = (hintData?.level as 1 | 2 | 3) || 1

  return (
    <div style={{
      borderTop: '1px solid var(--border-default)',
      background: 'var(--bg-card)',
      padding: '12px 18px',
      transition: 'background-color 0.2s ease, border-color 0.2s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--brand-primary)' }}>
            <Sparkles size={15} />
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}>
              Pedagogical Guidance
            </span>
          </div>

          {hint && !isLoading && <LevelBadge level={activeLevel} />}

          {hintData?.fromCache && (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--accent-cyan)',
              background: 'var(--accent-cyan-light)',
              padding: '2px 6px',
              borderRadius: 4,
            }}>
              Instant Cache
            </span>
          )}

          {hintData?.concept && (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--text-secondary)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-default)',
              padding: '2px 6px',
              borderRadius: 4,
            }}>
              {hintData.concept}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {hint && !isLoading && (
            <button
              onClick={onClear}
              aria-label="Dismiss hint"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: 4,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <X size={14} />
            </button>
          )}

          <button
            onClick={onRequest}
            disabled={isLoading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              background: isLoading ? 'var(--bg-subtle)' : 'var(--brand-primary)',
              border: '1px solid var(--brand-border)',
              borderRadius: 6,
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
              fontWeight: 600,
              color: isLoading ? 'var(--text-muted)' : '#ffffff',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {isLoading ? (
              <span>Analyzing query...</span>
            ) : (
              <>
                <HelpCircle size={13} />
                <span>{hint ? 'Next Hint Level' : 'Get Hint'}</span>
                {hint && <ChevronRight size={13} />}
              </>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 0',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--text-secondary)',
            }}
          >
            <Zap size={14} color="var(--brand-primary)" className="animate-pulse" />
            <span>Evaluating student AST and synthesizing guidance...</span>
          </motion.div>
        )}

        {hint && !isLoading && (
          <motion.div
            key="hint"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              fontSize: 13,
              color: 'var(--text-primary)',
              lineHeight: 1.6,
              fontFamily: 'var(--font-sans)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-default)',
              borderLeft: '3px solid var(--brand-primary)',
              borderRadius: '0 6px 6px 0',
              padding: '10px 14px',
              marginTop: 4,
            }}
          >
            {hint}
          </motion.div>
        )}

        {!hint && !isLoading && (
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
          }}>
            Need help? The AI hint assistant offers progressive guidance without giving away the direct solution.
          </p>
        )}
      </AnimatePresence>
    </div>
  )
}