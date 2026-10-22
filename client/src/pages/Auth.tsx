import { useState, useEffect } from 'react'
import { Navigate, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  Compass,
  Shield,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react'

export default function Auth() {
  const {
    isLoaded,
    isSignedIn,
    signInWithGoogle,
    signInWithPassword,
    handleOAuthCallback,
    verify2FALogin,
    requestPasswordReset,
  } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<'google' | 'admin'>('google')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isExchangingCode, setIsExchangingCode] = useState(false)

  // 2FA Challenge State
  const [mfaChallenge, setMfaChallenge] = useState<{ challengeToken: string; email: string } | null>(null)

  // Forgot Password State
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [devResetToken, setDevResetToken] = useState<string | null>(null)

  const oauthCode = searchParams.get('code')

  useEffect(() => {
    if (oauthCode && !isSignedIn && !mfaChallenge) {
      setIsExchangingCode(true)
      setErrorMessage(null)
      handleOAuthCallback(oauthCode)
        .then((res) => {
          if (res.mfaRequired && res.challengeToken) {
            setMfaChallenge({
              challengeToken: res.challengeToken,
              email: res.email || '',
            })
            setIsExchangingCode(false)
          } else {
            navigate('/dashboard', { replace: true })
          }
        })
        .catch((err) => {
          const msg = err instanceof Error ? err.message : String(err)
          setErrorMessage(`Google authentication failed: ${msg}`)
          setIsExchangingCode(false)
        })
    }
  }, [oauthCode, isSignedIn, mfaChallenge, handleOAuthCallback, navigate])

  if (!isLoaded) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>
          Loading authentication...
        </div>
      </div>
    )
  }

  if (isSignedIn && !isExchangingCode && !mfaChallenge) {
    return <Navigate to="/dashboard" replace />
  }

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await signInWithPassword(email, password)
      if (res.mfaRequired && res.challengeToken) {
        setMfaChallenge({
          challengeToken: res.challengeToken,
          email: res.email || email,
        })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Authentication failed'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mfaChallenge || !totpCode) {
      setErrorMessage('Please enter your 6-digit authenticator code.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await verify2FALogin(mfaChallenge.challengeToken, totpCode)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Two-factor verification failed'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail) {
      setErrorMessage('Please enter your email address.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)
    setDevResetToken(null)

    try {
      const res = await requestPasswordReset(resetEmail)
      setSuccessMessage(res.message || 'Password reset instructions have been generated.')
      if (res.resetToken) {
        setDevResetToken(res.resetToken)
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to request password reset'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleClick = async () => {
    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      await signInWithGoogle()
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to start Google sign-in'
      setErrorMessage(msg)
      setIsSubmitting(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-canvas)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
              marginBottom: 16,
            }}
          >
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
              <Compass size={22} />
            </div>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 20,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              SQL Compass
            </span>
          </Link>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 24,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              marginBottom: 6,
            }}
          >
            {mfaChallenge
              ? 'Two-Factor Verification'
              : showForgotPassword
              ? 'Reset Password'
              : isExchangingCode
              ? 'Verifying authentication...'
              : 'Sign in to your account'}
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-muted)' }}>
            {mfaChallenge
              ? 'Enter the 6-digit code from your authenticator app to proceed.'
              : showForgotPassword
              ? 'Enter your account email to receive a secure, time-limited reset link.'
              : 'Practice SQL interview challenges with isolated sandbox execution.'}
          </p>
        </div>

        {/* Auth Card */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 14,
            padding: '32px 28px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
          }}
        >
          {isExchangingCode ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <Loader2
                size={36}
                color="var(--brand-primary)"
                className="animate-spin"
                style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }}
              />
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
                Completing token exchange with Google...
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                Validating cryptographic signatures
              </div>
            </div>
          ) : mfaChallenge ? (
            /* 2FA Challenge Screen */
            <form onSubmit={handle2FASubmit}>
              <div
                style={{
                  padding: 12,
                  borderRadius: 8,
                  background: 'var(--brand-muted)',
                  border: '1px solid var(--brand-border)',
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <KeyRound size={18} color="var(--brand-primary)" style={{ flexShrink: 0 }} />
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-primary)' }}>
                  Verifying account: <strong>{mfaChallenge.email}</strong>
                </div>
              </div>

              {errorMessage && (
                <div
                  style={{
                    marginBottom: 16,
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: 'var(--status-danger-bg)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                  }}
                >
                  <AlertCircle size={16} color="var(--status-danger)" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--status-danger)', lineHeight: 1.4 }}>
                    {errorMessage}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 22 }}>
                <label
                  htmlFor="totp-code"
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: 6,
                  }}
                >
                  6-Digit Authenticator Code
                </label>
                <input
                  id="totp-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  autoFocus
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: '1px solid var(--border-default)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 22,
                    letterSpacing: '0.3em',
                    textAlign: 'center',
                    outline: 'none',
                  }}
                />
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--text-muted)', marginTop: 6, textAlign: 'center' }}>
                  Anti-replay protection active: single-use within 30-second window.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || totpCode.length !== 6}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--brand-primary)',
                  color: '#ffffff',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: isSubmitting || totpCode.length !== 6 ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting || totpCode.length !== 6 ? 0.6 : 1,
                  marginBottom: 12,
                }}
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <span>Verify & Sign In</span>}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMfaChallenge(null)
                  setTotpCode('')
                  setErrorMessage(null)
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <ArrowLeft size={14} />
                <span>Back to login</span>
              </button>
            </form>
          ) : showForgotPassword ? (
            /* Forgot Password Flow */
            <form onSubmit={handleForgotPasswordSubmit}>
              {errorMessage && (
                <div
                  style={{
                    marginBottom: 16,
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: 'var(--status-danger-bg)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                  }}
                >
                  <AlertCircle size={16} color="var(--status-danger)" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--status-danger)', lineHeight: 1.4 }}>
                    {errorMessage}
                  </div>
                </div>
              )}

              {successMessage && (
                <div
                  style={{
                    marginBottom: 16,
                    padding: '12px 14px',
                    borderRadius: 8,
                    background: 'var(--status-success-bg, rgba(34, 197, 94, 0.1))',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                  }}
                >
                  <CheckCircle2 size={16} color="var(--status-success, #22c55e)" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--status-success, #22c55e)', lineHeight: 1.4 }}>
                    {successMessage}
                  </div>
                </div>
              )}

              {devResetToken && (
                <div
                  style={{
                    marginBottom: 16,
                    padding: 12,
                    borderRadius: 8,
                    background: 'var(--bg-subtle)',
                    border: '1px dashed var(--brand-border)',
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Local Dev Reset Link (Valid for 15 minutes):
                  </div>
                  <Link
                    to={`/reset-password?token=${devResetToken}`}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: 'var(--brand-primary)',
                      wordBreak: 'break-all',
                      textDecoration: 'underline',
                    }}
                  >
                    Click to open Reset Password Screen
                  </Link>
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <label
                  htmlFor="reset-email"
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: 6,
                  }}
                >
                  Account Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="you@domain.com"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 36px',
                      borderRadius: 8,
                      border: '1px solid var(--border-default)',
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                  <Mail
                    size={15}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--brand-primary)',
                  color: '#ffffff',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 14,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1,
                  marginBottom: 12,
                }}
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <span>Generate Reset Link</span>}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false)
                  setErrorMessage(null)
                  setSuccessMessage(null)
                }}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <ArrowLeft size={14} />
                <span>Return to sign in</span>
              </button>
            </form>
          ) : (
            <>
              {/* Tab Selector */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  background: 'var(--bg-subtle)',
                  borderRadius: 8,
                  padding: 3,
                  marginBottom: 24,
                  border: '1px solid var(--border-default)',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('google')
                    setErrorMessage(null)
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: 'none',
                    background: activeTab === 'google' ? 'var(--bg-card)' : 'transparent',
                    color: activeTab === 'google' ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 13,
                    fontWeight: activeTab === 'google' ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: activeTab === 'google' ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
                  }}
                >
                  Google Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('admin')
                    setErrorMessage(null)
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    border: 'none',
                    background: activeTab === 'admin' ? 'var(--bg-card)' : 'transparent',
                    color: activeTab === 'admin' ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 13,
                    fontWeight: activeTab === 'admin' ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: activeTab === 'admin' ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
                  }}
                >
                  Admin Credentials
                </button>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div
                  style={{
                    marginBottom: 20,
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: 'var(--status-danger-bg)',
                    border: '1px solid rgba(244, 63, 94, 0.3)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                  }}
                >
                  <AlertCircle size={16} color="var(--status-danger)" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--status-danger)', lineHeight: 1.4 }}>
                    {errorMessage}
                  </div>
                </div>
              )}

              {activeTab === 'google' ? (
                <div>
                  <button
                    type="button"
                    onClick={handleGoogleClick}
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      padding: '12px 18px',
                      borderRadius: 8,
                      border: '1px solid var(--border-default)',
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 14,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 12,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                      opacity: isSubmitting ? 0.7 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.borderColor = 'var(--brand-primary)'
                        e.currentTarget.style.background = 'var(--bg-subtle)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.borderColor = 'var(--border-default)'
                        e.currentTarget.style.background = 'var(--bg-elevated)'
                      }
                    }}
                  >
                    {isSubmitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                      </svg>
                    )}
                    <span>Continue with Google</span>
                  </button>

                  <div
                    style={{
                      marginTop: 20,
                      padding: 12,
                      borderRadius: 8,
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <Shield size={16} color="var(--brand-primary)" style={{ flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      Secured with HttpOnly cookies, server-side OIDC verification, and optional TOTP 2FA.
                    </span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAdminSubmit}>
                  <div style={{ marginBottom: 16 }}>
                    <label
                      htmlFor="admin-email"
                      style={{
                        display: 'block',
                        fontFamily: 'var(--font-sans)',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        marginBottom: 6,
                      }}
                    >
                      Email Address
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="admin-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@sqlcompass.internal"
                        required
                        style={{
                          width: '100%',
                          padding: '10px 14px 10px 36px',
                          borderRadius: 8,
                          border: '1px solid var(--border-default)',
                          background: 'var(--bg-elevated)',
                          color: 'var(--text-primary)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 13,
                          outline: 'none',
                        }}
                      />
                      <Mail
                        size={15}
                        color="var(--text-muted)"
                        style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label
                        htmlFor="admin-password"
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'var(--text-secondary)',
                        }}
                      >
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(true)
                          setErrorMessage(null)
                          setResetEmail(email)
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          fontFamily: 'var(--font-sans)',
                          fontSize: 12,
                          color: 'var(--brand-primary)',
                          cursor: 'pointer',
                        }}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="admin-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        required
                        style={{
                          width: '100%',
                          padding: '10px 14px 10px 36px',
                          borderRadius: 8,
                          border: '1px solid var(--border-default)',
                          background: 'var(--bg-elevated)',
                          color: 'var(--text-primary)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 13,
                          outline: 'none',
                        }}
                      />
                      <Lock
                        size={15}
                        color="var(--text-muted)"
                        style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      padding: '12px 18px',
                      borderRadius: 8,
                      border: 'none',
                      background: 'var(--brand-primary)',
                      color: '#ffffff',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 14,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      transition: 'background 0.15s ease',
                      opacity: isSubmitting ? 0.7 : 1,
                    }}
                  >
                    {isSubmitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        {/* Footer links with Terms and Privacy for Google OAuth Compliance */}
        <div style={{ textAlign: 'center', marginTop: 24, display: 'flex', justifyContent: 'center', gap: 16 }}>
          <Link
            to="/privacy"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
              color: 'var(--text-muted)',
              textDecoration: 'none',
            }}
          >
            Privacy Policy
          </Link>
          <span style={{ color: 'var(--border-default)' }}>|</span>
          <Link
            to="/terms"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
              color: 'var(--text-muted)',
              textDecoration: 'none',
            }}
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  )
}