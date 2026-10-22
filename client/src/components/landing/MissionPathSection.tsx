import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { C, F } from './landingTokens'

const SECTORS = [
  {
    id: 'S-01',
    name: 'Recon Basics',
    desc: 'SELECT, WHERE, LIMIT, ORDER BY',
    count: 10,
    color: C.online,
  },
  {
    id: 'S-02',
    name: 'Aggregation Zone',
    desc: 'COUNT, SUM, AVG, GROUP BY, HAVING',
    count: 12,
    color: C.signal,
  },
  {
    id: 'S-03',
    name: 'Joins Galaxy',
    desc: 'INNER, LEFT, RIGHT, FULL, CROSS',
    count: 14,
    color: C.pLight,
  },
  {
    id: 'S-04',
    name: 'Subquery Den',
    desc: 'Correlated, scalar, EXISTS, IN',
    count: 10,
    color: C.xp,
  },
  {
    id: 'S-05',
    name: 'Window Functions',
    desc: 'RANK, ROW_NUMBER, LAG, LEAD, OVER',
    count: 12,
    color: '#ff6b9d',
  },
]

export default function MissionPathSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section ref={ref} style={{ padding: '100px 48px', borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 1300, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: 64 }}
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
            MISSION SECTORS
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
            A structured path to
            <br />
            SQL mastery
          </h2>
        </motion.div>

        <div style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
          {SECTORS.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                flex: 1,
                position: 'relative',
                padding: '28px 24px',
                background:
                  hovered === i
                    ? `rgba(${s.color === C.online ? '0,229,160' : s.color === C.signal ? '0,212,255' : s.color === C.pLight ? '123,126,248' : s.color === C.xp ? '255,202,40' : '255,107,157'},0.06)`
                    : C.hull,
                border: `1px solid ${hovered === i ? s.color + '44' : C.border}`,
                borderRadius: 12,
                marginRight: i < SECTORS.length - 1 ? -1 : 0,
                transition: 'all 0.25s',
                cursor: 'default',
                zIndex: hovered === i ? 2 : 1,
              }}
            >
              <div
                style={{
                  fontFamily: F.ui,
                  fontSize: 10,
                  color: s.color,
                  opacity: 0.7,
                  letterSpacing: '0.1em',
                  marginBottom: 14,
                }}
              >
                {s.id}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: s.color,
                    boxShadow: `0 0 10px ${s.color}88`,
                    flexShrink: 0,
                  }}
                />
                {i < SECTORS.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: `linear-gradient(90deg, ${s.color}44, transparent)`,
                    }}
                  />
                )}
              </div>

              <h3
                style={{
                  fontFamily: F.display,
                  fontWeight: 700,
                  fontSize: 15,
                  color: C.t1,
                  marginBottom: 8,
                  letterSpacing: '-0.02em',
                }}
              >
                {s.name}
              </h3>
              <p
                style={{
                  fontFamily: F.ui,
                  fontSize: 11,
                  color: C.t3,
                  lineHeight: 1.6,
                  marginBottom: 16,
                }}
              >
                {s.desc}
              </p>
              <div
                style={{
                  fontFamily: F.ui,
                  fontSize: 10,
                  color: s.color,
                  opacity: 0.6,
                }}
              >
                {s.count} missions
              </div>

              <motion.div
                animate={{
                  opacity: hovered === i ? 1 : 0,
                  y: hovered === i ? 0 : 4,
                }}
                style={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  fontFamily: F.ui,
                  fontSize: 10,
                  color: s.color,
                  letterSpacing: '0.06em',
                }}
              >
                {i === 0 ? 'UNLOCKED \u2197' : 'LOCKED'}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
