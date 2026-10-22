import React, { useState } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { User, Lock, Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { AuthContextOutletType } from './AuthLayout'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import Card from '@/components/ui/Card'

export const LoginForm: React.FC = () => {
  const { signIn, signInWithGoogle } = useAuth()
  const { onRequireMfa, onRequireUsername } = useOutletContext<AuthContextOutletType>()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      setErrorMessage('Please enter your username and password.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await signIn(username, password)
      if (res.needsUsername && res.challengeToken) {
        onRequireUsername(res.challengeToken)
      } else if (res.mfaRequired && res.challengeToken) {
        onRequireMfa(res)
      } else {
        toast.success('Signed in successfully')
        navigate('/dashboard', { replace: true })
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Authentication failed'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initiate Google authentication')
    }
  }

  return (
    <Card variant="elevated" padding="lg">
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
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
          Sign In
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
          Enter your username and password to continue.
        </p>
      </div>

      {errorMessage && (
        <div style={{ marginBottom: 18 }}>
          <Alert type="error" message={errorMessage} onClose={() => setErrorMessage(null)} />
        </div>
      )}

      {/* Google Sign In Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        style={{
          width: '100%',
          padding: '10px 16px',
          borderRadius: 8,
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          cursor: 'pointer',
          transition: 'background-color 0.15s ease, border-color 0.15s ease',
          marginBottom: 20,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Divider */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div style={{ flex: 1, height: 1, background: 'var(--border-default)' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>OR</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border-default)' }} />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Input
          label="Username"
          type="text"
          autoComplete="username"
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="your_username"
          leftIcon={<User size={16} />}
          disabled={isSubmitting}
        />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <label
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}
            >
              Password
            </label>
            <Link
              to="/auth/reset-password"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                color: 'var(--brand-primary)',
                textDecoration: 'none',
              }}
            >
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            leftIcon={<Lock size={16} />}
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
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
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 6,
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

      {/* Switch to Register */}
      <div style={{ marginTop: 22, textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
          Don't have an account?{' '}
          <Link
            to="/auth/register"
            style={{
              color: 'var(--brand-primary)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Create account
          </Link>
        </p>
      </div>
    </Card>
  )
}

export default LoginForm
