import type { Request, Response } from 'express'
import {
  getGoogleAuthorizationUrl,
  exchangeGoogleCode,
  authenticateWithPassword,
} from '../services/authService.js'
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
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    logger.error('Google OAuth token exchange failed', { event: 'google_callback_error', error: msg })
    res.status(401).json({ success: false, message: msg })
  }
}

export const passwordLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body || {}

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' })
      return
    }

    const result = await authenticateWithPassword(String(email), String(password))
    res.status(200).json({ success: true, data: result })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    res.status(401).json({ success: false, message: msg })
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
            name: 'User',
            role: req.userRole || 'user',
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
          name: user.name,
          picture: user.picture,
          role: user.role,
        },
      },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    res.status(500).json({ success: false, message: msg })
  }
}
