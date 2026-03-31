import { motion } from 'framer-motion'

function StatusIndicator() {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <motion.span
        style={{ position: 'relative', width: 7, height: 7, borderRadius: '50%', background: '#10b981' }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: '#10b981', letterSpacing: '0.08em' }}>
        433 ONLINE
      </span>
    </span>
  )
}

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    { label: 'SGN_ACCESS', href: '#' },
    { label: 'LOGS', href: '#' },
    { label: 'MAN_PAGES', href: '#' },
    { label: 'SITEMAP', href: '#' },
  ]

  return (
    <footer style={{
      background: 'linear-gradient(to bottom, rgba(15,15,35,0), rgba(9,9,20,0.95))',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      padding: '32px 28px',
      marginTop: 'auto',
    }}>
      {/* Top Section - Title and Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        paddingBottom: 16,
        borderBottom: '1px dashed rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 13,
            fontWeight: 600,
            color: '#f1f5f9',
            letterSpacing: '0.15em',
          }}>
            SQL_COMPASS.EXE
          </span>
          <motion.span
            style={{
              display: 'inline-block',
              padding: '2px 8px',
              borderRadius: 3,
              background: 'rgba(16,185,138,0.15)',
              border: '1px solid rgba(16,185,138,0.3)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              color: '#10b981',
              letterSpacing: '0.1em',
            }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            433 ONLINE
          </motion.span>
        </div>
        <StatusIndicator />
      </div>

      {/* System Information */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 20,
        marginBottom: 24,
      }}>
        <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#64748b', lineHeight: 1.6 }}>
          <div style={{ color: '#94a3b8', marginBottom: 6 }}>STANDARD OPERATING PROCEDURE:</div>
          <div>v1.2.3-AMETHYST</div>
          <div>KERNEL INITIALIZED - ALL SYSTEMS NOMINAL</div>
        </div>

        <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#64748b', lineHeight: 1.6 }}>
          <div style={{ color: '#94a3b8', marginBottom: 6 }}>UPTIME:</div>
          <div>99.9% • {new Date().toLocaleDateString()}</div>
          <div>VERSION: v4.1.2-AMETHYST</div>
        </div>

        <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: '#64748b', lineHeight: 1.6 }}>
          <div style={{ color: '#94a3b8', marginBottom: 6 }}>BUILD INFO:</div>
          <div>© {currentYear} SQL COMPASS • BUILD 2841</div>
          <div>ENCRYPTED ISO-7 • AES-256</div>
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        paddingTop: 16,
        borderTop: '1px dashed rgba(255,255,255,0.08)',
        flexWrap: 'wrap',
      }}>
        {footerLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: '#64748b',
              textDecoration: 'none',
              letterSpacing: '0.08em',
              transition: 'color 0.15s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.color = '#22d3ee'
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.color = '#64748b'
            }}
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Bottom Status Bar */}
      <div style={{
        marginTop: 16,
        paddingTop: 12,
        borderTop: '1px dashed rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 9,
        fontFamily: "'JetBrains Mono', monospace",
        color: '#475569',
        letterSpacing: '0.06em',
      }}>
        <span>SYS_RUNTIME_COMPASS • READY</span>
        <span>BUILD: E971-3FF • 248-KB</span>
      </div>
    </footer>
  )
}
