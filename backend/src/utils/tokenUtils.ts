import jwt from 'jsonwebtoken'
import '../env.js'

const isProduction = process.env.NODE_ENV === 'production'
const DEFAULT_DEV_SECRET = 'sql-compass-secure-jwt-default-secret-change-in-production'

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (isProduction) {
    if (!secret || secret.trim().length < 32 || secret.trim() === DEFAULT_DEV_SECRET) {
      throw new Error('[FATAL SECURITY ERROR] Insecure or missing JWT_SECRET in production. Halting process.')
    }
    return secret.trim()
  }
  return secret?.trim() || DEFAULT_DEV_SECRET
}

const JWT_EXPIRES_IN = '7d'
const CHALLENGE_EXPIRES_IN = '10m'

export interface UserSessionPayload {
  sub: string
  email: string
  username: string
  name: string
  picture?: string
  role: 'user' | 'admin'
  type: 'session'
}

export function generateSessionToken(payloadData: {
  id?: string
  _id?: any
  email: string
  username: string
  name: string
  picture?: string
  role: 'user' | 'admin'
}): string {
  const sub = String(payloadData.id || payloadData._id || '')
  const payload: UserSessionPayload = {
    sub,
    email: payloadData.email,
    username: payloadData.username || 'user',
    name: payloadData.name,
    picture: payloadData.picture,
    role: payloadData.role,
    type: 'session',
  }

  return jwt.sign(payload, getJwtSecret(), {
    algorithm: 'HS256',
    expiresIn: JWT_EXPIRES_IN,
  })
}

export function verifySessionToken(token: string): UserSessionPayload {
  const payload = jwt.verify(token, getJwtSecret(), {
    algorithms: ['HS256'],
  }) as UserSessionPayload

  if (payload.type !== 'session') {
    throw new Error('Invalid token type: session required')
  }

  return payload
}

export function generate2FAChallengeToken(userId: string): string {
  return jwt.sign({ sub: userId, type: '2fa_challenge' }, getJwtSecret(), {
    algorithm: 'HS256',
    expiresIn: CHALLENGE_EXPIRES_IN,
  })
}

export function verify2FAChallengeToken(token: string): { sub: string } {
  const payload = jwt.verify(token, getJwtSecret(), {
    algorithms: ['HS256'],
  }) as { sub: string; type?: string }

  if (payload.type !== '2fa_challenge') {
    throw new Error('Invalid challenge token: 2fa_challenge required')
  }

  return { sub: payload.sub }
}

export function generateResetChallengeToken(userId: string, username: string): string {
  return jwt.sign({ sub: userId, username, type: 'pwd_reset_challenge' }, getJwtSecret(), {
    algorithm: 'HS256',
    expiresIn: CHALLENGE_EXPIRES_IN,
  })
}

export function verifyResetChallengeToken(token: string): { sub: string; username: string } {
  const payload = jwt.verify(token, getJwtSecret(), {
    algorithms: ['HS256'],
  }) as { sub: string; username: string; type?: string }

  if (payload.type !== 'pwd_reset_challenge') {
    throw new Error('Invalid password reset challenge token: pwd_reset_challenge required')
  }

  return { sub: payload.sub, username: payload.username }
}
