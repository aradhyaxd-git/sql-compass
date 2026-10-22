import React, { useState } from 'react'
import { KeyRound, Loader2, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'

interface TotpSetupModalProps {
  isOpen: boolean
  challengeToken: string
  qrCodeUrl?: string
  secret?: string
  username?: string
  email?: string
  onSuccess: () => void
  onCancel: () => void
}

export const TotpSetupModal: React.FC<TotpSetupModalProps> = ({
  isOpen,
  challengeToken,
  qrCodeUrl,
  secret,
  username,
  email,
  onSuccess,
  onCancel,
}) => {
  const { confirm2FASetupWithChallenge } = useAuth()
  const [code, setCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [copiedSecret, setCopiedSecret] = useState(false)

  const handleCopySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret)
      setCopiedSecret(true)
      toast.success('Secret key copied to clipboard')
      setTimeout(() => setCopiedSecret(false), 2000)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      setErrorMessage('Please enter a 6-digit code.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await confirm2FASetupWithChallenge(challengeToken, code)
      toast.success('Two-factor authentication configured successfully')
      onSuccess()
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Invalid 2FA code'
      setErrorMessage(msg)
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title="Set Up Two-Factor Authentication"
      description={`2FA is required for all SQL-Compass accounts. Scan this QR code with Google Authenticator, Authy, or 1Password${username || email ? ` to protect ${username || email}` : ''}.`}
      maxWidth={440}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {errorMessage && <Alert type="error" message={errorMessage} onClose={() => setErrorMessage(null)} />}

        {/* QR Code Container */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              background: '#ffffff',
              padding: 12,
              borderRadius: 10,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              display: 'inline-block',
            }}
          >
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="2FA QR Code" style={{ width: 148, height: 148, display: 'block' }} />
            ) : (
              <div
                style={{
                  width: 148,
                  height: 148,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                  fontSize: 12,
                }}
              >
                <Loader2 size={24} className="animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Secret Key Display */}
        {secret && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <code
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-default)',
                padding: '6px 10px',
                borderRadius: 6,
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: 'var(--brand-primary)',
                letterSpacing: '0.05em',
              }}
            >
              {secret}
            </code>
            <button
              type="button"
              onClick={handleCopySecret}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 10px',
                borderRadius: 6,
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              {copiedSecret ? <Check size={12} color="var(--status-online)" /> : <Copy size={12} />}
              <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}

        <Input
          label="Verification Code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="000000"
          leftIcon={<KeyRound size={16} />}
          style={{
            letterSpacing: '0.25em',
            textAlign: 'center',
            fontSize: 18,
          }}
          disabled={isSubmitting}
        />

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button
            type="submit"
            disabled={isSubmitting || code.length !== 6}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 8,
              background: 'var(--brand-primary)',
              border: 'none',
              color: '#ffffff',
              fontFamily: 'var(--font-sans)',
              fontSize: 13,
              fontWeight: 600,
              cursor: isSubmitting || code.length !== 6 ? 'not-allowed' : 'pointer',
              opacity: isSubmitting || code.length !== 6 ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <span>Confirm & Activate</span>}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            style={{
              padding: '10px 16px',
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
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default TotpSetupModal
