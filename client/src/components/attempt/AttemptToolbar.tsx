import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, RotateCcw, Wand2 } from 'lucide-react'
import type { Difficulty } from '@/types/assignment.types'

const DIFFICULTY_LABELS: Record<Difficulty, { label: string; color: string; bg: string; border: string }> = {
  easy: {
    label: 'Foundations',
    color: 'var(--status-online)',
    bg: 'var(--status-online-bg)',
    border: 'rgba(16, 185, 129, 0.25)',
  },
  medium: {
    label: 'Intermediate',
    color: 'var(--status-warning)',
    bg: 'var(--status-warning-bg)',
    border: 'rgba(245, 158, 11, 0.25)',
  },
  hard: {
    label: 'Advanced',
    color: 'var(--status-danger)',
    bg: 'var(--status-danger-bg)',
    border: 'rgba(244, 63, 94, 0.25)',
  },
}

function DiffChip({ difficulty }: { difficulty: Difficulty }) {
  const cfg = DIFFICULTY_LABELS[difficulty] || DIFFICULTY_LABELS.easy

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
      }}
    >
      {cfg.label}
    </span>
  )
}

interface AttemptToolbarProps {
  title: string
  difficulty: Difficulty
  sql: string
  queryLoading: boolean
  onFormat: () => void
  onReset: () => void
  onRun: () => void
}

export const AttemptToolbar: React.FC<AttemptToolbarProps> = ({
  title,
  difficulty,
  sql,
  queryLoading,
  onFormat,
  onReset,
  onRun,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        height: 48,
        borderBottom: '1px solid var(--border-default)',
        background: 'var(--bg-card)',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link
          to="/dashboard"
          aria-label="Back to dashboard"
          style={{
            textDecoration: 'none',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: 6,
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-default)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)'
            e.currentTarget.style.borderColor = 'var(--brand-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)'
            e.currentTarget.style.borderColor = 'var(--border-default)'
          }}
        >
          <ArrowLeft size={14} />
        </Link>

        <div style={{ width: 1, height: 16, background: 'var(--border-default)' }} />

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 14,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
            margin: 0,
          }}
        >
          {title}
        </h1>

        <DiffChip difficulty={difficulty} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          onClick={onFormat}
          disabled={!sql.trim()}
          title="Format and prettify SQL query"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '5px 10px',
            borderRadius: 6,
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-default)',
            color: sql.trim() ? 'var(--text-secondary)' : 'var(--text-muted)',
            fontFamily: 'var(--font-sans)',
            fontSize: 11,
            cursor: sql.trim() ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (sql.trim()) e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={(e) => {
            if (sql.trim()) e.currentTarget.style.color = 'var(--text-secondary)'
          }}
        >
          <Wand2 size={12} />
          <span>Format</span>
        </button>

        {sql.trim() !== '' && (
          <button
            type="button"
            onClick={onReset}
            title="Reset editor"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 10px',
              borderRadius: 6,
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-sans)',
              fontSize: 11,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        )}

        <motion.button
          type="button"
          onClick={onRun}
          whileTap={{ scale: 0.98 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '6px 16px',
            background: queryLoading ? 'var(--status-danger-bg)' : 'var(--brand-primary)',
            border: queryLoading ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid var(--brand-border)',
            borderRadius: 6,
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            fontWeight: 600,
            color: queryLoading ? 'var(--status-danger)' : '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: queryLoading ? 'none' : 'var(--shadow-sm)',
          }}
        >
          {queryLoading ? (
            <span>Cancel</span>
          ) : (
            <>
              <Play size={12} fill="currentColor" />
              <span>Run Query</span>
              <kbd
                style={{
                  fontSize: 10,
                  opacity: 0.8,
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '1px 5px',
                  borderRadius: 3,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                Cmd+Enter
              </kbd>
            </>
          )}
        </motion.button>
      </div>
    </div>
  )
}

export default AttemptToolbar
