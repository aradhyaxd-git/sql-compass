import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '@/services/api'

export interface UserProfile {
  id: string
  email: string
  fullName: string
  firstName: string
  imageUrl?: string
  role: 'user' | 'admin'
  twoFactorEnabled: boolean
  primaryEmailAddress?: {
    emailAddress: string
  }
}

interface RawUserPayload {
  id: string
  email: string
  name: string
  picture?: string
  role?: 'user' | 'admin'
  twoFactorEnabled?: boolean
}

export interface AuthLoginResponse {
  mfaRequired: boolean
  challengeToken?: string
  email?: string
}

interface AuthContextType {
  token: string | null
  user: UserProfile | null
  isLoaded: boolean
  isSignedIn: boolean
  signInWithGoogle: () => Promise<void>
  signInWithPassword: (email: string, password: string) => Promise<AuthLoginResponse>
  handleOAuthCallback: (code: string) => Promise<AuthLoginResponse>
  verify2FALogin: (challengeToken: string, code: string) => Promise<void>
  setup2FA: () => Promise<{ secret: string; qrCodeUrl: string }>
  confirm2FA: (code: string) => Promise<void>
  disable2FA: (code: string) => Promise<void>
  requestPasswordReset: (email: string) => Promise<{ message: string; resetToken?: string; expiresInMinutes: number }>
  verifyResetToken: (token: string) => Promise<{ valid: boolean; email?: string; remainingSeconds?: number }>
  completePasswordReset: (token: string, newPassword: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  getToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function formatUserProfile(raw: RawUserPayload): UserProfile {
  const nameParts = (raw.name || '').trim().split(' ')
  const firstName = nameParts[0] || raw.email.split('@')[0] || 'User'

  return {
    id: raw.id,
    email: raw.email,
    fullName: raw.name || raw.email.split('@')[0] || 'User',
    firstName,
    imageUrl: raw.picture || '',
    role: raw.role || 'user',
    twoFactorEnabled: !!raw.twoFactorEnabled,
    primaryEmailAddress: {
      emailAddress: raw.email,
    },
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  // Clear any legacy localStorage token to ensure 100% cookie isolation
  useEffect(() => {
    try {
      localStorage.removeItem('sqlcompass_token')
      localStorage.removeItem('token')
    } catch {
      // Ignore storage restrictions
    }
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/api/auth/me')
      if (res.data?.success && res.data?.data?.user) {
        setUser(formatUserProfile(res.data.data.user))
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    refreshUser().finally(() => {
      setIsLoaded(true)
    })
  }, [refreshUser])

  const signInWithGoogle = async () => {
    const redirectUri = `${window.location.origin}/auth`
    const res = await api.get('/api/auth/google/url', { params: { redirectUri } })
    if (res.data?.success && res.data?.data?.url) {
      window.location.href = res.data.data.url
    } else {
      throw new Error(res.data?.message || 'Could not initiate Google login')
    }
  }

  const handleOAuthCallback = async (code: string): Promise<AuthLoginResponse> => {
    const redirectUri = `${window.location.origin}/auth`
    const res = await api.post('/api/auth/google/callback', { code, redirectUri })

    if (res.data?.mfaRequired) {
      return {
        mfaRequired: true,
        challengeToken: res.data.challengeToken,
        email: res.data.email,
      }
    }

    if (res.data?.success && res.data?.data?.user) {
      setUser(formatUserProfile(res.data.data.user))
      return { mfaRequired: false }
    }

    throw new Error(res.data?.message || 'OAuth token exchange failed')
  }

  const signInWithPassword = async (email: string, password: string): Promise<AuthLoginResponse> => {
    const res = await api.post('/api/auth/login', { email, password })

    if (res.data?.mfaRequired) {
      return {
        mfaRequired: true,
        challengeToken: res.data.challengeToken,
        email: res.data.email,
      }
    }

    if (res.data?.success && res.data?.data?.user) {
      setUser(formatUserProfile(res.data.data.user))
      return { mfaRequired: false }
    }

    throw new Error(res.data?.message || 'Invalid credentials')
  }

  const verify2FALogin = async (challengeToken: string, code: string): Promise<void> => {
    const res = await api.post('/api/auth/2fa/login', { challengeToken, code })
    if (res.data?.success && res.data?.data?.user) {
      setUser(formatUserProfile(res.data.data.user))
    } else {
      throw new Error(res.data?.message || 'Two-factor verification failed')
    }
  }

  const setup2FA = async (): Promise<{ secret: string; qrCodeUrl: string }> => {
    const res = await api.post('/api/auth/2fa/setup')
    if (res.data?.success && res.data?.data) {
      return res.data.data
    }
    throw new Error(res.data?.message || 'Failed to initialize 2FA setup')
  }

  const confirm2FA = async (code: string): Promise<void> => {
    const res = await api.post('/api/auth/2fa/confirm', { code })
    if (!res.data?.success) {
      throw new Error(res.data?.message || 'Failed to confirm 2FA code')
    }
    await refreshUser()
  }

  const disable2FA = async (code: string): Promise<void> => {
    const res = await api.post('/api/auth/2fa/disable', { code })
    if (!res.data?.success) {
      throw new Error(res.data?.message || 'Failed to disable 2FA')
    }
    await refreshUser()
  }

  const requestPasswordReset = async (email: string) => {
    const res = await api.post('/api/auth/forgot-password', { email })
    if (res.data?.success) {
      return res.data
    }
    throw new Error(res.data?.message || 'Failed to initiate password reset')
  }

  const verifyResetToken = async (token: string) => {
    const res = await api.get('/api/auth/verify-reset-token', { params: { token } })
    if (res.data?.success && res.data?.data) {
      return res.data.data
    }
    return { valid: false }
  }

  const completePasswordReset = async (token: string, newPassword: string): Promise<void> => {
    const res = await api.post('/api/auth/reset-password', { token, newPassword })
    if (res.data?.success && res.data?.data?.user) {
      setUser(formatUserProfile(res.data.data.user))
    } else {
      throw new Error(res.data?.message || 'Failed to complete password reset')
    }
  }

  const signOut = async () => {
    try {
      await api.post('/api/auth/logout')
    } finally {
      setUser(null)
    }
  }

  const getToken = async () => {
    return null
  }

  return (
    <AuthContext.Provider
      value={{
        token: null,
        user,
        isLoaded,
        isSignedIn: Boolean(user),
        signInWithGoogle,
        signInWithPassword,
        handleOAuthCallback,
        verify2FALogin,
        setup2FA,
        confirm2FA,
        disable2FA,
        requestPasswordReset,
        verifyResetToken,
        completePasswordReset,
        signOut,
        refreshUser,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useUser() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useUser must be used within an AuthProvider')
  }
  return {
    user: context.user,
    isLoaded: context.isLoaded,
    isSignedIn: context.isSignedIn,
  }
}
