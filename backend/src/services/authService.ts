import bcrypt from 'bcryptjs'
import User, { type IUser } from '../models/User.js'
import { logger } from '../utils/logger.js'
import {
  generateSessionToken,
  generate2FAChallengeToken,
  verify2FAChallengeToken,
} from '../utils/tokenUtils.js'
import { createTotpSetupData, verifyTotpCode } from '../utils/totpUtils.js'
import { verifyGoogleAuthorizationCode } from './googleAuthService.js'

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
      needsUsername: true
      challengeToken: string
      email: string
      name?: string
    }
  | {
      needsUsername: false
      mfaRequired: true
      mfaSetupRequired: false
      challengeToken: string
      email: string
      username: string
    }
  | {
      needsUsername: false
      mfaRequired: true
      mfaSetupRequired: true
      challengeToken: string
      qrCodeUrl: string
      secret: string
      email: string
      username: string
    }

export function formatUserResponse(user: IUser): UserResponse {
  return {
    id: user._id.toString(),
    email: user.email,
    username: user.username,
    name: user.name,
    picture: user.picture,
    role: user.role,
    twoFactorEnabled: user.twoFactorEnabled,
  }
}

export async function prepareMandatory2FAResult(user: IUser): Promise<AuthResult> {
  const challengeToken = generate2FAChallengeToken(user._id.toString())

  if (!user.username) {
    return {
      needsUsername: true,
      challengeToken,
      email: user.email,
      name: user.name,
    }
  }

  if (user.twoFactorEnabled) {
    return {
      needsUsername: false,
      mfaRequired: true,
      mfaSetupRequired: false,
      challengeToken,
      email: user.email,
      username: user.username,
    }
  }

  const { secret, qrCodeUrl } = await createTotpSetupData(`${user.username} (${user.email})`)

  user.twoFactorTempSecret = secret
  await user.save()

  return {
    needsUsername: false,
    mfaRequired: true,
    mfaSetupRequired: true,
    challengeToken,
    qrCodeUrl,
    secret,
    email: user.email,
    username: user.username,
  }
}

export async function setUsernameWithChallenge(
  challengeToken: string,
  usernameInput: string
): Promise<AuthResult> {
  const { sub: userId } = verify2FAChallengeToken(challengeToken)
  const rawUsername = (usernameInput || '').toLowerCase().trim()

  if (!rawUsername) {
    throw new Error('Username is required')
  }

  if (rawUsername.length < 3 || rawUsername.length > 30) {
    throw new Error('Username must be between 3 and 30 characters long')
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(rawUsername)) {
    throw new Error('Username can only contain alphanumeric characters, underscores, and hyphens')
  }

  const existing = await User.findOne({ username: rawUsername })
  if (existing && existing._id.toString() !== userId) {
    throw new Error('Username is already taken. Please choose another username.')
  }

  const user = await User.findById(userId)
  if (!user) {
    throw new Error('User not found')
  }

  user.username = rawUsername
  await user.save()

  logger.info('User chosen unique username', { userId, username: rawUsername })
  return prepareMandatory2FAResult(user)
}

export async function exchangeGoogleCode(
  code: string,
  redirectUri: string
): Promise<AuthResult> {
  const googlePayload = await verifyGoogleAuthorizationCode(code, redirectUri)

  const adminIds = (process.env.ADMIN_USER_IDS || '').split(',').map((id) => id.trim()).filter(Boolean)
  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim()
  const isAdmin = (adminEmail && googlePayload.email === adminEmail) || (googlePayload.googleId && adminIds.includes(googlePayload.googleId))

  let user = await User.findOne({ $or: [{ googleId: googlePayload.googleId }, { email: googlePayload.email }] })

  if (!user) {
    user = await User.create({
      email: googlePayload.email,
      name: googlePayload.name,
      picture: googlePayload.picture,
      googleId: googlePayload.googleId,
      role: isAdmin ? 'admin' : 'user',
      twoFactorEnabled: false,
    })
    logger.info('Created new user via Google OAuth awaiting username selection', { userId: user._id.toString() })
  } else {
    user.name = googlePayload.name
    user.picture = googlePayload.picture
    if (!user.googleId) user.googleId = googlePayload.googleId
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

  const user = await User.create({
    name,
    username: rawUsername,
    email,
    passwordHash,
    role: 'user',
    twoFactorEnabled: false,
  })

  logger.info('New user registered with username', { userId: user._id.toString(), username: user.username })
  return prepareMandatory2FAResult(user)
}

export async function authenticateWithPassword(
  usernameInput: string,
  passwordInput: string
): Promise<AuthResult> {
  const username = (usernameInput || '').toLowerCase().trim()
  const password = (passwordInput || '').trim()

  if (!username || !password) {
    throw new Error('Username and password are required')
  }

  const envAdminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim()
  const envAdminPassword = process.env.ADMIN_PASSWORD || ''

  if (
    envAdminEmail &&
    envAdminPassword &&
    username === 'admin' &&
    password === envAdminPassword
  ) {
    let adminUser = await User.findOne({ username: 'admin' })
    if (!adminUser) {
      adminUser = await User.create({
        email: envAdminEmail,
        username: 'admin',
        name: 'Administrator',
        role: 'admin',
        twoFactorEnabled: false,
      })
    } else if (adminUser.role !== 'admin') {
      adminUser.role = 'admin'
      await adminUser.save()
    }

    return prepareMandatory2FAResult(adminUser)
  }

  const existingUser = await User.findOne({ username }).select('+passwordHash')

  if (!existingUser || !existingUser.passwordHash) {
    throw new Error('Invalid username or password')
  }

  const isMatch = await bcrypt.compare(password, existingUser.passwordHash)
  if (!isMatch) {
    throw new Error('Invalid username or password')
  }

  return prepareMandatory2FAResult(existingUser)
}

export async function verify2FALogin(
  challengeToken: string,
  code: string
): Promise<{ token: string; user: UserResponse }> {
  const { sub: userId } = verify2FAChallengeToken(challengeToken)
  const normalizedCode = (code || '').trim()

  const user = await User.findById(userId).select('+twoFactorSecret +lastTotpUsed')
  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    throw new Error('Two-factor authentication is not active on this account. Please complete setup.')
  }

  const isValid = verifyTotpCode(normalizedCode, user.twoFactorSecret, user.lastTotpUsed)
  if (!isValid) {
    throw new Error('Invalid authentication code. Please check your authenticator app.')
  }

  user.lastTotpUsed = normalizedCode
  await user.save()

  const token = generateSessionToken({
    id: user._id.toString(),
    email: user.email,
    username: user.username,
    name: user.name,
    picture: user.picture,
    role: user.role,
  })

  return { token, user: formatUserResponse(user) }
}

export async function confirm2FASetupWithChallenge(
  challengeToken: string,
  code: string
): Promise<{ token: string; user: UserResponse }> {
  const { sub: userId } = verify2FAChallengeToken(challengeToken)
  const normalizedCode = (code || '').trim()

  const user = await User.findById(userId).select('+twoFactorTempSecret +lastTotpUsed')
  if (!user || !user.twoFactorTempSecret) {
    throw new Error('No pending two-factor setup found. Please sign in again.')
  }

  const isValid = verifyTotpCode(normalizedCode, user.twoFactorTempSecret, user.lastTotpUsed)
  if (!isValid) {
    throw new Error('Invalid verification code. Please check the current code in your authenticator app.')
  }

  user.twoFactorEnabled = true
  user.twoFactorSecret = user.twoFactorTempSecret
  user.twoFactorTempSecret = undefined
  user.lastTotpUsed = normalizedCode
  await user.save()

  logger.info('Mandatory 2FA setup completed successfully', { userId })

  const token = generateSessionToken({
    id: user._id.toString(),
    email: user.email,
    username: user.username,
    name: user.name,
    picture: user.picture,
    role: user.role,
  })

  return { token, user: formatUserResponse(user) }
}

export async function generate2FASetup(
  userId: string
): Promise<{ secret: string; qrCodeUrl: string }> {
  const user = await User.findById(userId)
  if (!user) {
    throw new Error('User not found')
  }

  const { secret, qrCodeUrl } = await createTotpSetupData(`${user.username || user.email}`)

  user.twoFactorTempSecret = secret
  await user.save()

  return { secret, qrCodeUrl }
}

export async function confirm2FASetup(
  userId: string,
  code: string
): Promise<{ success: boolean; message: string }> {
  const normalizedCode = (code || '').trim()

  const user = await User.findById(userId).select('+twoFactorTempSecret +lastTotpUsed')
  if (!user || !user.twoFactorTempSecret) {
    throw new Error('No pending two-factor setup found. Please restart setup.')
  }

  const isValid = verifyTotpCode(normalizedCode, user.twoFactorTempSecret, user.lastTotpUsed)
  if (!isValid) {
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
