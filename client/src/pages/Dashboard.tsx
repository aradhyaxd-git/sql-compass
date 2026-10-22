import { useState, useMemo } from 'react'
import { useUser } from '@clerk/react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Search, Sparkles, CheckCircle2, ChevronRight, Award } from 'lucide-react'
import { useAssignments } from '@/hooks/useAssignments'
import { useUserStats } from '@/hooks/useProfile'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import type { Difficulty, Assignment } from '@/types/assignment.types'

type Filter = 'all' | Difficulty

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

function ChallengeCard({ assignment, index }: { assignment: Assignment; index: number }) {
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
            border: '1px solid var(--border-default)',
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
            e.currentTarget.style.borderColor = 'var(--border-default)'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 600,
                color: meta.color,
                background: meta.bg,
                border: `1px solid ${meta.border}`,
                padding: '2px 8px',
                borderRadius: 4,
                letterSpacing: '0.04em',
              }}>
                {meta.label}
              </span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-muted)',
              }}>
                #{String(index + 1).padStart(3, '0')}
              </span>
            </div>

            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 16,
              color: 'var(--text-primary)',
              marginBottom: 8,
              letterSpacing: '-0.01em',
              lineHeight: 1.35,
            }}>
              {assignment.title}
            </h3>

            <p style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.55,
              marginBottom: 16,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontFamily: 'var(--font-sans)',
            }}>
              {assignment.description}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
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

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 26,
              height: 26,
              borderRadius: 6,
              background: 'var(--brand-muted)',
              color: 'var(--brand-primary)',
            }}>
              <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function Dashboard() {
  const { user } = useUser()
  const [filter, setFilter] = useState<Filter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { data: assignments, isLoading, error } = useAssignments()
  const { data: stats } = useUserStats()

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All Challenges' },
    { key: 'easy', label: 'Foundations' },
    { key: 'medium', label: 'Intermediate' },
    { key: 'hard', label: 'Advanced' },
  ]

  const filtered = useMemo(() => {
    if (!assignments) return []
    return assignments.filter((a) => {
      const matchesDifficulty = filter === 'all' || a.difficulty === filter
      const matchesSearch =
        searchQuery.trim() === '' ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesDifficulty && matchesSearch
    })
  }, [assignments, filter, searchQuery])

  return (
    <>
      <Navbar />
      <main style={{
        minHeight: '100vh',
        background: 'var(--bg-canvas)',
        paddingTop: 54,
        display: 'flex',
        flexDirection: 'column',
        transition: 'background-color 0.2s ease',
      }}>
        {/* Header Hero Banner */}
        <div style={{
          borderBottom: '1px solid var(--border-default)',
          background: 'var(--bg-card)',
          padding: '36px 24px 28px',
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 28 }}>
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 8px',
                  borderRadius: 4,
                  background: 'var(--brand-muted)',
                  border: '1px solid var(--brand-border)',
                  color: 'var(--brand-primary)',
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  marginBottom: 10,
                  letterSpacing: '0.04em',
                }}>
                  <Sparkles size={12} />
                  <span>CURATED PRACTICE TRACK</span>
                </div>
                <h1 style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 26,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                }}>
                  {user?.firstName ? `Welcome back, ${user.firstName}` : 'SQL Challenges & Missions'}
                </h1>
                <p style={{
                  fontSize: 14,
                  color: 'var(--text-secondary)',
                  marginTop: 6,
                  fontFamily: 'var(--font-sans)',
                  maxWidth: 600,
                  lineHeight: 1.5,
                }}>
                  Real PostgreSQL schema execution, automated AST security enforcement, and progressive AI hints.
                </p>
              </div>

              {/* Progress Summary Cards */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div style={{
                  padding: '12px 18px',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 8,
                  minWidth: 120,
                }}>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 2 }}>
                    SOLVED
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={16} color="var(--status-online)" />
                    <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                      {stats?.missionsCompleted ?? 0}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      / {assignments?.length ?? 31}
                    </span>
                  </div>
                </div>

                <div style={{
                  padding: '12px 18px',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 8,
                  minWidth: 120,
                }}>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 2 }}>
                    EXPERIENCE
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Award size={16} color="var(--status-xp)" />
                    <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                      {stats?.totalXP ?? 0}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--status-xp)', fontFamily: 'var(--font-mono)' }}>
                      XP
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {FILTERS.map(({ key, label }) => {
                  const active = filter === key
                  return (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 6,
                        fontFamily: 'var(--font-sans)',
                        fontSize: 13,
                        fontWeight: active ? 600 : 500,
                        cursor: 'pointer',
                        border: active ? '1px solid var(--brand-primary)' : '1px solid var(--border-default)',
                        background: active ? 'var(--brand-muted)' : 'var(--bg-subtle)',
                        color: active ? 'var(--brand-primary)' : 'var(--text-secondary)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>

              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                minWidth: 260,
              }}>
                <Search size={14} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter by title, topic, or tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 14px 7px 34px',
                    borderRadius: 6,
                    border: '1px solid var(--border-default)',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: 13,
                    fontFamily: 'var(--font-sans)',
                    outline: 'none',
                    transition: 'border-color 0.15s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--brand-primary)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Challenge Cards Grid */}
        <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%', padding: '32px 24px', flex: 1 }}>
          {isLoading && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 20,
            }}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  style={{
                    height: 180,
                    borderRadius: 10,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-default)',
                    padding: 20,
                  }}
                />
              ))}
            </div>
          )}

          {error && (
            <div style={{
              padding: 24,
              borderRadius: 8,
              background: 'var(--status-danger-bg)',
              border: '1px solid rgba(244, 63, 94, 0.2)',
              color: 'var(--status-danger)',
              fontSize: 14,
              fontFamily: 'var(--font-sans)',
            }}>
              Unable to load challenges. Please verify backend connection.
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '64px 20px',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-sans)',
            }}>
              <p style={{ fontSize: 16, fontWeight: 500, marginBottom: 8, color: 'var(--text-primary)' }}>
                No challenges match your search
              </p>
              <p style={{ fontSize: 13 }}>Try clearing filters or searching for another keyword.</p>
            </div>
          )}

          {!isLoading && filtered.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 20,
            }}>
              {filtered.map((assignment, index) => (
                <ChallengeCard key={assignment._id} assignment={assignment} index={index} />
              ))}
            </div>
          )}
        </div>

        <Footer />
      </main>
    </>
  )
}