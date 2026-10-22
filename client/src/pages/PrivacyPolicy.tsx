import { Link } from 'react-router-dom'
import { ArrowLeft, Shield } from 'lucide-react'

export default function PrivacyPolicy() {
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
            <Shield size={20} />
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            Privacy Policy
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
            Effective Date: October 2026. This Privacy Policy explains how SQL Compass collects, uses, and protects your information.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: '24px 0 8px' }}>
            1. Information We Collect
          </h2>
          <p style={{ marginBottom: 12 }}>
            When you sign in using Google OAuth 2.0 or credentials, we receive basic profile information: your name, email address, and profile picture URL. We store this strictly to identify your account and personalize your progress tracking.
          </p>
          <p style={{ marginBottom: 12 }}>
            We store execution queries, challenge completion status, and experience points (XP) to maintain your mission progress.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: '24px 0 8px' }}>
            2. Token and Session Security
          </h2>
          <p style={{ marginBottom: 12 }}>
            SQL Compass does not store authentication session tokens in browser localStorage. Session tokens are transmitted exclusively via encrypted, HttpOnly, SameSite cookies to protect against cross-site scripting (XSS) and token theft.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: '24px 0 8px' }}>
            3. Third-Party Data Sharing
          </h2>
          <p style={{ marginBottom: 12 }}>
            We do not sell, rent, or share personal user data with third-party marketers or data brokers. Google OAuth tokens are validated server-side using Google Auth Library and are not exposed.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', margin: '24px 0 8px' }}>
            4. Data Retention and Deletion
          </h2>
          <p style={{ marginBottom: 12 }}>
            You may request complete account deletion or review of your stored data at any time by contacting our administrators.
          </p>
        </div>
      </div>
    </div>
  )
}
