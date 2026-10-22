import React, { useState } from 'react'
import { KeyRound, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'

interface TotpChallengeModalProps {
  isOpen: boolean
  challengeToken: string
  username?: string
  email?: string
  onSuccess: () => void
  onCancel: () => void
}

export const TotpChallengeModal: React.FC<TotpChallengeModalProps> = ({
  isOpen,
  challengeToken,
  username,
  email,
  onSuccess,
  onCancel,
}) => {
  const { verify2FALogin } = useAuth()
  const [code, setCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      setErrorMessage('Please enter a 6-digit code.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await verify2FALogin(challengeToken, code)
      toast.success('Signed in successfully')
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
      title="Two-Factor Authentication"
      description={`Enter the 6-digit verification code from your authenticator app for ${username || email || 'your account'}.`}
      maxWidth={400}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {errorMessage && <Alert type="error" message={errorMessage} onClose={() => setErrorMessage(null)} />}

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
            {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <span>Verify & Continue</span>}
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

export default TotpChallengeModal
