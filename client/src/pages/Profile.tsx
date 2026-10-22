import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, Award, LogOut, CheckCircle2, AlertCircle, Terminal } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useUserStats, useAttemptHistory } from '@/hooks/useProfile'

const RANKS = [
  { label: 'Explorer', xpMin: 0 },
  { label: 'Navigator', xpMin: 500 },
  { label: 'Query Architect', xpMin: 1500 },
  { label: 'Data Specialist', xpMin: 3000 },
  { label: 'SQL Grandmaster', xpMin: 6000 },
]

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div style={{
      padding: '18px 20px',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      gap: 16,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 38,
        height: 38,
        borderRadius: 8,
        background: 'var(--brand-muted)',
        border: '1px solid var(--brand-border)',
        color: 'var(--brand-primary)',
      }}>
        <Icon size={18} />
      </div>
      <div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-muted)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          marginBottom: 2,
        }}>
          {label}
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 22,
          color: 'var(--text-primary)',
        }}>
          {value}
        </div>
      </div>
    </div>
  )
}

export default function Profile() {
  const { user, isLoaded, signOut } = useAuth()
  const navigate = useNavigate()
  const { data: stats, isLoading: statsLoading } = useUserStats()
  const { data: attempts } = useAttemptHistory()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (!isLoaded || statsLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-canvas)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>
          Loading profile...
        </div>
      </div>
    )
  }

  const currentRank = RANKS[stats?.rank?.index ?? 0] || RANKS[0]
  const xpProgress = stats ? Math.min((stats.totalXP / (stats.rank.nextXP ?? stats.totalXP + 500)) * 100, 100) : 0
  const xpCurrentLevel = stats?.totalXP ?? 0
  const xpNextLevel = stats?.rank.nextXP ?? xpCurrentLevel + 500

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
        {/* Profile Header */}
        <div style={{
          borderBottom: '1px solid var(--border-default)',
          background: 'var(--bg-card)',
          padding: '36px 24px 28px',
        }}>
          <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt="avatar"
                  style={{ width: 56, height: 56, borderRadius: 12, border: '2px solid var(--brand-border)' }}
                />
              ) : (
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: 'var(--brand-muted)',
                  border: '2px solid var(--brand-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 22,
                  color: 'var(--brand-primary)',
                }}>
                  {user?.firstName?.[0] ?? '?'}
                </div>
              )}

              <div>
                <h1 style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 22,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  marginBottom: 4,
                }}>
                  {user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? 'Developer Profile'}
                </h1>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 10px',
                  borderRadius: 6,
                  background: 'var(--brand-muted)',
                  border: '1px solid var(--brand-border)',
                }}>
                  <Compass size={13} color="var(--brand-primary)" />
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--brand-primary)',
                  }}>
                    {currentRank.label}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 6,
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-default)',
                color: 'var(--status-danger)',
                fontSize: 13,
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--status-danger)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)'
              }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div style={{ maxWidth: 960, margin: '0 auto', width: '100%', padding: '32px 24px', flex: 1 }}>
          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
            <StatCard label="Challenges Solved" value={String(stats?.missionsCompleted ?? 0)} icon={CheckCircle2} />
            <StatCard label="Queries Executed" value={String(stats?.queriesExecuted ?? 0)} icon={Terminal} />
            <StatCard label="Total Experience" value={`${stats?.totalXP ?? 0} XP`} icon={Award} />
          </div>

          {/* XP Level Progress Bar */}
          <div style={{
            padding: 20,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 10,
            marginBottom: 28,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
                EXPERIENCE PROGRESS
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--brand-primary)' }}>
                {xpCurrentLevel} / {xpNextLevel} XP
              </span>
            </div>
            <div style={{ height: 6, background: 'var(--bg-subtle)', borderRadius: 999, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                style={{ height: '100%', background: 'var(--brand-primary)', borderRadius: 999 }}
              />
            </div>
          </div>

          {/* Attempt Activity History */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 16,
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}>
                Execution History
              </h2>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                {attempts?.length ?? 0} total attempts
              </span>
            </div>

            {attempts && attempts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {attempts.map((attempt) => {
                  const isSuccess = attempt.status === 'success'
                  return (
                    <motion.div
                      key={attempt._id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: '12px 16px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        {isSuccess ? (
                          <CheckCircle2 size={16} color="var(--status-online)" style={{ flexShrink: 0 }} />
                        ) : (
                          <AlertCircle size={16} color="var(--status-danger)" style={{ flexShrink: 0 }} />
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: 2,
                          }}>
                            {attempt.assignmentTitle}
                          </div>
                          <div style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 11,
                            color: 'var(--text-muted)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {attempt.query}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 11,
                          fontWeight: 600,
                          color: isSuccess ? 'var(--status-online)' : 'var(--status-danger)',
                        }}>
                          {isSuccess ? 'PASS' : 'FAIL'}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                          {new Date(attempt.executedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div style={{
                padding: '36px 20px',
                textAlign: 'center',
                borderRadius: 8,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-secondary)',
                fontSize: 13,
                fontFamily: 'var(--font-sans)',
              }}>
                No query attempts logged yet. Solve your first challenge in the workspace!
              </div>
            )}
          </div>
        </div>

        <Footer />
      </main>
    </>
  )
}