import { SignIn } from '@clerk/react'

export default function Auth() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center">
      <SignIn
        forceRedirectUrl="/dashboard"
        appearance={{
            variables: {
            colorBackground: '#0d0d1a',
            colorText: '#f1f5f9',
            colorPrimary: '#7c6af7',
            colorInputBackground: '#12121f',
            }
        }}
    />
    </div>
  )
}
