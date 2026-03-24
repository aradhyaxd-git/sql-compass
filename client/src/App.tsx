import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from '@clerk/react'
import { useEffect } from 'react'
import { setAuthToken, setGetTokenFn } from '@/services/api'

import Landing from '@/pages/LandingPage'
import Auth from '@/pages/Auth'
import Dashboard from '@/pages/Dashboard'
import Attempt from '@/pages/Attempt'
import Profile from '@/pages/Profile'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) return null
  if (!isSignedIn) return <Navigate to="/auth" replace />
  return <>{children}</>
}

export default function App() {
  const { getToken, isLoaded, isSignedIn } = useAuth()

  // Set up token provider so axios can fetch fresh tokens
  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setGetTokenFn(null)
      setAuthToken(null)
      return
    }

    // Provide the getToken function to axios interceptor
    setGetTokenFn(async () => {
      try {
        const token = await getToken()
        return token
      } catch (err) {
        return null
      }
    })

    // Also set initial token
    getToken()
      .then(token => {
        if (token) setAuthToken(token)
      })
      .catch(() => {})
  }, [isLoaded, isSignedIn])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>

          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />

          {/* Protected */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />
          <Route
            path="/attempt/:id"
            element={<ProtectedRoute><Attempt /></ProtectedRoute>}
          />
          <Route
            path="/profile"
            element={<ProtectedRoute><Profile /></ProtectedRoute>}
          />

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}