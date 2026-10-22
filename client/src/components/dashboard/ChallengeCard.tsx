import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CheckCircle2, ChevronRight } from 'lucide-react'
import type { Difficulty, Assignment } from '@/types/assignment.types'

const DIFFICULTY_META: Record<Difficulty, { label: string; color: string; bg: string; border: string }> = {
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

interface ChallengeCardProps {
  assignment: Assignment
  index: number
  isSolved: boolean
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ assignment, index, isSolved }) => {
  const meta = DIFFICULTY_META[assignment.difficulty]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3), ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={`/attempt/${assignment._id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
        <div
          style={{
            padding: '20px 22px',
            background: 'var(--bg-card)',
            border: isSolved ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-default)',
            borderRadius: 10,
            cursor: 'pointer',
            transition: 'border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--brand-primary)'
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = 'var(--shadow-md)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = isSolved ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-default)'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 600,
                    color: meta.color,
                    background: meta.bg,
                    border: `1px solid ${meta.border}`,
                    padding: '2px 8px',
                    borderRadius: 4,
                    letterSpacing: '0.04em',
                  }}
                >
                  {meta.label}
                </span>

                {isSolved && (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      fontWeight: 600,
                      color: 'var(--status-online)',
                      background: 'var(--status-online-bg)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      padding: '2px 6px',
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    <CheckCircle2 size={11} />
                    <span>Solved</span>
                  </span>
                )}
              </div>

              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--text-muted)',
                }}
              >
                #{String(index + 1).padStart(3, '0')}
              </span>
            </div>

            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 16,
                color: 'var(--text-primary)',
                marginBottom: 8,
                letterSpacing: '-0.01em',
                lineHeight: 1.35,
              }}
            >
              {assignment.title}
            </h3>

            <p
              style={{
                fontSize: 13,
                color: 'var(--text-secondary)',
                lineHeight: 1.55,
                marginBottom: 16,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {assignment.description}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 12,
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {assignment.tags?.slice(0, 3).map((tag: string) => (
                <span
                  key={tag}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-default)',
                    padding: '2px 6px',
                    borderRadius: 4,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 26,
                height: 26,
                borderRadius: 6,
                background: 'var(--brand-muted)',
                color: 'var(--brand-primary)',
              }}
            >
              <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default ChallengeCard
