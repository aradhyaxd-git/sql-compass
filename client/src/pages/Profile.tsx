import { useUser, useClerk } from '@clerk/react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, Map, Cog, Target, Crown, LogOut } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'

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

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (!isLoaded) {
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

  const currentRank = RANKS[0]
  const RankIcon = currentRank.icon

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#020208', paddingTop: 52 }}>

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
            <StatBox label="Missions completed" value="—" />
            <StatBox label="Queries executed" value="—" />
            <StatBox label="Day streak" value="—" mono />
          </div>

          <div style={{ padding: '20px', background: '#0a0a12', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#334155', letterSpacing: '0.08em' }}>XP PROGRESS</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#6366f1' }}>0 / 500 XP</span>
            </div>
            <div style={{ height: 6, background: '#0f0f1a', borderRadius: 999, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '0%' }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #06b6d4)', borderRadius: 999 }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#818cf8', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Compass size={12}/> Explorer
              </span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#334155', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Map size={12}/> Navigator
              </span>
            </div>
          </div>

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
    </>
  )
}