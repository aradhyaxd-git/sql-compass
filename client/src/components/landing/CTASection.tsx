import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { C, F, Icon, Show } from './landingTokens'

export default function CTASection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} style={{ padding: '80px 48px 120px', borderTop: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          style={{
            position: 'relative',
            padding: '72px 56px',
            borderRadius: 20,
            border: `1px solid rgba(91,94,244,0.2)`,
            background: `radial-gradient(ellipse at 50% 0%, rgba(91,94,244,0.08) 0%, transparent 70%), ${C.hull}`,
            overflow: 'hidden',
          }}
        >
          {/* HUD corners */}
          {(['tl', 'tr', 'bl', 'br'] as const).map((pos) => {
            const isTop = pos[0] === 't',
              isLeft = pos[1] === 'l'
            return (
              <div
                key={pos}
                style={{
                  position: 'absolute',
                  [isTop ? 'top' : 'bottom']: 0,
                  [isLeft ? 'left' : 'right']: 0,
                  width: 20,
                  height: 20,
                  borderTop: isTop ? `1px solid ${C.borderA}` : 'none',
                  borderBottom: !isTop ? `1px solid ${C.borderA}` : 'none',
                  borderLeft: isLeft ? `1px solid ${C.borderA}` : 'none',
                  borderRight: !isLeft ? `1px solid ${C.borderA}` : 'none',
                }}
              />
            )
          })}

          {/* Animated scan line */}
          <motion.div
            animate={{ top: ['-2px', '102%'] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear',
              repeatDelay: 2,
            }}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: 1,
              background: `linear-gradient(90deg, transparent, ${C.pLight}, transparent)`,
              opacity: 0.4,
              pointerEvents: 'none',
            }}
          />

          <p
            style={{
              fontFamily: F.ui,
              fontSize: 11,
              color: C.t3,
              letterSpacing: '0.12em',
              marginBottom: 20,
            }}
          >
            MISSION BRIEFING
          </p>
          <h2
            style={{
              fontFamily: F.display,
              fontWeight: 700,
              fontSize: 'clamp(32px, 4vw, 52px)',
              color: C.t1,
              letterSpacing: '-0.02em',
              marginBottom: 16,
              lineHeight: 1.05,
            }}
          >
            Ready to begin
            <br />
            your mission?
          </h2>
          <p
            style={{
              fontFamily: F.body,
              fontSize: 15,
              color: C.t2,
              lineHeight: 1.75,
              marginBottom: 36,
              maxWidth: 480,
              margin: '0 auto 36px',
            }}
          >
            500+ operatives already training. No credit card. No setup. Real PostgreSQL. Real progress. Your rank is waiting.
          </p>
          <Show when="signed-out">
            <Link to="/auth/register" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{
                  scale: 1.04,
                  boxShadow: `0 0 60px rgba(91,94,244,0.5), 0 0 100px rgba(91,94,244,0.15)`,
                }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  background: `linear-gradient(135deg, ${C.primary} 0%, #7b55f8 100%)`,
                  border: 'none',
                  color: '#fff',
                  padding: '14px 32px',
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: F.body,
                  letterSpacing: '-0.01em',
                  boxShadow: `0 0 32px rgba(91,94,244,0.3)`,
                }}
              >
                Begin Mission
                <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <Icon.Arrow />
                </motion.span>
              </motion.button>
            </Link>
          </Show>
          <Show when="signed-in">
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{
                  scale: 1.04,
                  boxShadow: `0 0 60px rgba(91,94,244,0.5)`,
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  background: `linear-gradient(135deg, ${C.primary} 0%, #7b55f8 100%)`,
                  border: 'none',
                  color: '#fff',
                  padding: '14px 32px',
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: F.body,
                }}
              >
                Mission Control <Icon.Arrow />
              </motion.button>
            </Link>
          </Show>
        </motion.div>
      </div>
    </section>
  )
}
