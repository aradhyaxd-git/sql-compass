import { SignIn } from '@clerk/react'
import { useAuth } from '@clerk/react'
import { Navigate } from 'react-router-dom'

export default function Auth() {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded) return null

  if (isSignedIn) return <Navigate to="/dashboard" replace />

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-canvas)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <SignIn fallbackRedirectUrl="/dashboard" />
    </div>
  )
}