import '../env.js'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { generateSecret, generateURI, verifySync } from 'otplib'
import QRCode from 'qrcode'
import User, { type IUser } from '../models/User.js'
import { logger } from '../utils/logger.js'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''
const JWT_SECRET = process.env.JWT_SECRET || 'sql-compass-secure-jwt-default-secret-change-in-production'
const JWT_EXPIRES_IN = '7d'
const CHALLENGE_EXPIRES_IN = '10m'
const RESET_TOKEN_EXPIRES_MS = 15 * 60 * 1000

const oauthClient = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)

export interface UserSessionPayload {
  sub: string
  email: string
  username: string
  name: string
  picture?: string
  role: 'user' | 'admin'
}

export interface UserResponse {
  id: string
  email: string
  username: string
  name: string
  picture?: string
  role: string
  twoFactorEnabled: boolean
}

export type AuthResult =
  | {
      mfaRequired: true
      mfaSetupRequired: false
      challengeToken: string
      email: string
      username: string
    }
  | {
      mfaRequired: true
      mfaSetupRequired: true
      challengeToken: string
      qrCodeUrl: string
      secret: string
      email: string
      username: string
    }

export function getAuthCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production'
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  }
}

export function generateSessionToken(user: IUser): string {
  const payload: UserSessionPayload = {
    sub: user._id.toString(),
    email: user.email,
    username: user.username || user.email.split('@')[0],
    name: user.name,
    picture: user.picture,
    role: user.role,
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

export async function generateUniqueUsername(preferredBase: string, email: string): Promise<string> {
  let base = (preferredBase || email.split('@')[0] || 'user')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 20)

  if (base.length < 3) {
    base = 'user_' + base
  }

  let candidate = base
  let counter = 1

  while (await User.exists({ username: candidate })) {
    candidate = `${base}${counter}`
    counter++
  }

  return candidate
}

async function prepareMandatory2FAResult(user: IUser): Promise<AuthResult> {
  const challengeToken = generate2FAChallengeToken(user._id.toString())

  if (user.twoFactorEnabled) {
    return {
      mfaRequired: true,
      mfaSetupRequired: false,
      challengeToken,
      email: user.email,
      username: user.username,
    }
  }

  const secret = generateSecret()
  const otpauthUri = generateURI({
    issuer: 'SQL Compass',
    label: `${user.username} (${user.email})`,
    secret,
  })
  const qrCodeUrl = await QRCode.toDataURL(otpauthUri)

  user.twoFactorTempSecret = secret
  await user.save()

  return {
    mfaRequired: true,
    mfaSetupRequired: true,
    challengeToken,
    qrCodeUrl,
    secret,
    email: user.email,
    username: user.username,
  }
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
): Promise<AuthResult> {
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
    const uniqueUsername = await generateUniqueUsername(name, email)
    user = await User.create({
      email,
      username: uniqueUsername,
      name,
      picture,
      googleId,
      role: isAdmin ? 'admin' : 'user',
      twoFactorEnabled: false,
    })
    logger.info('Created new user via Google OAuth', { event: 'user_created', userId: user._id.toString() })
  } else {
    user.name = name
    user.picture = picture
    if (!user.googleId) user.googleId = googleId
    if (!user.username) {
      user.username = await generateUniqueUsername(user.name, user.email)
    }
    if (isAdmin && user.role !== 'admin') {
      user.role = 'admin'
    }
    await user.save()
  }

  return prepareMandatory2FAResult(user)
}

export async function registerWithPassword(
  nameInput: string,
  usernameInput: string,
  emailInput: string,
  passwordInput: string
): Promise<AuthResult> {
  const name = (nameInput || '').trim()
  const rawUsername = (usernameInput || '').toLowerCase().trim()
  const email = (emailInput || '').toLowerCase().trim()
  const password = (passwordInput || '').trim()

  if (!name || !rawUsername || !email || !password) {
    throw new Error('Name, username, email, and password are required')
  }

  if (rawUsername.length < 3 || rawUsername.length > 30) {
    throw new Error('Username must be between 3 and 30 characters long')
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(rawUsername)) {
    throw new Error('Username can only contain alphanumeric characters, underscores, and hyphens')
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long')
  }

  const existingUsername = await User.findOne({ username: rawUsername })
  if (existingUsername) {
    throw new Error('Username is already taken. Please choose another username.')
  }

  const existingEmail = await User.findOne({ email })
  if (existingEmail) {
    throw new Error('An account with this email address already exists. Please sign in.')
  }

  const salt = await bcrypt.genSalt(12)
  const passwordHash = await bcrypt.hash(password, salt)

  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim()
  const isAdmin = adminEmail && email === adminEmail

  const user = await User.create({
    name,
    username: rawUsername,
    email,
    passwordHash,
    role: isAdmin ? 'admin' : 'user',
    twoFactorEnabled: false,
  })

  logger.info('New user registered with credentials', { userId: user._id.toString(), username: user.username })
  return prepareMandatory2FAResult(user)
}

export async function authenticateWithPassword(
  identifierInput: string,
  passwordInput: string
): Promise<AuthResult> {
  const identifier = (identifierInput || '').toLowerCase().trim()
  const password = (passwordInput || '').trim()

  if (!identifier || !password) {
    throw new Error('Username or email, and password are required')
  }

  const envAdminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim()
  const envAdminPassword = process.env.ADMIN_PASSWORD || ''

  if (
    envAdminEmail &&
    envAdminPassword &&
    (identifier === envAdminEmail || identifier === 'admin') &&
    password === envAdminPassword
  ) {
    let adminUser = await User.findOne({ email: envAdminEmail })
    if (!adminUser) {
      adminUser = await User.create({
        email: envAdminEmail,
        username: 'admin',
        name: 'Administrator',
        role: 'admin',
        twoFactorEnabled: false,
      })
    } else {
      if (!adminUser.username) adminUser.username = 'admin'
      if (adminUser.role !== 'admin') adminUser.role = 'admin'
      await adminUser.save()
    }

    return prepareMandatory2FAResult(adminUser)
  }

  const existingUser = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  }).select('+passwordHash')

  if (!existingUser || !existingUser.passwordHash) {
    throw new Error('Invalid username/email or password')
  }

  const isMatch = await bcrypt.compare(password, existingUser.passwordHash)
  if (!isMatch) {
    throw new Error('Invalid username/email or password')
  }

  if (!existingUser.username) {
    existingUser.username = await generateUniqueUsername(existingUser.name, existingUser.email)
    await existingUser.save()
  }

  return prepareMandatory2FAResult(existingUser)
}

export async function verify2FALogin(
  challengeToken: string,
  code: string
): Promise<{ token: string; user: UserResponse }> {
  const { sub: userId } = verify2FAChallengeToken(challengeToken)
  const normalizedCode = (code || '').trim()

  if (!/^\d{6}$/.test(normalizedCode)) {
    throw new Error('Authentication code must be a 6-digit number')
  }

  const user = await User.findById(userId).select('+twoFactorSecret +lastTotpUsed')
  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    throw new Error('Two-factor authentication is not active on this account. Please complete setup.')
  }

  if (user.lastTotpUsed === normalizedCode) {
    throw new Error('This authenticator code was already used. Please wait for the next code.')
  }

  const result = verifySync({
    token: normalizedCode,
    secret: user.twoFactorSecret,
  })

  if (!result.valid) {
    throw new Error('Invalid authentication code. Please check your authenticator app.')
  }

  user.lastTotpUsed = normalizedCode
  await user.save()

  const token = generateSessionToken(user)
  return {
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      name: user.name,
      picture: user.picture,
      role: user.role,
      twoFactorEnabled: user.twoFactorEnabled,
    },
  }
}

export async function confirm2FASetupWithChallenge(
  challengeToken: string,
  code: string
): Promise<{ token: string; user: UserResponse }> {
  const { sub: userId } = verify2FAChallengeToken(challengeToken)
  const normalizedCode = (code || '').trim()

  if (!/^\d{6}$/.test(normalizedCode)) {
    throw new Error('Authentication code must be a 6-digit number')
  }

  const user = await User.findById(userId).select('+twoFactorTempSecret +lastTotpUsed')
  if (!user || !user.twoFactorTempSecret) {
    throw new Error('No pending two-factor setup found. Please sign in again.')
  }

  if (user.lastTotpUsed === normalizedCode) {
    throw new Error('This authenticator code was already used. Please wait for the next code.')
  }

  const result = verifySync({
    token: normalizedCode,
    secret: user.twoFactorTempSecret,
  })

  if (!result.valid) {
    throw new Error('Invalid verification code. Please check the current code in your authenticator app.')
  }

  user.twoFactorEnabled = true
  user.twoFactorSecret = user.twoFactorTempSecret
  user.twoFactorTempSecret = undefined
  user.lastTotpUsed = normalizedCode
  await user.save()

  logger.info('Mandatory 2FA setup completed successfully', { userId })

  const token = generateSessionToken(user)
  return {
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      name: user.name,
      picture: user.picture,
      role: user.role,
      twoFactorEnabled: user.twoFactorEnabled,
    },
  }
}

export async function generate2FASetup(
  userId: string
): Promise<{ secret: string; qrCodeUrl: string }> {
  const user = await User.findById(userId)
  if (!user) {
    throw new Error('User not found')
  }

  const secret = generateSecret()
  const otpauthUri = generateURI({
    issuer: 'SQL Compass',
    label: `${user.username || user.email}`,
    secret,
  })

  const qrCodeUrl = await QRCode.toDataURL(otpauthUri)

  user.twoFactorTempSecret = secret
  await user.save()

  return { secret, qrCodeUrl }
}

export async function confirm2FASetup(
  userId: string,
  code: string
): Promise<{ success: boolean; message: string }> {
  const normalizedCode = (code || '').trim()
  if (!/^\d{6}$/.test(normalizedCode)) {
    throw new Error('Authentication code must be a 6-digit number')
  }

  const user = await User.findById(userId).select('+twoFactorTempSecret +lastTotpUsed')
  if (!user || !user.twoFactorTempSecret) {
    throw new Error('No pending two-factor setup found. Please restart setup.')
  }

  const result = verifySync({
    token: normalizedCode,
    secret: user.twoFactorTempSecret,
  })

  if (!result.valid) {
    throw new Error('Invalid verification code. Please ensure your device clock is synchronized.')
  }

  user.twoFactorEnabled = true
  user.twoFactorSecret = user.twoFactorTempSecret
  user.twoFactorTempSecret = undefined
  user.lastTotpUsed = normalizedCode
  await user.save()

  logger.info('2FA enabled for user', { userId })
  return { success: true, message: 'Two-factor authentication has been successfully enabled' }
}

export async function requestPasswordReset(
  emailInput: string
): Promise<{ success: boolean; message: string; resetToken?: string; expiresInMinutes: number }> {
  const email = (emailInput || '').toLowerCase().trim()
  if (!email) {
    throw new Error('Email is required')
  }

  const user = await User.findOne({ email })
  const rawToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')

  if (user) {
    user.passwordResetTokenHash = tokenHash
    user.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_EXPIRES_MS)
    await user.save()
    logger.info('Password reset token generated', { userId: user._id.toString() })
  }

  const isDev = process.env.NODE_ENV !== 'production'
  return {
    success: true,
    message: 'If an account exists with this email address, password reset instructions have been generated.',
    ...(isDev || !process.env.SMTP_HOST ? { resetToken: rawToken } : {}),
    expiresInMinutes: 15,
  }
}

export async function verifyPasswordResetToken(
  token: string
): Promise<{ valid: boolean; email?: string; remainingSeconds?: number }> {
  if (!token || typeof token !== 'string') {
    return { valid: false }
  }

  const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex')
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetExpires')

  if (!user || !user.passwordResetExpires) {
    return { valid: false }
  }

  const remainingSeconds = Math.max(0, Math.floor((user.passwordResetExpires.getTime() - Date.now()) / 1000))
  return {
    valid: true,
    email: user.email,
    remainingSeconds,
  }
}

export async function completePasswordReset(
  token: string,
  newPassword: string
): Promise<AuthResult> {
  if (!token || typeof token !== 'string') {
    throw new Error('Reset token is required')
  }

  const normalizedPassword = (newPassword || '').trim()
  if (normalizedPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long')
  }

  const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex')
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordHash +passwordResetTokenHash +passwordResetExpires')

  if (!user) {
    throw new Error('Password reset token is invalid or has expired')
  }

  const salt = await bcrypt.genSalt(12)
  user.passwordHash = await bcrypt.hash(normalizedPassword, salt)
  user.passwordResetTokenHash = undefined
  user.passwordResetExpires = undefined
  await user.save()

  logger.info('Password reset completed', { userId: user._id.toString() })
  return prepareMandatory2FAResult(user)
}
