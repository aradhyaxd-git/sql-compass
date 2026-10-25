import { Link } from 'react-router-dom'
import { Database, ShieldCheck, Cpu } from 'lucide-react'
import { getRunShortcut } from '@/utils/platform'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer style={{
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border-default)',
      padding: '40px 24px 28px',
      marginTop: 'auto',
      transition: 'background-color 0.2s ease, border-color 0.2s ease',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 32,
        marginBottom: 32,
      }}>
        {/* Brand column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <img
              src="/logo.png"
              alt="SQL Compass"
              style={{ width: 24, height: 24, objectFit: 'contain' }}
            />
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 15,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}>
              SQL Compass
            </span>
          </div>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: 280,
          }}>
            Interactive SQL mastery platform with deterministic evaluation, real PostgreSQL isolation, and adaptive guidance.
          </p>
        </div>

        {/* Resources */}
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-muted)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: 14,
          }}>
            Platform
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link to="/dashboard" style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontFamily: 'var(--font-sans)',
            }}>
              Challenges & Missions
            </Link>
            <Link to="/profile" style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              textDecoration: 'none',
              fontFamily: 'var(--font-sans)',
            }}>
              Flight Log & Progress
            </Link>
          </div>
        </div>

        {/* Architecture */}
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-muted)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: 14,
          }}>
            Platform Security
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={14} color="var(--status-online)" />
              <span>Protected Sandbox Environment</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Database size={14} color="var(--brand-primary)" />
              <span>PostgreSQL 16 Engine</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Cpu size={14} color="var(--accent-cyan)" />
              <span>Intelligent Hint Assistant</span>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--text-muted)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: 14,
          }}>
            Shortcuts
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 220 }}>
              <span>Execute Query</span>
              <kbd style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-default)',
                borderRadius: 4,
                padding: '2px 6px',
                fontSize: 10,
              }}>
                {getRunShortcut()}
              </kbd>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        paddingTop: 16,
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        fontSize: 12,
        fontFamily: 'var(--font-sans)',
        color: 'var(--text-muted)',
      }}>
        <div>
          © {currentYear} SQL Compass. Precision database learning.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-online)', display: 'inline-block' }} />
          <span>Live SQL Engine Ready</span>
        </div>
      </div>
    </footer>
  )
}
