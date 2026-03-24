import { SignIn } from '@clerk/react'
import { useAuth } from '@clerk/react'
import { Navigate } from 'react-router-dom'

export default function Auth() {
  const { isLoaded, isSignedIn } = useAuth()
  if (!isLoaded) return null

  if (isSignedIn) return <Navigate to="/dashboard" replace />

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center">
      <SignIn fallbackRedirectUrl="/dashboard" />
    </div>
  )
}