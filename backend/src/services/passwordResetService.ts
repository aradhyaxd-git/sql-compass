import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import { logger } from '../utils/logger.js'

const RESET_TOKEN_EXPIRES_MS = 15 * 60 * 1000

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
): Promise<string> {
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
  return user._id.toString()
}
