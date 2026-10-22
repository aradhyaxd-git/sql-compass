import React, { useState } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { User, Lock, Mail, Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { AuthContextOutletType } from './AuthLayout'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'
import Card from '@/components/ui/Card'

export const RegisterForm: React.FC = () => {
  const { signUp, signInWithGoogle } = useAuth()
  const { onRequireMfa } = useOutletContext<AuthContextOutletType>()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      setErrorMessage('All fields are required.')
      return
    }

    if (username.trim().length < 3) {
      setErrorMessage('Username must be at least 3 characters long.')
      return
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username.trim())) {
      setErrorMessage('Username can only contain letters, numbers, underscores, and hyphens.')
      return
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await signUp(name.trim(), username.trim(), email.trim(), password)
      if (res.mfaRequired && res.challengeToken) {
        onRequireMfa(res)
      } else {
        toast.success('Account created successfully')
        navigate('/dashboard', { replace: true })
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed'
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
          Create Account
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
          Join SQL-Compass and start solving real-world database challenges.
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border-default)' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>OR</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border-default)' }} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Input
          label="Full Name"
          type="text"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ada Lovelace"
          leftIcon={<User size={16} />}
          disabled={isSubmitting}
        />

        <Input
          label="Username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="ada_lovelace"
          leftIcon={<User size={16} />}
          helperText="3-20 characters: letters, numbers, underscores, and hyphens."
          disabled={isSubmitting}
        />

        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ada@example.com"
          leftIcon={<Mail size={16} />}
          disabled={isSubmitting}
        />

        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          leftIcon={<Lock size={16} />}
          disabled={isSubmitting}
        />

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
              <span>Create Account</span>
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </form>

      <div style={{ marginTop: 22, textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
          Already have an account?{' '}
          <Link
            to="/auth/login"
            style={{
              color: 'var(--brand-primary)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </Card>
  )
}

export default RegisterForm
