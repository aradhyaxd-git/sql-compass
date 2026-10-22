import '../env.js'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import User, { type IUser } from '../models/User.js'
import { logger } from '../utils/logger.js'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''
const JWT_SECRET = process.env.JWT_SECRET || 'sql-compass-secure-jwt-default-secret-change-in-production'
const JWT_EXPIRES_IN = '7d'

const oauthClient = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)

export interface UserSessionPayload {
  sub: string
  email: string
  name: string
  picture?: string
  role: 'user' | 'admin'
}

export function generateSessionToken(user: IUser): string {
  const payload: UserSessionPayload = {
    sub: user._id.toString(),
    email: user.email,
    name: user.name,
    picture: user.picture,
    role: user.role,
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifySessionToken(token: string): UserSessionPayload {
  return jwt.verify(token, JWT_SECRET) as UserSessionPayload
}

export function getGoogleAuthorizationUrl(redirectUri: string): string {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID is not configured in environment variables')
  }

  return oauthClient.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    redirect_uri: redirectUri,
    prompt: 'select_account',
  })
}

export async function exchangeGoogleCode(
  code: string,
  redirectUri: string
): Promise<{ token: string; user: { id: string; email: string; name: string; picture?: string; role: string } }> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth is not configured on server (missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)')
  }

  const { tokens } = await oauthClient.getToken({
    code,
    redirect_uri: redirectUri,
  })

  if (!tokens.id_token) {
    throw new Error('No id_token received from Google')
  }

  const ticket = await oauthClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: GOOGLE_CLIENT_ID,
  })

  const payload = ticket.getPayload()
  if (!payload || !payload.email) {
    throw new Error('Unable to extract user information from Google id_token')
  }

  const email = payload.email.toLowerCase().trim()
  const name = payload.name || payload.email.split('@')[0]
  const picture = payload.picture || ''
  const googleId = payload.sub

  const adminIds = (process.env.ADMIN_USER_IDS || '').split(',').map((id) => id.trim()).filter(Boolean)
  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim()
  const isAdmin = (adminEmail && email === adminEmail) || (googleId && adminIds.includes(googleId))

  let user = await User.findOne({ $or: [{ googleId }, { email }] })

  if (!user) {
    user = await User.create({
      email,
      name,
      picture,
      googleId,
      role: isAdmin ? 'admin' : 'user',
    })
    logger.info('Created new user via Google OAuth', { event: 'user_created', userId: user._id.toString() })
  } else {
    user.name = name
    user.picture = picture
    if (!user.googleId) user.googleId = googleId
    if (isAdmin && user.role !== 'admin') {
      user.role = 'admin'
    }
    await user.save()
  }

  const token = generateSessionToken(user)
  return {
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: user.role,
    },
  }
}

export async function authenticateWithPassword(
  emailInput: string,
  passwordInput: string
): Promise<{ token: string; user: { id: string; email: string; name: string; picture?: string; role: string } }> {
  const email = (emailInput || '').toLowerCase().trim()
  const password = (passwordInput || '').trim()

  if (!email || !password) {
    throw new Error('Email and password are required')
  }

  const envAdminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim()
  const envAdminPassword = process.env.ADMIN_PASSWORD || ''

  if (envAdminEmail && envAdminPassword && email === envAdminEmail && password === envAdminPassword) {
    let adminUser = await User.findOne({ email })
    if (!adminUser) {
      adminUser = await User.create({
        email,
        name: 'Administrator',
        role: 'admin',
      })
    } else if (adminUser.role !== 'admin') {
      adminUser.role = 'admin'
      await adminUser.save()
    }

    const token = generateSessionToken(adminUser)
    return {
      token,
      user: {
        id: adminUser._id.toString(),
        email: adminUser.email,
        name: adminUser.name,
        picture: adminUser.picture,
        role: adminUser.role,
      },
    }
  }

  const existingUser = await User.findOne({ email }).select('+passwordHash')
  if (!existingUser || !existingUser.passwordHash) {
    throw new Error('Invalid email or password')
  }

  const isMatch = await bcrypt.compare(password, existingUser.passwordHash)
  if (!isMatch) {
    throw new Error('Invalid email or password')
  }

  const token = generateSessionToken(existingUser)
  return {
    token,
    user: {
      id: existingUser._id.toString(),
      email: existingUser.email,
      name: existingUser.name,
      picture: existingUser.picture,
      role: existingUser.role,
    },
  }
}
