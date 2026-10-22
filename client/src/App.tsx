import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { ThemeProvider, useTheme } from '@/context/ThemeContext'
import { PageLoadingSkeleton } from '@/components/ui/Skeleton'

const Landing = lazy(() => import('@/pages/LandingPage'))
const AuthLayout = lazy(() => import('@/components/auth/AuthLayout'))
const LoginForm = lazy(() => import('@/components/auth/LoginForm'))
const RegisterForm = lazy(() => import('@/components/auth/RegisterForm'))
const PasswordResetForm = lazy(() => import('@/components/auth/PasswordResetForm'))
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'))
const TermsOfService = lazy(() => import('@/pages/TermsOfService'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Attempt = lazy(() => import('@/pages/Attempt'))
const Profile = lazy(() => import('@/pages/Profile'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function ThemedToaster() {
  const { theme } = useTheme()
  return (
    <Toaster
      theme={theme}
      richColors
      closeButton
      position="top-right"
      toastOptions={{
        style: {
          fontFamily: 'var(--font-sans)',
          fontSize: 13,
          borderRadius: 10,
        },
      }}
    />
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return <PageLoadingSkeleton />
  }

  if (!isSignedIn) {
    return <Navigate to="/auth/login" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <ThemeProvider>
      <ThemedToaster />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense fallback={<PageLoadingSkeleton />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />

              {/* Nested Auth Routes */}
              <Route path="/auth" element={<AuthLayout />}>
                <Route index element={<LoginForm />} />
                <Route path="login" element={<LoginForm />} />
                <Route path="register" element={<RegisterForm />} />
                <Route path="reset-password" element={<PasswordResetForm />} />
              </Route>
              <Route path="/reset-password" element={<Navigate to="/auth/reset-password" replace />} />

              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />

              {/* Protected */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/attempt/:id"
                element={
                  <ProtectedRoute>
                    <Attempt />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  )
}