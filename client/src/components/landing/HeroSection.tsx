import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { C, F, Icon, Pulse, TiltCard, Show } from './landingTokens'

const TERM_LINES = [
  { t: 'sys', v: '[ SQL COMPASS v1.0 ] — MISSION CONTROL INITIALIZING' },
  { t: 'sys', v: 'Bootstrapping PostgreSQL sandbox cluster...' },
  { t: 'ok', v: 'OK  Cluster ready  |  3 tables  |  8,420 rows' },
  { t: 'sys', v: 'Loading mission: "Revenue by Quarter"' },
  { t: 'blank', v: '' },
  { t: 'kw', v: 'SELECT ' },
  { t: 'field', v: "  DATE_TRUNC('quarter', order_date) AS quarter," },
  { t: 'field', v: '  SUM(total_amount)                 AS revenue,' },
  { t: 'field', v: '  COUNT(*)                          AS orders' },
  { t: 'kw', v: 'FROM orders' },
  { t: 'kw', v: 'GROUP BY 1' },
  { t: 'kw', v: 'ORDER BY 1;' },
  { t: 'blank', v: '' },
  { t: 'head', v: '  quarter    │  revenue   │  orders ' },
  { t: 'div', v: '─────────────┼────────────┼─────────' },
  { t: 'row', v: '  2024-Q1    │  $142,840  │    342  ' },
  { t: 'row', v: '  2024-Q2    │  $189,220  │    451  ' },
  { t: 'row', v: '  2024-Q3    │  $203,770  │    489  ' },
  { t: 'blank', v: '' },
  { t: 'xp', v: '>>  MISSION COMPLETE  ·  +40 XP  ·  STREAK 12 DAYS' },
]

export function HeroTerminal() {
  const [line, setLine] = useState(0)
  const [char, setChar] = useState(0)

  useEffect(() => {
    if (line >= TERM_LINES.length) return
    const cur = TERM_LINES[line]
    if (cur.t === 'blank') {
      setTimeout(() => {
        setLine((l) => l + 1)
        setChar(0)
      }, 120)
      return
    }
    if (char >= cur.v.length) {
      const t = setTimeout(() => {
        setLine((l) => l + 1)
        setChar(0)
      }, 60)
      return () => clearTimeout(t)
    }
    const speed = cur.t === 'sys' ? 18 : cur.t === 'kw' || cur.t === 'field' ? 28 : 10
    const t = setTimeout(() => setChar((c) => c + 1), speed)
    return () => clearTimeout(t)
  }, [line, char])

  const colorMap: Record<string, string> = {
    sys: C.t3,
    ok: C.online,
    kw: C.pLight,
    field: C.t2,
    head: C.t3,
    div: C.t4,
    row: C.t1,
    xp: C.xp,
    blank: 'transparent',
  }

  return (
    <TiltCard style={{ position: 'relative', zIndex: 10 }}>
      <div
        style={{
          background: 'rgba(8,8,15,0.85)',
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          overflow: 'hidden',
          boxShadow: `0 0 0 1px rgba(91,94,244,0.08), 0 32px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)`,
          backdropFilter: 'blur(24px)',
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 300,
            height: 200,
            background: `radial-gradient(ellipse, ${C.pGlow} 0%, transparent 70%)`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '11px 16px',
            background: 'rgba(13,13,24,0.9)',
            borderBottom: `1px solid ${C.border}`,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', gap: 7 }}>
            {['#ff3b30', '#ffcc02', '#28c940'].map((c, i) => (
              <div
                key={i}
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: '50%',
                  background: c,
                  opacity: 0.85,
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Pulse color={C.online} />
            <span
              style={{
                fontFamily: F.ui,
                fontSize: 11,
                color: C.t4,
                letterSpacing: '0.07em',
              }}
            >
              mission_terminal.sql
            </span>
          </div>
          <span style={{ fontFamily: F.ui, fontSize: 10, color: C.t4 }}>⌘↵ run</span>
        </div>

        <div
          style={{
            padding: '18px 22px 22px',
            fontFamily: F.sql,
            fontSize: 12.5,
            lineHeight: 1.85,
            minHeight: 340,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {TERM_LINES.slice(0, line).map((l, i) => (
            <div key={i} style={{ color: colorMap[l.t] || C.t2, whiteSpace: 'pre' }}>
              {l.v}
            </div>
          ))}
          {line < TERM_LINES.length && (
            <div
              style={{
                color: colorMap[TERM_LINES[line].t] || C.t2,
                whiteSpace: 'pre',
              }}
            >
              {TERM_LINES[line].v.slice(0, char)}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.55, repeat: Infinity }}
                style={{ color: C.primary }}
              >
                ▋
              </motion.span>
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '9px 16px',
            background: 'rgba(13,13,24,0.9)',
            borderTop: `1px solid ${C.border}`,
          }}
        >
          <span style={{ fontFamily: F.ui, fontSize: 10, color: C.t4 }}>PostgreSQL 16 · sandbox</span>
          <span style={{ fontFamily: F.ui, fontSize: 10, color: C.pLight }}>EX-01 · Explorer · 0 XP</span>
        </div>
      </div>
    </TiltCard>
  )
}

export default function HeroSection() {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        paddingTop: 54,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '40%',
          width: '70vw',
          height: '80vh',
          background: `radial-gradient(ellipse at center, rgba(91,94,244,0.06) 0%, transparent 65%)`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-5%',
          right: '-5%',
          width: '40vw',
          height: '50vh',
          background: `radial-gradient(ellipse, rgba(0,212,255,0.04) 0%, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 1300,
          margin: '0 auto',
          padding: '80px 48px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.15fr',
            gap: 72,
            alignItems: 'center',
          }}
        >
          <div>
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 28,
              }}
            >
              <Pulse />
              <span
                style={{
                  fontFamily: F.ui,
                  fontSize: 11,
                  color: C.t3,
                  letterSpacing: '0.12em',
                }}
              >
                MISSION CONTROL — ONLINE
              </span>
              <span
                style={{
                  fontFamily: F.ui,
                  fontSize: 10,
                  color: C.primary,
                  marginLeft: 4,
                }}
              >
                [{String(new Date().toISOString().slice(0, 16)).replace('T', ' ')}]
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              style={{
                fontFamily: F.display,
                fontWeight: 700,
                fontSize: 'clamp(42px, 5vw, 68px)',
                color: C.t1,
                lineHeight: 1.1,
                letterSpacing: '-0.015em',
                marginBottom: 4,
              }}
            >
              Navigate the
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18 }}
              style={{
                fontFamily: F.display,
                fontWeight: 700,
                fontSize: 'clamp(42px, 5vw, 68px)',
                lineHeight: 1.1,
                letterSpacing: '-0.015em',
                marginBottom: 28,
                backgroundImage: `linear-gradient(110deg, ${C.primary} 0%, ${C.pLight} 40%, ${C.signal} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              world of SQL.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.28 }}
              style={{
                fontSize: 15,
                color: C.t2,
                lineHeight: 1.78,
                maxWidth: 400,
                marginBottom: 36,
                fontFamily: F.body,
              }}
            >
              Mission-based SQL training on real PostgreSQL databases. Write queries. Get AI signals. Earn your rank. Built for developers who learn by doing.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.36 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 52,
              }}
            >
              <Show when="signed-out">
                <Link to="/auth/register" style={{ textDecoration: 'none' }}>
                  <motion.button
                    whileHover={{
                      scale: 1.03,
                      boxShadow: `0 0 40px rgba(91,94,244,0.4), 0 0 80px rgba(91,94,244,0.15)`,
                    }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 9,
                      background: `linear-gradient(135deg, ${C.primary} 0%, #7b55f8 100%)`,
                      border: 'none',
                      color: '#fff',
                      padding: '12px 26px',
                      borderRadius: 9,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: F.body,
                      letterSpacing: '-0.01em',
                      boxShadow: `0 0 28px rgba(91,94,244,0.25)`,
                    }}
                  >
                    Start Your SQL Journey
                    <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <Icon.Arrow />
                    </motion.span>
                  </motion.button>
                </Link>
                <Link to="/auth/login" style={{ textDecoration: 'none' }}>
                  <motion.button
                    whileHover={{ borderColor: C.border, color: C.t1 }}
                    style={{
                      background: 'none',
                      border: `1px solid ${C.t4}`,
                      color: C.t2,
                      padding: '12px 20px',
                      borderRadius: 9,
                      fontSize: 14,
                      cursor: 'pointer',
                      fontFamily: F.body,
                      transition: 'all 0.2s',
                    }}
                  >
                    View missions
                  </motion.button>
                </Link>
              </Show>
              <Show when="signed-in">
                <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                  <motion.button
                    whileHover={{
                      scale: 1.03,
                      boxShadow: `0 0 40px rgba(91,94,244,0.4)`,
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 9,
                      background: `linear-gradient(135deg, ${C.primary} 0%, #7b55f8 100%)`,
                      border: 'none',
                      color: '#fff',
                      padding: '12px 26px',
                      borderRadius: 9,
                      fontSize: 14,
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

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              style={{
                display: 'flex',
                gap: 0,
                borderTop: `1px solid ${C.t4}`,
                paddingTop: 24,
              }}
            >
              {[
                { n: '500+', l: 'Operatives' },
                { n: '50+', l: 'Missions' },
                { n: '5', l: 'SQL Ranks' },
                { n: '∞', l: 'Free forever' },
              ].map(({ n, l }, i) => (
                <div
                  key={l}
                  style={{
                    flex: 1,
                    paddingRight: 24,
                    borderRight: i < 3 ? `1px solid ${C.t4}` : 'none',
                    paddingLeft: i > 0 ? 24 : 0,
                  }}
                >
                  <p
                    style={{
                      fontFamily: F.display,
                      fontWeight: 800,
                      fontSize: 26,
                      color: C.t1,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {n}
                  </p>
                  <p
                    style={{
                      fontFamily: F.ui,
                      fontSize: 10,
                      color: C.t3,
                      marginTop: 3,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {l.toUpperCase()}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          <HeroTerminal />
        </div>
      </div>
    </section>
  )
}
