import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { C, F, RankBadge } from './landingTokens'

const RANKS_DATA = [
  {
    name: 'Explorer',
    xp: '0',
    desc: 'Just landed. First queries. Getting oriented.',
    color: C.online,
  },
  {
    name: 'Navigator',
    xp: '500',
    desc: 'Aggregations mastered. Joins in progress.',
    color: C.signal,
  },
  {
    name: 'Query Architect',
    xp: '1,500',
    desc: 'Subqueries, CTEs, complex logic.',
    color: C.pLight,
  },
  {
    name: 'Data Commander',
    xp: '3,000',
    desc: 'Window functions. Optimization. Deep queries.',
    color: C.xp,
  },
  {
    name: 'SQL Grandmaster',
    xp: '6,000',
    desc: 'The apex. Every SQL concept conquered.',
    color: '#ff6b9d',
  },
]

export default function RanksSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section
      ref={ref}
      style={{
        padding: '100px 48px',
        borderTop: `1px solid ${C.border}`,
        background: `linear-gradient(180deg, ${C.void} 0%, ${C.hull} 50%, ${C.void} 100%)`,
      }}
    >
      <div style={{ maxWidth: 1300, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          style={{ marginBottom: 56 }}
        >
          <p
            style={{
              fontFamily: F.ui,
              fontSize: 11,
              color: C.t3,
              letterSpacing: '0.12em',
              marginBottom: 14,
            }}
          >
            RANK PROGRESSION
          </p>
          <h2
            style={{
              fontFamily: F.display,
              fontWeight: 700,
              fontSize: 'clamp(30px, 3.5vw, 48px)',
              color: C.t1,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            Five ranks.
            <br />
            One destination.
          </h2>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 10,
          }}
        >
          {RANKS_DATA.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.08 }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                padding: '28px 22px',
                background: hovered === i ? C.deck : C.hull,
                border: `1px solid ${hovered === i ? r.color + '44' : C.border}`,
                borderRadius: 12,
                transition: 'all 0.25s',
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <motion.div
                animate={{ opacity: hovered === i ? 1 : 0 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: r.color,
                  transition: 'opacity 0.25s',
                }}
              />

              <div style={{ marginBottom: 16 }}>
                <RankBadge rank={i} active={hovered === i || i === 0} />
              </div>

              <div
                style={{
                  fontFamily: F.ui,
                  fontSize: 10,
                  color: r.color,
                  letterSpacing: '0.08em',
                  marginBottom: 8,
                  opacity: hovered === i ? 1 : 0.5,
                }}
              >
                RANK {String(i + 1).padStart(2, '0')}
              </div>

              <h3
                style={{
                  fontFamily: F.display,
                  fontWeight: 700,
                  fontSize: 15,
                  color: C.t1,
                  letterSpacing: '-0.02em',
                  marginBottom: 8,
                  lineHeight: 1.2,
                }}
              >
                {r.name}
              </h3>

              <p
                style={{
                  fontFamily: F.body,
                  fontSize: 12,
                  color: C.t3,
                  lineHeight: 1.6,
                  marginBottom: 16,
                }}
              >
                {r.desc}
              </p>

              <div
                style={{
                  fontFamily: F.ui,
                  fontSize: 11,
                  color: r.color,
                  opacity: hovered === i ? 1 : 0.4,
                }}
              >
                {r.xp} XP
              </div>

              <div
                style={{
                  marginTop: 12,
                  height: 2,
                  background: C.t4,
                  borderRadius: 999,
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  animate={{
                    width: hovered === i ? '100%' : i === 0 ? '100%' : '0%',
                  }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    background: r.color,
                    borderRadius: 999,
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
