import { useUser, useClerk } from '@clerk/react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, Map, Cog, Target, Crown, LogOut, CheckCircle, AlertCircle } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useUserStats, useAttemptHistory } from '@/hooks/useProfile'

const RANKS = [
  { label: 'Explorer', icon: Compass, xpMin: 0 },
  { label: 'Navigator', icon: Map, xpMin: 500 },
  { label: 'Query Architect', icon: Cog, xpMin: 1500 },
  { label: 'Data Commander', icon: Target, xpMin: 3000 },
  { label: 'SQL Grandmaster', icon: Crown, xpMin: 6000 },
]

function StatBox({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{
      padding: '18px 20px',
      background: '#0a0a12',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 10,
    }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#334155', letterSpacing: '0.08em', marginBottom: 8 }}>
        {label.toUpperCase()}
      </div>
      <div style={{
        fontFamily: mono ? 'JetBrains Mono, monospace' : 'Space Grotesk, sans-serif',
        fontWeight: 700, fontSize: 22, color: '#f8fafc',
      }}>
        {value}
      </div>
    </div>
  )
}

export default function Profile() {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const navigate = useNavigate()
  const { data: stats, isLoading: statsLoading } = useUserStats()
  const { data: attempts, isLoading: attemptsLoading } = useAttemptHistory()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (!isLoaded || statsLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#020208', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#334155', letterSpacing: '0.1em' }}
        >
          LOADING OPERATIVE DATA...
        </motion.div>
      </div>
    )
  }

  const currentRank = RANKS[stats?.rank.index ?? 0]
  const RankIcon = currentRank.icon
  const xpProgress = stats ? Math.min((stats.totalXP / (stats.rank.nextXP ?? stats.totalXP + 500)) * 100, 100) : 0
  const xpCurrentLevel = stats?.rank.nextXP ? stats.totalXP : stats?.totalXP ?? 0
  const xpNextLevel = stats?.rank.nextXP ?? (stats?.totalXP ?? 0) + 500

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#020208', paddingTop: 52, display: 'flex', flexDirection: 'column' }}>

        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '32px 32px 28px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#334155', letterSpacing: '0.1em', marginBottom: 16 }}>
              OPERATIVE PROFILE
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>

              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt="avatar"
                  style={{ width: 56, height: 56, borderRadius: 12, border: '2px solid rgba(99,102,241,0.25)' }}
                />
              ) : (
                <div style={{
                  width: 56, height: 56, borderRadius: 12,
                  background: 'rgba(99,102,241,0.1)',
                  border: '2px solid rgba(99,102,241,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 22, color: '#818cf8',
                }}>
                  {user?.firstName?.[0] ?? '?'}
                </div>
              )}

              <div>
                <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 22, color: '#f8fafc', letterSpacing: '-0.02em', marginBottom: 4 }}>
                  {user?.fullName ?? 'Anonymous Operative'}
                </h1>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 6, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <RankIcon size={14} />
                  <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, fontWeight: 600, color: '#818cf8' }}>
                    {currentRank.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 32px' }}>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
            <StatBox label="Missions completed" value={String(stats?.missionsCompleted ?? 0)} />
            <StatBox label="Queries executed" value={String(stats?.queriesExecuted ?? 0)} />
            <StatBox label="Total XP" value={String(stats?.totalXP ?? 0)} mono />
          </div>

          <div style={{ padding: '20px', background: '#0a0a12', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#334155', letterSpacing: '0.08em' }}>XP PROGRESS</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#6366f1' }}>{xpCurrentLevel} / {xpNextLevel} XP</span>
            </div>
            <div style={{ height: 6, background: '#0f0f1a', borderRadius: 999, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #06b6d4)', borderRadius: 999 }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#818cf8', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Compass size={12}/> {RANKS[Math.max(0, (stats?.rank.index ?? 0) - 1)].label}
              </span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#334155', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Map size={12}/> {stats?.rank.name}
              </span>
            </div>
          </div>

          {attempts && attempts.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#94a3b8', letterSpacing: '0.1em', marginBottom: 12, textTransform: 'uppercase' }}>
                FLIGHT LOG
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {attempts.map((attempt) => (
                  <motion.div
                    key={attempt._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                      padding: '12px 16px',
                      background: '#0a0a12',
                      border: `1px solid ${attempt.status === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`,
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    {attempt.status === 'success' ? (
                      <CheckCircle size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                    ) : (
                      <AlertCircle size={16} style={{ color: '#f43f5e', flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: '#f8fafc', fontWeight: 500, marginBottom: 2 }}>
                        {attempt.assignmentTitle}
                      </div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {attempt.query.substring(0, 60)}...
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: attempt.status === 'success' ? '#10b981' : '#f43f5e' }}>
                        {attempt.status.toUpperCase()}
                      </span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#334155' }}>
                        {new Date(attempt.executedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <motion.button
            whileHover={{ borderColor: 'rgba(244,63,94,0.4)' }}
            onClick={handleSignOut}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 18px', borderRadius: 8,
              background: 'transparent',
              border: '1px solid rgba(244,63,94,0.15)',
              color: '#f43f5e', fontSize: 13,
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer', transition: 'border-color 0.2s',
            }}
          >
            <LogOut size={14}/>
            Terminate session
          </motion.button>

        </div>
      </main>
      <Footer />
    </>
  )
}