import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Compass,
  Award,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Shield,
  ShieldCheck,
  KeyRound,
  Loader2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import UserAvatar from '@/components/ui/UserAvatar'
import { ProfileSkeleton } from '@/components/ui/Skeleton'
import Alert from '@/components/ui/Alert'
import Input from '@/components/ui/Input'
import { toast } from 'sonner'
import { useUserStats, useAttemptHistory } from '@/hooks/useProfile'

const RANKS = [
  { label: 'Explorer', xpMin: 0 },
  { label: 'Navigator', xpMin: 500 },
  { label: 'Query Architect', xpMin: 1500 },
  { label: 'Data Specialist', xpMin: 3000 },
  { label: 'SQL Grandmaster', xpMin: 6000 },
]

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div
      style={{
        padding: '18px 20px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 38,
          height: 38,
          borderRadius: 8,
          background: 'var(--brand-muted)',
          border: '1px solid var(--brand-border)',
          color: 'var(--brand-primary)',
        }}
      >
        <Icon size={18} />
      </div>
      <div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-muted)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: 2,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 22,
            color: 'var(--text-primary)',
          }}
        >
          {value}
        </div>
      </div>
    </div>
  )
}

export default function Profile() {
  const { user, isLoaded, signOut, setup2FA, confirm2FA } = useAuth()
  const navigate = useNavigate()
  const { data: stats, isLoading: statsLoading } = useUserStats()
  const { data: attempts } = useAttemptHistory()

  // 2FA state
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false)
  const [setupData, setSetupData] = useState<{ secret: string; qrCodeUrl: string } | null>(null)
  const [setupCode, setSetupCode] = useState('')
  const [is2FASubmitting, setIs2FASubmitting] = useState(false)
  const [twoFactorMessage, setTwoFactorMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [showSecuritySettings, setShowSecuritySettings] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out successfully')
    navigate('/')
  }

  const handleStartSetup2FA = async () => {
    setTwoFactorMessage(null)
    setIs2FASubmitting(true)
    try {
      const data = await setup2FA()
      setSetupData(data)
      setIsSettingUp2FA(true)
    } catch (err: any) {
      setTwoFactorMessage({ type: 'error', text: err.message || 'Failed to start 2FA setup' })
      toast.error(err.message || 'Failed to start 2FA setup')
    } finally {
      setIs2FASubmitting(false)
    }
  }

  const handleConfirm2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!setupCode) return
    setIs2FASubmitting(true)
    setTwoFactorMessage(null)
    try {
      await confirm2FA(setupCode)
      setTwoFactorMessage({ type: 'success', text: 'Two-factor authentication enabled successfully!' })
      toast.success('Two-factor authentication enabled successfully')
      setIsSettingUp2FA(false)
      setSetupData(null)
      setSetupCode('')
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Invalid 2FA code'
      setTwoFactorMessage({ type: 'error', text: msg })
      toast.error(msg)
    } finally {
      setIs2FASubmitting(false)
    }
  }

  const handleCopySecret = () => {
    if (setupData?.secret) {
      navigator.clipboard.writeText(setupData.secret)
      setCopiedSecret(true)
      toast.success('2FA secret copied to clipboard')
      setTimeout(() => setCopiedSecret(false), 2000)
    }
  }

  if (!isLoaded || statsLoading) {
    return (
      <>
        <Navbar />
        <ProfileSkeleton />
        <Footer />
      </>
    )
  }

  const currentRank = RANKS[stats?.rank?.index ?? 0] || RANKS[0]
  const xpProgress = stats ? Math.min((stats.totalXP / (stats.rank.nextXP ?? stats.totalXP + 500)) * 100, 100) : 0
  const xpCurrentLevel = stats?.totalXP ?? 0
  const xpNextLevel = stats?.rank.nextXP ?? xpCurrentLevel + 500

  return (
    <>
      <Navbar />
      <main
        style={{
          minHeight: '100vh',
          background: 'var(--bg-canvas)',
          paddingTop: 54,
          display: 'flex',
          flexDirection: 'column',
          transition: 'background-color 0.2s ease',
        }}
      >
        {/* Profile Header */}
        <div
          style={{
            borderBottom: '1px solid var(--border-default)',
            background: 'var(--bg-card)',
            padding: '36px 24px 28px',
          }}
        >
          <div
            style={{
              maxWidth: 960,
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <UserAvatar
                imageUrl={user?.imageUrl}
                name={user?.fullName || user?.firstName}
                size={56}
                shape="rounded"
              />

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                  <h1
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: 22,
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.02em',
                      margin: 0,
                    }}
                  >
                    {user?.fullName ?? user?.primaryEmailAddress?.emailAddress ?? 'Developer Profile'}
                  </h1>
                  {user?.username && (
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--brand-primary)',
                        background: 'var(--brand-muted)',
                        border: '1px solid var(--brand-border)',
                        padding: '2px 8px',
                        borderRadius: 6,
                        letterSpacing: '0.02em',
                      }}
                    >
                      @{user.username}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '3px 10px',
                      borderRadius: 6,
                      background: 'var(--brand-muted)',
                      border: '1px solid var(--brand-border)',
                    }}
                  >
                    <Compass size={13} color="var(--brand-primary)" />
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--brand-primary)',
                      }}
                    >
                      {currentRank.label}
                    </span>
                  </div>

                  {user?.role === 'admin' && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: 'rgba(234, 179, 8, 0.15)',
                        border: '1px solid rgba(234, 179, 8, 0.3)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        fontWeight: 700,
                        color: 'var(--brand-accent)',
                      }}
                    >
                      ADMIN
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 6,
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-default)',
                color: 'var(--status-danger)',
                fontSize: 13,
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--status-danger)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)'
              }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div style={{ maxWidth: 960, margin: '0 auto', width: '100%', padding: '32px 24px', flex: 1 }}>
          {/* Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
            <StatCard label="Challenges Solved" value={String(stats?.missionsCompleted ?? 0)} icon={CheckCircle2} />
            <StatCard label="Queries Executed" value={String(stats?.queriesExecuted ?? 0)} icon={Terminal} />
            <StatCard label="Total Experience" value={`${stats?.totalXP ?? 0} XP`} icon={Award} />
          </div>

          {/* XP Level Progress Bar */}
          <div
            style={{
              padding: 20,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 10,
              marginBottom: 28,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
                EXPERIENCE PROGRESS
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--brand-primary)' }}>
                {xpCurrentLevel} / {xpNextLevel} XP
              </span>
            </div>
            <div style={{ height: 6, background: 'var(--bg-subtle)', borderRadius: 999, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                style={{ height: '100%', background: 'var(--brand-primary)', borderRadius: 999 }}
              />
            </div>
          </div>

          {/* Security Settings Accordion */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 10,
              marginBottom: 28,
              overflow: 'hidden',
              transition: 'border-color 0.15s ease',
            }}
          >
            <button
              type="button"
              onClick={() => setShowSecuritySettings((prev) => !prev)}
              style={{
                width: '100%',
                padding: '14px 20px',
                background: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: user?.twoFactorEnabled ? 'rgba(34, 197, 94, 0.1)' : 'var(--brand-muted)',
                    border: `1px solid ${user?.twoFactorEnabled ? 'rgba(34, 197, 94, 0.3)' : 'var(--brand-border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: user?.twoFactorEnabled ? 'var(--status-success, #22c55e)' : 'var(--brand-primary)',
                  }}
                >
                  {user?.twoFactorEnabled ? <ShieldCheck size={16} /> : <Shield size={16} />}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                      Two-Factor Authentication
                    </span>
                    {user?.twoFactorEnabled ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: 'rgba(34, 197, 94, 0.1)',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          fontWeight: 600,
                          color: 'var(--status-success, #22c55e)',
                        }}
                      >
                        <CheckCircle2 size={11} />
                        Active
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: 'var(--bg-subtle)',
                          border: '1px solid var(--border-default)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10,
                          fontWeight: 500,
                          color: 'var(--text-muted)',
                        }}
                      >
                        Disabled
                      </span>
                    )}
                  </div>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--text-muted)', margin: 0, marginTop: 2 }}>
                    TOTP Authenticator (Google Authenticator, Authy, 1Password)
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-sans)' }}>
                <span>{showSecuritySettings ? 'Hide Settings' : 'Security Settings'}</span>
                {showSecuritySettings ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </div>
            </button>

            {showSecuritySettings && (
              <div
                style={{
                  padding: '18px 20px 22px',
                  borderTop: '1px solid var(--border-default)',
                  background: 'var(--bg-subtle)',
                }}
              >
                {twoFactorMessage && (
                  <div style={{ marginBottom: 16 }}>
                    <Alert
                      type={twoFactorMessage.type}
                      message={twoFactorMessage.text}
                      onClose={() => setTwoFactorMessage(null)}
                    />
                  </div>
                )}

                {isSettingUp2FA ? (
                  <form
                    onSubmit={handleConfirm2FA}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 8,
                      padding: 20,
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                      {setupData?.qrCodeUrl && (
                        <div
                          style={{
                            background: '#ffffff',
                            padding: 10,
                            borderRadius: 8,
                            display: 'inline-block',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          }}
                        >
                          <img src={setupData.qrCodeUrl} alt="2FA QR Code" style={{ width: 140, height: 140, display: 'block' }} />
                        </div>
                      )}
                      <div>
                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                          1. Scan QR code or copy key
                        </div>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                          Open your authenticator app (Google Authenticator, Authy, 1Password) and scan this QR code.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                          <code
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: 11,
                              padding: '6px 10px',
                              borderRadius: 6,
                              background: 'var(--bg-card)',
                              border: '1px solid var(--border-default)',
                              color: 'var(--brand-primary)',
                              letterSpacing: '0.05em',
                            }}
                          >
                            {setupData?.secret}
                          </code>
                          <button
                            type="button"
                            onClick={handleCopySecret}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 6,
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

                        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                          2. Enter 6-digit code
                        </div>
                        <div style={{ display: 'flex', gap: 8, maxWidth: 320 }}>
                          <Input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={setupCode}
                            onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="000000"
                            required
                            style={{
                              width: 140,
                              textAlign: 'center',
                              letterSpacing: '0.2em',
                              fontSize: 16,
                            }}
                          />
                          <button
                            type="submit"
                            disabled={is2FASubmitting || setupCode.length !== 6}
                            style={{
                              padding: '8px 16px',
                              borderRadius: 6,
                              background: 'var(--brand-primary)',
                              border: 'none',
                              color: '#ffffff',
                              fontFamily: 'var(--font-sans)',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: is2FASubmitting || setupCode.length !== 6 ? 'not-allowed' : 'pointer',
                              opacity: is2FASubmitting || setupCode.length !== 6 ? 0.6 : 1,
                            }}
                          >
                            {is2FASubmitting ? <Loader2 size={13} className="animate-spin" /> : <span>Confirm & Activate</span>}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsSettingUp2FA(false)
                              setSetupData(null)
                              setSetupCode('')
                            }}
                            style={{
                              padding: '8px 12px',
                              borderRadius: 6,
                              background: 'transparent',
                              border: '1px solid var(--border-default)',
                              color: 'var(--text-muted)',
                              fontFamily: 'var(--font-sans)',
                              fontSize: 12,
                              cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                      {user?.twoFactorEnabled
                        ? 'Switching devices? Re-enroll your authenticator app by scanning a new QR code.'
                        : 'Protect your account by enrolling an authenticator app.'}
                    </p>

                    <button
                      type="button"
                      onClick={handleStartSetup2FA}
                      disabled={is2FASubmitting}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 6,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: is2FASubmitting ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      {is2FASubmitting ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <KeyRound size={13} />
                      )}
                      <span>{user?.twoFactorEnabled ? 'Re-enroll Authenticator App (New Device)' : 'Enable Two-Factor Authentication'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Attempt Activity History */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14,
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}
              >
                Execution History
              </h2>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                {attempts?.length ?? 0} total attempts
              </span>
            </div>

            {attempts && attempts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {attempts.map((attempt) => {
                  const isSuccess = attempt.status === 'success'
                  return (
                    <motion.div
                      key={attempt._id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: '12px 16px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        {isSuccess ? (
                          <CheckCircle2 size={16} color="var(--status-online)" style={{ flexShrink: 0 }} />
                        ) : (
                          <AlertCircle size={16} color="var(--status-danger)" style={{ flexShrink: 0 }} />
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontFamily: 'var(--font-sans)',
                              fontSize: 13,
                              fontWeight: 600,
                              color: 'var(--text-primary)',
                              marginBottom: 2,
                            }}
                          >
                            {attempt.assignmentTitle}
                          </div>
                          <div
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: 11,
                              color: 'var(--text-muted)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {attempt.query}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 11,
                            fontWeight: 600,
                            color: isSuccess ? 'var(--status-online)' : 'var(--status-danger)',
                          }}
                        >
                          {isSuccess ? 'PASS' : 'FAIL'}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
                          {new Date(attempt.executedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div
                style={{
                  padding: '36px 20px',
                  textAlign: 'center',
                  borderRadius: 8,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                  fontFamily: 'var(--font-sans)',
                }}
              >
                No query attempts logged yet. Solve your first challenge in the workspace!
              </div>
            )}
          </div>
        </div>

        <Footer />
      </main>
    </>
  )
}