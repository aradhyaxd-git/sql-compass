import jwt from 'jsonwebtoken'
import '../env.js'

const JWT_SECRET = process.env.JWT_SECRET || 'sql-compass-secure-jwt-default-secret-change-in-production'
const JWT_EXPIRES_IN = '7d'
const CHALLENGE_EXPIRES_IN = '10m'

export interface UserSessionPayload {
  sub: string
  email: string
  username: string
  name: string
  picture?: string
  role: 'user' | 'admin'
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
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifySessionToken(token: string): UserSessionPayload {
  return jwt.verify(token, JWT_SECRET) as UserSessionPayload
}

export function generate2FAChallengeToken(userId: string): string {
  return jwt.sign({ sub: userId, type: '2fa_challenge' }, JWT_SECRET, { expiresIn: CHALLENGE_EXPIRES_IN })
}

export function verify2FAChallengeToken(token: string): { sub: string } {
  const payload = jwt.verify(token, JWT_SECRET) as { sub: string; type?: string }
  if (payload.type !== '2fa_challenge') {
    throw new Error('Invalid challenge token')
  }
  return { sub: payload.sub }
}

export function generateResetChallengeToken(userId: string, username: string): string {
  return jwt.sign({ sub: userId, username, type: 'pwd_reset_challenge' }, JWT_SECRET, {
    expiresIn: CHALLENGE_EXPIRES_IN,
  })
}

export function verifyResetChallengeToken(token: string): { sub: string; username: string } {
  const payload = jwt.verify(token, JWT_SECRET) as { sub: string; username: string; type?: string }
  if (payload.type !== 'pwd_reset_challenge') {
    throw new Error('Invalid password reset challenge token')
  }
  return { sub: payload.sub, username: payload.username }
}

