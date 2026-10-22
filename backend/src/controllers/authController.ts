import type { Request, Response } from 'express'
import {
  exchangeGoogleCode,
  authenticateWithPassword,
  registerWithPassword,
  setUsernameWithChallenge,
  verify2FALogin,
  confirm2FASetupWithChallenge,
  generate2FASetup,
  confirm2FASetup,
  prepareMandatory2FAResult,
} from '../services/authService.js'
import { getGoogleAuthorizationUrl } from '../services/googleAuthService.js'
import {
  requestPasswordReset,
  verifyPasswordResetToken,
  completePasswordReset,
} from '../services/passwordResetService.js'
import { getAuthCookieOptions, AUTH_COOKIE_NAME } from '../utils/cookieUtils.js'
import User from '../models/User.js'
import { logger } from '../utils/logger.js'

export const getGoogleUrl = (req: Request, res: Response): void => {
  try {
    const redirectUri =
      typeof req.query.redirectUri === 'string' && req.query.redirectUri.trim()
        ? req.query.redirectUri.trim()
        : `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/auth/callback`

    const url = getGoogleAuthorizationUrl(redirectUri)
    res.status(200).json({ success: true, data: { url } })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    logger.error('Failed to generate Google auth URL', { event: 'google_url_error', error: msg })
    res.status(500).json({ success: false, message: msg })
  }
}

export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, redirectUri } = req.body || {}

    if (!code || typeof code !== 'string') {
      res.status(400).json({ success: false, message: 'Authorization code is required' })
      return
    }

    const effectiveRedirectUri =
      typeof redirectUri === 'string' && redirectUri.trim()
        ? redirectUri.trim()
        : `${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}/auth/callback`

    const result = await exchangeGoogleCode(code, effectiveRedirectUri)
    res.status(200).json({ success: true, ...result })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    logger.error('Google OAuth token exchange failed', { event: 'google_callback_error', error: msg })
    res.status(401).json({ success: false, message: msg })
  }
}

export const setUsernameController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { challengeToken, username } = req.body || {}

    if (!challengeToken || !username) {
      res.status(400).json({ success: false, message: 'Challenge token and username are required' })
      return
    }

    const result = await setUsernameWithChallenge(String(challengeToken), String(username))
    res.status(200).json({ success: true, ...result })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    res.status(400).json({ success: false, message: msg })
  }
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, username, email, password } = req.body || {}

    if (!name || !username || !email || !password) {
      res.status(400).json({ success: false, message: 'All fields (name, username, email, password) are required' })
      return
    }

    const result = await registerWithPassword(
      String(name),
      String(username),
      String(email),
      String(password)
    )

    res.status(201).json({ success: true, ...result })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    res.status(400).json({ success: false, message: msg })
  }
}

export const passwordLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body || {}

    if (!username || !password) {
      res.status(400).json({ success: false, message: 'Username and password are required' })
      return
    }

    const result = await authenticateWithPassword(String(username), String(password))
    res.status(200).json({ success: true, ...result })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    res.status(401).json({ success: false, message: msg })
  }
}

export const verify2FALoginController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { challengeToken, code } = req.body || {}

    if (!challengeToken || !code) {
      res.status(400).json({ success: false, message: 'Challenge token and 6-digit code are required' })
      return
    }

    const result = await verify2FALogin(String(challengeToken), String(code))
    res.cookie(AUTH_COOKIE_NAME, result.token, getAuthCookieOptions())
    res.status(200).json({
      success: true,
      data: { user: result.user },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    res.status(401).json({ success: false, message: msg })
  }
}

export const confirm2FASetupWithChallengeController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { challengeToken, code } = req.body || {}

    if (!challengeToken || !code) {
      res.status(400).json({ success: false, message: 'Challenge token and 6-digit code are required' })
      return
    }

    const result = await confirm2FASetupWithChallenge(String(challengeToken), String(code))
    res.cookie(AUTH_COOKIE_NAME, result.token, getAuthCookieOptions())
    res.status(200).json({
      success: true,
      data: { user: result.user },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    res.status(400).json({ success: false, message: msg })
  }
}

export const setup2FAController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' })
      return
    }

    const data = await generate2FASetup(userId)
    res.status(200).json({ success: true, data })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    res.status(500).json({ success: false, message: msg })
  }
}

export const confirm2FAController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' })
      return
    }

    const { code } = req.body || {}
    if (!code) {
      res.status(400).json({ success: false, message: '6-digit verification code is required' })
      return
    }

    const result = await confirm2FASetup(userId, String(code))
    res.status(200).json({ success: true, message: result.message })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    res.status(400).json({ success: false, message: msg })
  }
}

export const forgotPasswordController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body || {}
    if (!email) {
      res.status(400).json({ success: false, message: 'Email address is required' })
      return
    }

    const result = await requestPasswordReset(String(email))
    res.status(200).json({
      success: true,
      message: result.message,
      ...(result.resetToken ? { resetToken: result.resetToken } : {}),
      expiresInMinutes: result.expiresInMinutes,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    res.status(500).json({ success: false, message: msg })
  }
}

export const verifyResetTokenController = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = typeof req.query.token === 'string' ? req.query.token : String(req.body?.token || '')
    if (!token) {
      res.status(400).json({ success: false, message: 'Reset token is required' })
      return
    }

    const result = await verifyPasswordResetToken(token)
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    res.status(500).json({ success: false, message: msg })
  }
}

export const resetPasswordController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body || {}
    if (!token || !newPassword) {
      res.status(400).json({ success: false, message: 'Token and new password are required' })
      return
    }

    const userId = await completePasswordReset(String(token), String(newPassword))
    const user = await User.findById(userId)
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' })
      return
    }

    const result = await prepareMandatory2FAResult(user)
    res.status(200).json({ success: true, ...result })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    res.status(400).json({ success: false, message: msg })
  }
}

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId
    if (!userId) {
      res.status(401).json({ success: false, message: 'Not authenticated' })
      return
    }

    const user = await User.findById(userId).lean()
    if (!user) {
      res.status(200).json({
        success: true,
        data: {
          user: {
            id: userId,
            email: req.userEmail || '',
            username: req.userUsername || 'user',
            name: 'User',
            role: req.userRole || 'user',
            twoFactorEnabled: false,
          },
        },
      })
      return
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          username: user.username || 'user',
          name: user.name,
          picture: user.picture,
          role: user.role,
          twoFactorEnabled: !!user.twoFactorEnabled,
        },
      },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    res.status(500).json({ success: false, message: msg })
  }
}

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions())
  res.status(200).json({ success: true, message: 'Logged out successfully' })
}
