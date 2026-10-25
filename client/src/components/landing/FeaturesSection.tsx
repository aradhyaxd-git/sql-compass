import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { C, F, Icon, TiltCard } from './landingTokens'

const FEATURES = [
  {
    icon: Icon.Terminal,
    label: 'SQL TERMINAL',
    title: 'Real editor.\nReal database.',
    desc: 'CodeMirror 6 with SQL syntax, autocomplete, and error highlighting. Runs against a live PostgreSQL cluster. Not a sandbox — a genuine cockpit.',
    wide: true,
    accent: C.pLight,
  },
  {
    icon: Icon.Bolt,
    label: 'LIVE EXECUTION',
    title: 'Results in milliseconds.',
    desc: 'Hit Run or your keyboard shortcut. Your query executes instantly. Structured table output, execution time, row count. Errors pinpoint the exact line.',
    wide: false,
    accent: C.signal,
  },
  {
    icon: Icon.Signal,
    label: 'AI SIGNAL',
    title: 'Hints, not handouts.',
    desc: 'The AI reads your query and the mission brief, then sends a signal — a directional nudge, not the answer.',
    wide: false,
    accent: C.online,
  },
  {
    icon: Icon.Shield,
    label: 'SCHEMA INTEL',
    title: 'Know before you query.',
    desc: 'Full table structure, column types, sample rows — all visible before you write a single character.',
    wide: false,
    accent: C.xp,
  },
  {
    icon: Icon.Chart,
    label: 'FLIGHT LOG',
    title: "Progress that's visible.",
    desc: 'XP, streaks, attempt history, rank progression. Every query you run is logged. Your growth compounds.',
    wide: false,
    accent: '#ff6b9d',
  },
]

export default function FeaturesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section
      ref={ref}
      style={{
        padding: '100px 48px',
        borderTop: `1px solid ${C.border}`,
        background: C.hull,
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
            SYSTEM CAPABILITIES
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
            Everything in the cockpit.
            <br />
            Nothing you don't need.
          </h2>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gridTemplateRows: 'auto auto',
            gap: 10,
          }}
        >
          <TiltCard style={{ gridColumn: '1 / 5', gridRow: '1 / 2' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.05 }}
              style={{
                padding: '36px 36px',
                background: C.hull,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 200,
                  height: 200,
                  background: `radial-gradient(circle at top right, ${FEATURES[0].accent}18, transparent 60%)`,
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                <div style={{ color: FEATURES[0].accent }}>
                  <Icon.Terminal />
                </div>
                <span
                  style={{
                    fontFamily: F.ui,
                    fontSize: 10,
                    color: C.t3,
                    letterSpacing: '0.1em',
                  }}
                >
                  {FEATURES[0].label}
                </span>
              </div>
              <h3
                style={{
                  fontFamily: F.display,
                  fontWeight: 800,
                  fontSize: 28,
                  color: C.t1,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                  marginBottom: 14,
                  whiteSpace: 'pre-line',
                }}
              >
                {FEATURES[0].title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: C.t2,
                  lineHeight: 1.7,
                  fontFamily: F.body,
                  maxWidth: 440,
                }}
              >
                {FEATURES[0].desc}
              </p>
              <div
                style={{
                  marginTop: 24,
                  background: C.deck,
                  borderRadius: 8,
                  padding: '14px 16px',
                  fontFamily: F.sql,
                  fontSize: 12,
                  color: C.pLight,
                  border: `1px solid ${C.border}`,
                }}
              >
                <span style={{ color: C.pLight }}>SELECT</span>
                <span style={{ color: C.t2 }}> id, name, score </span>
                <span style={{ color: C.pLight }}>FROM</span>
                <span style={{ color: C.t2 }}> missions </span>
                <span style={{ color: C.pLight }}>WHERE</span>
                <span style={{ color: C.online }}> completed </span>
                <span style={{ color: C.pLight }}>=</span>
                <span style={{ color: C.xp }}> true</span>
                <span style={{ color: C.t3 }}>;</span>
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  style={{ color: C.primary }}
                >
                  ▋
                </motion.span>
              </div>
            </motion.div>
          </TiltCard>

          <TiltCard style={{ gridColumn: '5 / 7', gridRow: '1 / 3' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              style={{
                padding: '32px',
                background: C.hull,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                height: '100%',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '50%',
                  background: `linear-gradient(0deg, ${FEATURES[1].accent}10, transparent)`,
                  pointerEvents: 'none',
                }}
              />
              <div style={{ color: FEATURES[1].accent, marginBottom: 14 }}>
                <Icon.Bolt />
              </div>
              <span
                style={{
                  fontFamily: F.ui,
                  fontSize: 10,
                  color: C.t3,
                  letterSpacing: '0.1em',
                }}
              >
                {FEATURES[1].label}
              </span>
              <h3
                style={{
                  fontFamily: F.display,
                  fontWeight: 800,
                  fontSize: 22,
                  color: C.t1,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  marginTop: 14,
                  marginBottom: 12,
                }}
              >
                {FEATURES[1].title}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: C.t2,
                  lineHeight: 1.7,
                  fontFamily: F.body,
                }}
              >
                {FEATURES[1].desc}
              </p>

              <div
                style={{
                  marginTop: 28,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div style={{ fontFamily: F.sql, fontSize: 11, color: C.online }}>
                  342 rows · 38ms
                </div>
                {[
                  ['Q1', '$142k'],
                  ['Q2', '$189k'],
                  ['Q3', '$204k'],
                ].map(([q, v]) => (
                  <div
                    key={q}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontFamily: F.ui,
                      fontSize: 11,
                    }}
                  >
                    <span style={{ color: C.t2 }}>{q}</span>
                    <span style={{ color: C.signal }}>{v}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </TiltCard>

          {FEATURES.slice(2).map((f, i) => (
            <TiltCard
              key={f.label}
              style={{
                gridColumn: `${i * 2 + 1} / ${i * 2 + 3}`,
                gridRow: '2 / 3',
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.15 + i * 0.06 }}
                style={{
                  padding: '26px 24px',
                  background: C.hull,
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 100,
                    height: 100,
                    background: `radial-gradient(circle at top right, ${f.accent}14, transparent 60%)`,
                    pointerEvents: 'none',
                  }}
                />
                <div style={{ color: f.accent, marginBottom: 12 }}>
                  <f.icon />
                </div>
                <span
                  style={{
                    fontFamily: F.ui,
                    fontSize: 10,
                    color: C.t3,
                    letterSpacing: '0.1em',
                  }}
                >
                  {f.label}
                </span>
                <h3
                  style={{
                    fontFamily: F.display,
                    fontWeight: 700,
                    fontSize: 16,
                    color: C.t1,
                    letterSpacing: '-0.02em',
                    marginTop: 10,
                    marginBottom: 9,
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: 12.5,
                    color: C.t2,
                    lineHeight: 1.65,
                    fontFamily: F.body,
                  }}
                >
                  {f.desc}
                </p>
              </motion.div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}
