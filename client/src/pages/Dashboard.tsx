import { useState } from 'react'
import { useUser } from '@clerk/react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAssignments } from '@/hooks/useAssignments'
import Navbar from '@/components/layout/Navbar'
import type { Difficulty } from '@/types/assignment.types'


function StatusDot() {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: 7, height: 7 }}>
      <motion.span
        style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10b981', opacity: 0.35 }}
        animate={{ scale: [1, 2, 1] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      />
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', position: 'relative' }} />
    </span>
  )
}

const DIFFICULTY_CONFIG: Record<Difficulty, { color: string; bg: string; border: string; label: string }> = {
  easy: { color: '#10b981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)',  label: 'RECON' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)',  label: 'STRIKE' },
  hard:{ color: '#f43f5e', bg: 'rgba(244,63,94,0.08)',   border: 'rgba(244,63,94,0.2)',   label: 'ASSAULT' },
}

type Filter = 'all' | Difficulty


function MissionCard({ assignment, index }: { assignment: any; index: number }) {
  const diff = DIFFICULTY_CONFIG[assignment.difficulty as Difficulty]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
    >
      <Link to={`/attempt/${assignment.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <motion.div
          whileHover={{ y: -2, borderColor: 'rgba(99,102,241,0.3)' }}
          style={{
            padding: '20px 22px',
            background: '#0a0a12',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10,
            cursor: 'pointer',
            transition: 'border-color 0.2s',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10, letterSpacing: '0.1em',
              color: diff.color,
              background: diff.bg,
              border: `1px solid ${diff.border}`,
              padding: '2px 8px', borderRadius: 4,
            }}>
              {diff.label}
            </span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#1e293b' }}>
              #{String(index + 1).padStart(3, '0')}
            </span>
          </div>

         

          <h3 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 600, fontSize: 15,
            color: '#f8fafc', marginBottom: 8,
            letterSpacing: '-0.01em', lineHeight: 1.3,
          }}>
            {assignment.title}
          </h3>


          <p style={{
            fontSize: 12, color: '#475569',
            lineHeight: 1.6, marginBottom: 16,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {assignment.description}
          </p>


          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {assignment.tags?.slice(0, 3).map((tag: string) => (
              <span key={tag} style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10, color: '#334155',
                background: '#0f0f1a',
                border: '1px solid rgba(255,255,255,0.05)',
                padding: '2px 7px', borderRadius: 4,
              }}>
                {tag}
              </span>
            ))}
          </div>


          <div style={{
            position: 'absolute', right: 16, bottom: 16,
            width: 28, height: 28, borderRadius: 6,
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#6366f1', fontSize: 13 }}>→</span>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}


function MissionSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.04 }}
      style={{
        padding: '20px 22px',
        background: '#0a0a12',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 10,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ width: 60, height: 18, borderRadius: 4, background: '#0f0f1a' }}
        />
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          style={{ width: 32, height: 18, borderRadius: 4, background: '#0f0f1a' }}
        />
      </div>
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
        style={{ width: '75%', height: 18, borderRadius: 4, background: '#0f0f1a', marginBottom: 10 }}
      />
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.15 }}
        style={{ width: '90%', height: 13, borderRadius: 4, background: '#0f0f1a', marginBottom: 6 }}
      />
      <motion.div
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        style={{ width: '60%', height: 13, borderRadius: 4, background: '#0f0f1a', marginBottom: 16 }}
      />
      <div style={{ display: 'flex', gap: 6 }}>
        {[40, 52, 44].map((w, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.05 * i }}
            style={{ width: w, height: 20, borderRadius: 4, background: '#0f0f1a' }}
          />
        ))}
      </div>
    </motion.div>
  )
}



export default function Dashboard() {
  const { user } = useUser()
  const [filter, setFilter] = useState<Filter>('all')
  const { data: assignments, isLoading } = useAssignments()

  const filtered = assignments?.filter(a => filter === 'all' || a.difficulty === filter) ?? []

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all',    label: 'All Missions' },
    { key: 'easy',   label: 'Recon' },
    { key: 'medium', label: 'Strike' },
    { key: 'hard',   label: 'Assault' },
  ]

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#020208', paddingTop: 52 }}>

        <div style={{
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          padding: '32px 32px 24px',
        }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <StatusDot />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#334155', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Mission Control
                  </span>
                </div>
                <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 24, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                  {user?.firstName ? `Welcome back, ${user.firstName}.` : 'Mission Control.'}
                </h1>
                <p style={{ fontSize: 13, color: '#334155', marginTop: 4, fontFamily: 'Inter, sans-serif' }}>
                  Select a mission to begin your sortie.
                </p>
              </div>

              <div style={{
                padding: '12px 20px',
                background: '#0a0a12',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10,
                textAlign: 'right',
              }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#334155', marginBottom: 4, letterSpacing: '0.08em' }}>
                  SQL RANK
                </div>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 16, color: '#818cf8' }}>
                  🧭 Explorer
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 4 }}>
              {FILTERS.map(({ key, label }) => {
                const active = filter === key
                return (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    style={{
                      padding: '6px 16px', borderRadius: 6,
                      fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: active ? 500 : 400,
                      color: active ? '#f8fafc' : '#475569',
                      background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
                      border: active ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
              {assignments && (
                <span style={{ marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#1e293b', alignSelf: 'center' }}>
                  {filtered.length} MISSIONS
                </span>
              )}
            </div>
          </div>
        </div>

    
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <MissionSkeleton key={i} index={i} />)
              : filtered.length > 0
                ? filtered.map((a, i) => <MissionCard key={a._id} assignment={a} index={i} />)
                : (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 0' }}>
                    <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#1e293b' }}>
                      NO MISSIONS FOUND
                    </p>
                  </div>
                )
            }
          </div>
        </div>

      </main>
    </>
  )
}