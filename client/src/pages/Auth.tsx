import { useState, useEffect } from 'react'
import { Navigate, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  Compass,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  Loader2,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  Copy,
  Check,
} from 'lucide-react'

export default function Auth() {
  const {
    isLoaded,
    isSignedIn,
    signInWithGoogle,
    signIn,
    signUp,
    setUsername,
    handleOAuthCallback,
    verify2FALogin,
    confirm2FASetupWithChallenge,
    requestPasswordReset,
    completePasswordReset,
  } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // Form mode: 'signin' | 'signup' | 'forgot' | 'choose_username'
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'choose_username'>('signin')

  // Inputs
  const [usernameInput, setUsernameInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [chosenGoogleUsername, setChosenGoogleUsername] = useState('')
  const [totpCode, setTotpCode] = useState('')

  // State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isExchangingCode, setIsExchangingCode] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)

  // Username prompt state for Google logins
  const [googleChallengeToken, setGoogleChallengeToken] = useState<string | null>(null)

  // Mandatory 2FA Challenge & Setup State
  const [mfaState, setMfaState] = useState<{
    challengeToken: string
    isSetup: boolean
    qrCodeUrl?: string
    secret?: string
    email?: string
    username?: string
  } | null>(null)

  const [resetUsername, setResetUsername] = useState('')
  const [resetChallengeToken, setResetChallengeToken] = useState<string | null>(null)
  const [resetTotpCode, setResetTotpCode] = useState('')
  const [resetNewPassword, setResetNewPassword] = useState('')
  const [resetConfirmPassword, setResetConfirmPassword] = useState('')

  const oauthCode = searchParams.get('code')

  useEffect(() => {
    if (oauthCode && !isSignedIn && !mfaState && !googleChallengeToken) {
      setIsExchangingCode(true)
      setErrorMessage(null)
      handleOAuthCallback(oauthCode)
        .then((res) => {
          if (res.needsUsername && res.challengeToken) {
            setGoogleChallengeToken(res.challengeToken)
            setMode('choose_username')
            setIsExchangingCode(false)
          } else if (res.mfaRequired && res.challengeToken) {
            setMfaState({
              challengeToken: res.challengeToken,
              isSetup: !!res.mfaSetupRequired,
              qrCodeUrl: res.qrCodeUrl,
              secret: res.secret,
              email: res.email,
              username: res.username,
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
  }, [oauthCode, isSignedIn, mfaState, googleChallengeToken, handleOAuthCallback, navigate])

  if (!isLoaded) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>
          Loading authentication...
        </div>
      </div>
    )
  }

  if (isSignedIn && !isExchangingCode && !mfaState && !googleChallengeToken) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!usernameInput || !passwordInput) {
      setErrorMessage('Please enter your username and password.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await signIn(usernameInput, passwordInput)
      if (res.needsUsername && res.challengeToken) {
        setGoogleChallengeToken(res.challengeToken)
        setMode('choose_username')
      } else if (res.mfaRequired && res.challengeToken) {
        setMfaState({
          challengeToken: res.challengeToken,
          isSetup: !!res.mfaSetupRequired,
          qrCodeUrl: res.qrCodeUrl,
          secret: res.secret,
          email: res.email,
          username: res.username,
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

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameInput || !usernameInput || !emailInput || !passwordInput) {
      setErrorMessage('All fields are required.')
      return
    }

    if (usernameInput.length < 3) {
      setErrorMessage('Username must be at least 3 characters long.')
      return
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(usernameInput)) {
      setErrorMessage('Username can only contain letters, numbers, underscores, and hyphens.')
      return
    }

    if (passwordInput.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await signUp(nameInput, usernameInput, emailInput, passwordInput)
      if (res.mfaRequired && res.challengeToken) {
        setMfaState({
          challengeToken: res.challengeToken,
          isSetup: !!res.mfaSetupRequired,
          qrCodeUrl: res.qrCodeUrl,
          secret: res.secret,
          email: res.email,
          username: res.username,
        })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSetUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!googleChallengeToken || !chosenGoogleUsername) {
      setErrorMessage('Please enter a username.')
      return
    }

    if (chosenGoogleUsername.length < 3) {
      setErrorMessage('Username must be at least 3 characters long.')
      return
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(chosenGoogleUsername)) {
      setErrorMessage('Username can only contain letters, numbers, underscores, and hyphens.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await setUsername(googleChallengeToken, chosenGoogleUsername)
      setGoogleChallengeToken(null)
      if (res.mfaRequired && res.challengeToken) {
        setMfaState({
          challengeToken: res.challengeToken,
          isSetup: !!res.mfaSetupRequired,
          qrCodeUrl: res.qrCodeUrl,
          secret: res.secret,
          email: res.email,
          username: res.username,
        })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to set username'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mfaState || !totpCode) {
      setErrorMessage('Please enter the 6-digit verification code.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      if (mfaState.isSetup) {
        await confirm2FASetupWithChallenge(mfaState.challengeToken, totpCode)
      } else {
        await verify2FALogin(mfaState.challengeToken, totpCode)
      }
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Verification failed'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetUsername) {
      setErrorMessage('Please enter your username.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await requestPasswordReset(resetUsername)
      setResetChallengeToken(res.challengeToken)
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to locate account'
      setErrorMessage(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetChallengeToken || !resetTotpCode || !resetNewPassword || !resetConfirmPassword) {
      setErrorMessage('Please complete all required fields.')
      return
    }

    if (resetTotpCode.length !== 6) {
      setErrorMessage('Please enter a valid 6-digit authenticator code.')
      return
    }

    if (resetNewPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.')
      return
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await completePasswordReset(resetChallengeToken, resetTotpCode, resetNewPassword)
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to reset password'
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

  const handleCopySecret = () => {
    if (mfaState?.secret) {
      navigator.clipboard.writeText(mfaState.secret)
      setCopiedSecret(true)
      setTimeout(() => setCopiedSecret(false), 2000)
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
            {mfaState?.isSetup
              ? 'Set Up Two-Factor Authentication'
              : mfaState
              ? 'Two-Factor Verification'
              : mode === 'choose_username'
              ? 'Choose a Username'
              : mode === 'signup'
              ? 'Create your account'
              : mode === 'forgot'
              ? (resetChallengeToken ? 'Confirm New Password' : 'Reset your password')
              : isExchangingCode
              ? 'Signing you in...'
              : 'Sign in to SQL Compass'}
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-muted)' }}>
            {mfaState?.isSetup
              ? 'Two-factor authentication is required for all accounts.'
              : mfaState
              ? 'Enter the 6-digit code from your authenticator app.'
              : mode === 'choose_username'
              ? 'Pick a unique username to complete your Google account setup.'
              : mode === 'signup'
              ? 'Choose a unique username and enter your details.'
              : mode === 'forgot'
              ? (resetChallengeToken
                  ? 'Enter the 6-digit code from your authenticator app and choose a new password.'
                  : 'Enter your username to begin password recovery with your authenticator app.')
              : 'Welcome back. Enter your username and password to continue.'}
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
                Authenticating with Google...
              </div>
            </div>
          ) : mode === 'choose_username' ? (
            /* Choose Username Screen (Google Login Redirect) */
            <form onSubmit={handleSetUsernameSubmit}>
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

              <div style={{ marginBottom: 20 }}>
                <label
                  htmlFor="google-username"
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: 6,
                  }}
                >
                  Username (Unique to you)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="google-username"
                    type="text"
                    value={chosenGoogleUsername}
                    onChange={(e) => setChosenGoogleUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    placeholder="your_unique_username"
                    required
                    minLength={3}
                    maxLength={30}
                    autoFocus
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
                  <span
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      color: 'var(--text-muted)',
                    }}
                  >
                    @
                  </span>
                </div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                  Letters, numbers, underscores, and hyphens only (min 3 characters).
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || chosenGoogleUsername.length < 3}
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
                  cursor: isSubmitting || chosenGoogleUsername.length < 3 ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting || chosenGoogleUsername.length < 3 ? 0.6 : 1,
                }}
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <span>Set Username & Continue</span>}
              </button>
            </form>
          ) : mfaState ? (
            /* Mandatory 2FA Flow (Setup or Verification) */
            <form onSubmit={handle2FASubmit}>
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

              {mfaState.isSetup ? (
                /* Mandatory Initial 2FA Setup Screen */
                <div>
                  <div
                    style={{
                      background: 'var(--bg-subtle)',
                      borderRadius: 8,
                      border: '1px solid var(--border-default)',
                      padding: 16,
                      textAlign: 'center',
                      marginBottom: 20,
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>
                      Scan with Google Authenticator, Authy, or 1Password:
                    </div>
                    {mfaState.qrCodeUrl && (
                      <div
                        style={{
                          background: '#ffffff',
                          padding: 10,
                          borderRadius: 8,
                          display: 'inline-block',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          marginBottom: 12,
                        }}
                      >
                        <img src={mfaState.qrCodeUrl} alt="2FA QR Code" style={{ width: 140, height: 140, display: 'block' }} />
                      </div>
                    )}
                    {mfaState.secret && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        <code
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 11,
                            padding: '4px 8px',
                            borderRadius: 4,
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-default)',
                            color: 'var(--brand-primary)',
                          }}
                        >
                          {mfaState.secret}
                        </code>
                        <button
                          type="button"
                          onClick={handleCopySecret}
                          style={{
                            padding: '4px 8px',
                            borderRadius: 4,
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-default)',
                            color: 'var(--text-secondary)',
                            fontFamily: 'var(--font-sans)',
                            fontSize: 11,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          {copiedSecret ? <Check size={12} color="var(--status-online)" /> : <Copy size={12} />}
                          <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label
                      htmlFor="totp-setup-code"
                      style={{
                        display: 'block',
                        fontFamily: 'var(--font-sans)',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        marginBottom: 6,
                      }}
                    >
                      Enter 6-digit verification code from app
                    </label>
                    <input
                      id="totp-setup-code"
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
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <span>Activate 2FA & Complete Sign In</span>}
                  </button>
                </div>
              ) : (
                /* Regular 2FA Verification Screen */
                <div>
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
                      Signing in as <strong>{mfaState.username || mfaState.email}</strong>
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label
                      htmlFor="totp-verify-code"
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
                      id="totp-verify-code"
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
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setMfaState(null)
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
                <span>Back to sign in</span>
              </button>
            </form>
          ) : mode === 'forgot' ? (
            !resetChallengeToken ? (
              <form onSubmit={handleForgotUsernameSubmit}>
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

                <div style={{ marginBottom: 20 }}>
                  <label
                    htmlFor="reset-username"
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      marginBottom: 6,
                    }}
                  >
                    Account Username
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="reset-username"
                      type="text"
                      value={resetUsername}
                      onChange={(e) => setResetUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      placeholder="your_username"
                      required
                      autoFocus
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
                    <span
                      style={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 13,
                        color: 'var(--text-muted)',
                      }}
                    >
                      @
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !resetUsername}
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
                    cursor: isSubmitting || !resetUsername ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting || !resetUsername ? 0.7 : 1,
                    marginBottom: 12,
                  }}
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <span>Continue to Authenticator Verification</span>}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('signin')
                    setErrorMessage(null)
                    setResetChallengeToken(null)
                    setResetTotpCode('')
                    setResetNewPassword('')
                    setResetConfirmPassword('')
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
                  <span>Back to sign in</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit}>
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

                <div
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    background: 'var(--brand-muted)',
                    border: '1px solid var(--brand-border)',
                    marginBottom: 18,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <KeyRound size={18} color="var(--brand-primary)" style={{ flexShrink: 0 }} />
                  <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-primary)' }}>
                    Resetting password for <strong>@{resetUsername}</strong>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label
                    htmlFor="reset-totp-code"
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
                    id="reset-totp-code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={resetTotpCode}
                    onChange={(e) => setResetTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    autoFocus
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid var(--border-default)',
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 18,
                      letterSpacing: '0.25em',
                      textAlign: 'center',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label
                    htmlFor="reset-new-password"
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
                      id="reset-new-password"
                      type="password"
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      minLength={8}
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

                <div style={{ marginBottom: 20 }}>
                  <label
                    htmlFor="reset-confirm-password"
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
                      id="reset-confirm-password"
                      type="password"
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                      minLength={8}
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
                  disabled={isSubmitting || resetTotpCode.length !== 6 || resetNewPassword.length < 8}
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
                    cursor:
                      isSubmitting || resetTotpCode.length !== 6 || resetNewPassword.length < 8
                        ? 'not-allowed'
                        : 'pointer',
                    opacity:
                      isSubmitting || resetTotpCode.length !== 6 || resetNewPassword.length < 8 ? 0.7 : 1,
                    marginBottom: 12,
                  }}
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <span>Update Password & Sign In</span>}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setResetChallengeToken(null)
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
                  <span>Back to username step</span>
                </button>
              </form>
            )
          ) : mode === 'signup' ? (
            /* Sign Up Form */
            <form onSubmit={handleSignUpSubmit}>
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

              <div style={{ marginBottom: 14 }}>
                <label
                  htmlFor="signup-name"
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: 6,
                  }}
                >
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="signup-name"
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Ada Lovelace"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 36px',
                      borderRadius: 8,
                      border: '1px solid var(--border-default)',
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 13,
                      outline: 'none',
                    }}
                  />
                  <UserIcon
                    size={15}
                    color="var(--text-muted)"
                    style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label
                  htmlFor="signup-username"
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: 6,
                  }}
                >
                  Username (Unique to you)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="signup-username"
                    type="text"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    placeholder="ada_lovelace"
                    required
                    minLength={3}
                    maxLength={30}
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
                  <span
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 13,
                      color: 'var(--text-muted)',
                    }}
                  >
                    @
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label
                  htmlFor="signup-email"
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
                    id="signup-email"
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name@example.com"
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

              <div style={{ marginBottom: 20 }}>
                <label
                  htmlFor="signup-password"
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: 6,
                  }}
                >
                  Password (min. 8 characters)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="signup-password"
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Create a secure password"
                    required
                    minLength={8}
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
                  opacity: isSubmitting ? 0.7 : 1,
                  marginBottom: 16,
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

              <div style={{ textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin')
                    setErrorMessage(null)
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'var(--brand-primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Sign in
                </button>
              </div>
            </form>
          ) : (
            /* Unified Sign In Form - Username Only */
            <div>
              {/* Continue with Google */}
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '11px 18px',
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
                  marginBottom: 20,
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
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  or
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--border-default)' }} />
              </div>

              {/* Error Banner */}
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

              {/* Credentials Form - Username & Password */}
              <form onSubmit={handleSignInSubmit}>
                <div style={{ marginBottom: 14 }}>
                  <label
                    htmlFor="signin-username"
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      marginBottom: 6,
                    }}
                  >
                    Username
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="signin-username"
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value.toLowerCase().trim())}
                      placeholder="Enter username"
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
                    <UserIcon
                      size={15}
                      color="var(--text-muted)"
                      style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label
                      htmlFor="signin-password"
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
                        setMode('forgot')
                        setErrorMessage(null)
                        setResetUsername('')
                        setResetChallengeToken(null)
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
                      id="signin-password"
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
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
                    marginBottom: 16,
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

                <div style={{ textAlign: 'center', fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-muted)' }}>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup')
                      setErrorMessage(null)
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: 'var(--brand-primary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Sign up
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer links */}
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