import React, { useState, useEffect, useRef } from 'react'
import { Outlet, Navigate, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Compass, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth, AuthLoginResponse } from '@/context/AuthContext'
import Alert from '@/components/ui/Alert'
import ChooseUsernameModal from './ChooseUsernameModal'
import TotpChallengeModal from './TotpChallengeModal'
import TotpSetupModal from './TotpSetupModal'

export interface AuthContextOutletType {
  onRequireMfa: (res: AuthLoginResponse) => void
  onRequireUsername: (challengeToken: string) => void
}

export const AuthLayout: React.FC = () => {
  const { isLoaded, isSignedIn, handleOAuthCallback } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [isExchangingCode, setIsExchangingCode] = useState(false)
  const [oauthError, setOauthError] = useState<string | null>(null)
  const [googleChallengeToken, setGoogleChallengeToken] = useState<string | null>(null)
  const [mfaState, setMfaState] = useState<{
    challengeToken: string
    isSetup: boolean
    qrCodeUrl?: string
    secret?: string
    email?: string
    username?: string
  } | null>(null)

  const oauthCode = searchParams.get('code')
  const hasHandledOAuthRef = useRef(false)

  useEffect(() => {
    if (oauthCode && !isSignedIn && !mfaState && !googleChallengeToken && !hasHandledOAuthRef.current) {
      hasHandledOAuthRef.current = true
      setIsExchangingCode(true)
      setOauthError(null)

      handleOAuthCallback(oauthCode)
        .then((res) => {
          window.history.replaceState({}, '', window.location.pathname)
          if (res.needsUsername && res.challengeToken) {
            setGoogleChallengeToken(res.challengeToken)
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
            toast.success('Signed in with Google')
            navigate('/dashboard', { replace: true })
          }
        })
        .catch((err) => {
          hasHandledOAuthRef.current = false
          const msg = err instanceof Error ? err.message : String(err)
          setOauthError(`Google authentication failed: ${msg}`)
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

  const handleRequireMfa = (res: AuthLoginResponse) => {
    if (res.mfaRequired && res.challengeToken) {
      setMfaState({
        challengeToken: res.challengeToken,
        isSetup: !!res.mfaSetupRequired,
        qrCodeUrl: res.qrCodeUrl,
        secret: res.secret,
        email: res.email,
        username: res.username,
      })
    }
  }

  const handleRequireUsername = (challengeToken: string) => {
    setGoogleChallengeToken(challengeToken)
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
        padding: '32px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Ambience */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--brand-muted) 0%, transparent 70%)',
          pointerEvents: 'none',
          opacity: 0.6,
        }}
      />

      {/* Brand Header */}
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          textDecoration: 'none',
          marginBottom: 28,
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'var(--brand-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
          }}
        >
          <Compass size={22} />
        </div>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 20,
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
          }}
        >
          SQL-Compass
        </span>
      </Link>

      {/* Main Outlet Container */}
      <div style={{ width: '100%', maxWidth: 420, zIndex: 1 }}>
        {oauthError && (
          <div style={{ marginBottom: 16 }}>
            <Alert type="error" message={oauthError} onClose={() => setOauthError(null)} />
          </div>
        )}

        {isExchangingCode ? (
          <div
            style={{
              padding: 40,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 12,
              textAlign: 'center',
            }}
          >
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--brand-primary)', margin: '0 auto 16px' }} />
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
              Verifying Google account...
            </p>
          </div>
        ) : (
          <Outlet context={{ onRequireMfa: handleRequireMfa, onRequireUsername: handleRequireUsername }} />
        )}
      </div>

      {/* Footer Navigation Link */}
      <div style={{ marginTop: 24, textAlign: 'center', zIndex: 1 }}>
        <Link
          to="/"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 12,
            color: 'var(--text-muted)',
            textDecoration: 'none',
          }}
        >
          Back to SQL-Compass Home
        </Link>
      </div>

      {/* Choose Username Modal */}
      {googleChallengeToken && (
        <ChooseUsernameModal
          isOpen={!!googleChallengeToken}
          challengeToken={googleChallengeToken}
          onSuccess={(res) => {
            setGoogleChallengeToken(null)
            if (res.mfaRequired && res.challengeToken) {
              handleRequireMfa(res)
            } else {
              navigate('/dashboard', { replace: true })
            }
          }}
          onCancel={() => setGoogleChallengeToken(null)}
        />
      )}

      {/* TOTP Challenge Modal */}
      {mfaState && !mfaState.isSetup && (
        <TotpChallengeModal
          isOpen={!!mfaState}
          challengeToken={mfaState.challengeToken}
          username={mfaState.username}
          email={mfaState.email}
          onSuccess={() => {
            setMfaState(null)
            navigate('/dashboard', { replace: true })
          }}
          onCancel={() => setMfaState(null)}
        />
      )}

      {/* TOTP Setup Modal */}
      {mfaState && mfaState.isSetup && (
        <TotpSetupModal
          isOpen={!!mfaState}
          challengeToken={mfaState.challengeToken}
          qrCodeUrl={mfaState.qrCodeUrl}
          secret={mfaState.secret}
          username={mfaState.username}
          email={mfaState.email}
          onSuccess={() => {
            setMfaState(null)
            navigate('/dashboard', { replace: true })
          }}
          onCancel={() => setMfaState(null)}
        />
      )}
    </div>
  )
}

export default AuthLayout
