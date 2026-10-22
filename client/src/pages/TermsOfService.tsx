import { Link } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'

export default function TermsOfService() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
        padding: '48px 24px',
      }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--brand-primary)',
            textDecoration: 'none',
            fontSize: 13,
            fontFamily: 'var(--font-sans)',
            marginBottom: 24,
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to SQL Compass</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: 'var(--brand-muted)',
              border: '1px solid var(--brand-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--brand-primary)',
            }}
          >
            <FileText size={20} />
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            Terms of Service
          </h1>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 12,
            padding: '32px 28px',
            lineHeight: 1.6,
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            color: 'var(--text-secondary)',
          }}
        >
          <p style={{ marginBottom: 16 }}>
            Effective Date: October 2026. By accessing or using SQL Compass, you agree to these Terms of Service.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: '24px 0 8px' }}>
            1. Use of SQL Execution Sandbox
          </h2>
          <p style={{ marginBottom: 12 }}>
            SQL Compass provides interactive query execution environments strictly for educational, learning, and interview preparation purposes. Automated abuse, denial of service attempts, or malicious exploits against the execution sandbox are strictly prohibited.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: '24px 0 8px' }}>
            2. Account Security and 2FA
          </h2>
          <p style={{ marginBottom: 12 }}>
            Users are responsible for safeguarding their login credentials. We offer and strongly encourage enabling Time-Based One-Time Password (TOTP) two-factor authentication to secure administrative and developer accounts.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: '24px 0 8px' }}>
            3. Availability and Modifications
          </h2>
          <p style={{ marginBottom: 12 }}>
            We reserve the right to update or modify features, challenge sets, and sandbox environments at any time to improve reliability and security.
          </p>
        </div>
      </div>
    </div>
  )
}
