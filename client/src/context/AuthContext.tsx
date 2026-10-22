import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api, { setAuthToken } from '@/services/api'

export interface UserProfile {
  id: string
  email: string
  fullName: string
  firstName: string
  imageUrl?: string
  role: 'user' | 'admin'
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
}

interface AuthContextType {
  token: string | null
  user: UserProfile | null
  isLoaded: boolean
  isSignedIn: boolean
  signInWithGoogle: () => Promise<void>
  signInWithPassword: (email: string, password: string) => Promise<void>
  handleOAuthCallback: (code: string) => Promise<void>
  signOut: () => Promise<void>
  getToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'sqlcompass_token'

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
    primaryEmailAddress: {
      emailAddress: raw.email,
    },
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoaded, setIsLoaded] = useState<boolean>(false)

  const applySession = useCallback((newToken: string | null, rawUser: RawUserPayload | null) => {
    if (newToken && rawUser) {
      localStorage.setItem(TOKEN_KEY, newToken)
      setAuthToken(newToken)
      setTokenState(newToken)
      setUser(formatUserProfile(rawUser))
    } else {
      localStorage.removeItem(TOKEN_KEY)
      setAuthToken(null)
      setTokenState(null)
      setUser(null)
    }
  }, [])

  useEffect(() => {
    const existingToken = localStorage.getItem(TOKEN_KEY)
    if (!existingToken) {
      setIsLoaded(true)
      return
    }

    setAuthToken(existingToken)
    api
      .get('/api/auth/me')
      .then((res) => {
        if (res.data?.success && res.data?.data?.user) {
          setUser(formatUserProfile(res.data.data.user))
        } else {
          applySession(null, null)
        }
      })
      .catch(() => {
        applySession(null, null)
      })
      .finally(() => {
        setIsLoaded(true)
      })
  }, [applySession])

  const signInWithGoogle = async () => {
    const redirectUri = `${window.location.origin}/auth`
    const res = await api.get('/api/auth/google/url', { params: { redirectUri } })
    if (res.data?.success && res.data?.data?.url) {
      window.location.href = res.data.data.url
    } else {
      throw new Error(res.data?.message || 'Could not initiate Google login')
    }
  }

  const handleOAuthCallback = async (code: string) => {
    const redirectUri = `${window.location.origin}/auth`
    const res = await api.post('/api/auth/google/callback', { code, redirectUri })
    if (res.data?.success && res.data?.data?.token) {
      applySession(res.data.data.token, res.data.data.user)
    } else {
      throw new Error(res.data?.message || 'OAuth token exchange failed')
    }
  }

  const signInWithPassword = async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password })
    if (res.data?.success && res.data?.data?.token) {
      applySession(res.data.data.token, res.data.data.user)
    } else {
      throw new Error(res.data?.message || 'Invalid credentials')
    }
  }

  const signOut = async () => {
    applySession(null, null)
  }

  const getToken = async () => {
    return token
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoaded,
        isSignedIn: Boolean(token && user),
        signInWithGoogle,
        signInWithPassword,
        handleOAuthCallback,
        signOut,
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
