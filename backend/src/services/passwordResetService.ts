import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { generateResetChallengeToken, verifyResetChallengeToken, generateSessionToken } from '../utils/tokenUtils.js'
import { verifyTotpCode } from '../utils/totpUtils.js'
import { logger } from '../utils/logger.js'

export async function initiatePasswordReset(
  usernameInput: string
): Promise<{ challengeToken: string; username: string }> {
  const username = (usernameInput || '').toLowerCase().trim()
  if (!username) {
    throw new Error('Username is required')
  }

  const user = await User.findOne({ username })
  if (!user) {
    throw new Error('No account found with this username')
  }

  if (!user.twoFactorEnabled || !user.twoFactorSecret) {
    throw new Error('Two-factor authentication is required to reset password')
  }

  const challengeToken = generateResetChallengeToken(user._id.toString(), user.username)
  logger.info('Password reset challenge initiated', { userId: user._id.toString(), username: user.username })

  return {
    challengeToken,
    username: user.username,
  }
}

export async function completePasswordReset(
  challengeToken: string,
  code: string,
  newPassword: string
): Promise<{ token: string; user: any }> {
  if (!challengeToken) {
    throw new Error('Reset challenge token is required')
  }

  const { sub: userId } = verifyResetChallengeToken(challengeToken)

  const normalizedPassword = (newPassword || '').trim()
  if (normalizedPassword.length < 8) {
    throw new Error('Password must be at least 8 characters long')
  }

  const user = await User.findById(userId).select('+twoFactorSecret +lastTotpUsed +passwordHash')
  if (!user) {
    throw new Error('User not found')
  }

  if (!user.twoFactorSecret) {
    throw new Error('Two-factor authentication secret not configured')
  }

  const isValidCode = verifyTotpCode(code, user.twoFactorSecret, user.lastTotpUsed)
  if (!isValidCode) {
    throw new Error('Invalid 6-digit authenticator code')
  }

  user.lastTotpUsed = code.trim()

  const salt = await bcrypt.genSalt(12)
  user.passwordHash = await bcrypt.hash(normalizedPassword, salt)
  user.passwordResetTokenHash = undefined
  user.passwordResetExpires = undefined
  await user.save()

  logger.info('Password reset completed successfully via 2FA', { userId: user._id.toString() })

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
      twoFactorEnabled: !!user.twoFactorEnabled,
    },
  }
}
