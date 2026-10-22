import React, { useState } from 'react'
import { User, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth, AuthLoginResponse } from '@/context/AuthContext'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Alert from '@/components/ui/Alert'

interface ChooseUsernameModalProps {
  isOpen: boolean
  challengeToken: string
  onSuccess: (res: AuthLoginResponse) => void
  onCancel: () => void
}

export const ChooseUsernameModal: React.FC<ChooseUsernameModalProps> = ({
  isOpen,
  challengeToken,
  onSuccess,
  onCancel,
}) => {
  const { setUsername } = useAuth()
  const [username, setUsernameInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = username.trim()

    if (!trimmed) {
      setErrorMessage('Please enter a username.')
      return
    }

    if (trimmed.length < 3) {
      setErrorMessage('Username must be at least 3 characters long.')
      return
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setErrorMessage('Username can only contain letters, numbers, underscores, and hyphens.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const res = await setUsername(challengeToken, trimmed)
      toast.success('Username saved successfully')
      onSuccess(res)
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to set username'
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
      title="Choose Your Username"
      description="Pick a unique developer handle for your SQL-Compass profile and challenge leaderboard."
      maxWidth={400}
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {errorMessage && <Alert type="error" message={errorMessage} onClose={() => setErrorMessage(null)} />}

        <Input
          label="Username"
          type="text"
          autoFocus
          value={username}
          onChange={(e) => setUsernameInput(e.target.value)}
          placeholder="your_handle"
          leftIcon={<User size={16} />}
          helperText="3-20 characters: letters, numbers, underscores, and hyphens."
          disabled={isSubmitting}
        />

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <button
            type="submit"
            disabled={isSubmitting || !username.trim()}
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
              cursor: isSubmitting || !username.trim() ? 'not-allowed' : 'pointer',
              opacity: isSubmitting || !username.trim() ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <span>Set Username</span>}
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

export default ChooseUsernameModal
