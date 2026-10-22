import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { C, F } from './landingTokens'

const TESTIMONIALS = [
  {
    text: "Finally a SQL tool that doesn't hold your hand. The AI hints nudge without spoiling. Went from zero to Query Architect in 3 weeks.",
    author: 'Backend dev, 2 YoE',
  },
  {
    text: 'The mission structure made it feel like a game. I genuinely looked forward to doing SQL problems.',
    author: 'Data analyst @ fintech',
  },
  {
    text: 'Real PostgreSQL, real errors, real learning. Every other platform felt like training wheels after this.',
    author: 'CS student, final year',
  },
]

export default function SocialProofSection() {
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
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          style={{
            fontFamily: F.ui,
            fontSize: 11,
            color: C.t3,
            letterSpacing: '0.12em',
            marginBottom: 40,
            textAlign: 'center',
          }}
        >
          OPERATIVE DEBRIEF
        </motion.p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 14,
          }}
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              style={{
                padding: '28px 26px',
                background: C.hull,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                position: 'relative',
              }}
            >
              <div
                style={{
                  fontFamily: F.ui,
                  fontSize: 24,
                  color: C.primary,
                  lineHeight: 1,
                  marginBottom: 14,
                  opacity: 0.4,
                }}
              >
                &ldquo;
              </div>
              <p
                style={{
                  fontFamily: F.body,
                  fontSize: 14,
                  color: C.t2,
                  lineHeight: 1.75,
                  marginBottom: 20,
                }}
              >
                {t.text}
              </p>
              <div
                style={{
                  fontFamily: F.ui,
                  fontSize: 10,
                  color: C.t3,
                  letterSpacing: '0.06em',
                }}
              >
                &mdash; {t.author}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
