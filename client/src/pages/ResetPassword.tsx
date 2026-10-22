import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  Compass,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()
  const { verifyResetToken, completePasswordReset } = useAuth()

  const [isValidating, setIsValidating] = useState(true)
  const [isValidToken, setIsValidToken] = useState(false)
  const [targetEmail, setTargetEmail] = useState('')
  const [remainingSeconds, setRemainingSeconds] = useState(0)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setIsValidating(false)
      setIsValidToken(false)
      return
    }

    verifyResetToken(token)
      .then((data) => {
        if (data.valid && (data.remainingSeconds || 0) > 0) {
          setIsValidToken(true)
          setTargetEmail(data.email || '')
          setRemainingSeconds(data.remainingSeconds || 0)
        } else {
          setIsValidToken(false)
        }
      })
      .catch(() => {
        setIsValidToken(false)
      })
      .finally(() => {
        setIsValidating(false)
      })
  }, [token, verifyResetToken])

  // Live countdown timer
  useEffect(() => {
    if (!isValidToken || remainingSeconds <= 0) return

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setIsValidToken(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isValidToken, remainingSeconds])

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password || !confirmPassword) {
      setErrorMessage('Please fill in both password fields.')
      return
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await completePasswordReset(token, password)
      setSuccess(true)
      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 1500)
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to reset password'
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
            Create New Password
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-muted)' }}>
            Single-use cryptographic reset token with strict temporal expiration.
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 14,
            padding: '32px 28px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
          }}
        >
          {isValidating ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <Loader2
                size={32}
                color="var(--brand-primary)"
                className="animate-spin"
                style={{ margin: '0 auto 16px', animation: 'spin 1s linear infinite' }}
              />
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-secondary)' }}>
                Validating cryptographic token signature...
              </div>
            </div>
          ) : !isValidToken ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <AlertCircle size={40} color="var(--status-danger)" style={{ margin: '0 auto 16px' }} />
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 18,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: 8,
                }}
              >
                Reset Link Expired or Invalid
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                  marginBottom: 24,
                }}
              >
                For your security, reset links are single-use and expire within 15 minutes. Please request a new link.
              </p>
              <Link
                to="/auth"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  borderRadius: 8,
                  background: 'var(--brand-primary)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <span>Return to Sign In</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : success ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <CheckCircle2 size={44} color="var(--status-success, #22c55e)" style={{ margin: '0 auto 16px' }} />
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 18,
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: 8,
                }}
              >
                Password Updated Successfully
              </h2>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-muted)' }}>
                Logging you into your account and redirecting to dashboard...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Temporal Expiry Banner */}
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: remainingSeconds < 120 ? 'var(--status-danger-bg)' : 'var(--bg-subtle)',
                  border: `1px solid ${remainingSeconds < 120 ? 'rgba(244, 63, 94, 0.4)' : 'var(--border-default)'}`,
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={16} color={remainingSeconds < 120 ? 'var(--status-danger)' : 'var(--brand-primary)'} />
                  <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-secondary)' }}>
                    Resetting: <strong>{targetEmail}</strong>
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: remainingSeconds < 120 ? 'var(--status-danger)' : 'var(--brand-primary)',
                  }}
                >
                  {formatCountdown(remainingSeconds)}
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

              <div style={{ marginBottom: 16 }}>
                <label
                  htmlFor="new-password"
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: 6,
                  }}
                >
                  New Password (min. 8 characters)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new secure password"
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

              <div style={{ marginBottom: 22 }}>
                <label
                  htmlFor="confirm-password"
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: 6,
                  }}
                >
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
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
                  <ShieldCheck
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
                }}
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <span>Update Password & Sign In</span>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
