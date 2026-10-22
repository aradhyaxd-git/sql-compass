import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Lock, KeyRound, Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import Card from '@/components/ui/Card'
import PasswordStrengthMeter from '@/components/ui/PasswordStrengthMeter'

export const PasswordResetForm: React.FC = () => {
  const { requestPasswordReset, completePasswordReset } = useAuth()
  const navigate = useNavigate()

  // Steps: 'request' | 'verify' | 'success'
  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request')
  const [username, setUsername] = useState('')
  const [challengeToken, setChallengeToken] = useState<string | null>(null)
  const [totpCode, setTotpCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) {
      setErrorMessage('Please enter your username.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await requestPasswordReset(username.trim())
      setChallengeToken(res.challengeToken)
      setStep('verify')
      toast.success('Account found. Enter your 2FA code to reset password.')
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to initiate password reset'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!challengeToken) {
      setErrorMessage('Session expired. Please request reset again.')
      setStep('request')
      return
    }

    if (totpCode.length !== 6) {
      setErrorMessage('Please enter the 6-digit authenticator code.')
      return
    }

    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await completePasswordReset(challengeToken, totpCode, newPassword)
      setStep('success')
      toast.success('Password reset successfully')
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to reset password'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card variant="elevated" padding="lg">
      <div style={{ textAlign: 'center', marginBottom: 22 }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: '0 0 6px 0',
          }}
        >
          {step === 'success' ? 'Password Reset' : 'Reset Password'}
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
          {step === 'request'
            ? 'Enter your username to begin 2FA-secured recovery.'
            : step === 'verify'
              ? 'Enter your 6-digit authenticator code and choose a new password.'
              : 'Your password has been securely updated.'}
        </p>
      </div>

      {errorMessage && (
        <div style={{ marginBottom: 18 }}>
          <Alert type="error" message={errorMessage} onClose={() => setErrorMessage(null)} />
        </div>
      )}

      {step === 'request' && (
        <form onSubmit={handleRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Username"
            type="text"
            autoFocus
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your_username"
            leftIcon={<User size={16} />}
            disabled={isSubmitting}
          />

          <button
            type="submit"
            disabled={isSubmitting || !username.trim()}
            style={{
              width: '100%',
              padding: '11px 16px',
              borderRadius: 8,
              background: 'var(--brand-primary)',
              border: 'none',
              color: '#ffffff',
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              fontWeight: 600,
              cursor: isSubmitting || !username.trim() ? 'not-allowed' : 'pointer',
              opacity: isSubmitting || !username.trim() ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 4,
            }}
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>
      )}

      {step === 'verify' && (
        <form onSubmit={handleVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input
            label="Authenticator Code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            autoFocus
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            leftIcon={<KeyRound size={16} />}
            style={{
              letterSpacing: '0.2em',
              textAlign: 'center',
              fontSize: 16,
            }}
            disabled={isSubmitting}
          />

          <Input
            label="New Password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
            leftIcon={<Lock size={16} />}
            disabled={isSubmitting}
          />

          <PasswordStrengthMeter password={newPassword} />

          <Input
            label="Confirm New Password"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            leftIcon={<Lock size={16} />}
            disabled={isSubmitting}
          />

          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button
              type="submit"
              disabled={isSubmitting || totpCode.length !== 6 || !newPassword}
              style={{
                flex: 1,
                padding: '11px 16px',
                borderRadius: 8,
                background: 'var(--brand-primary)',
                border: 'none',
                color: '#ffffff',
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                fontWeight: 600,
                cursor: isSubmitting || totpCode.length !== 6 || !newPassword ? 'not-allowed' : 'pointer',
                opacity: isSubmitting || totpCode.length !== 6 || !newPassword ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <span>Reset Password</span>}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('request')
                setTotpCode('')
                setNewPassword('')
                setConfirmPassword('')
                setErrorMessage(null)
              }}
              disabled={isSubmitting}
              style={{
                padding: '11px 16px',
                borderRadius: 8,
                background: 'transparent',
                border: '1px solid var(--border-default)',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-sans)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Back
            </button>
          </div>
        </form>
      )}

      {step === 'success' && (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--status-success, #22c55e)',
              margin: '0 auto 16px',
            }}
          >
            <CheckCircle2 size={26} />
          </div>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
            Your credentials have been updated. You can now log into your account using your new password.
          </p>

          <button
            type="button"
            onClick={() => navigate('/auth/login')}
            style={{
              width: '100%',
              padding: '11px 16px',
              borderRadius: 8,
              background: 'var(--brand-primary)',
              border: 'none',
              color: '#ffffff',
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Go to Sign In
          </button>
        </div>
      )}

      {/* Return to Sign In */}
      {step !== 'success' && (
        <div style={{ marginTop: 22, textAlign: 'center' }}>
          <Link
            to="/auth/login"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              color: 'var(--text-muted)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <ArrowLeft size={14} />
            <span>Return to Sign In</span>
          </Link>
        </div>
      )}
    </Card>
  )
}

export default PasswordResetForm
