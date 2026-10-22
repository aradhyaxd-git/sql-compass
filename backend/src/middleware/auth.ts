import type { Request, Response, NextFunction } from 'express'
import { verifySessionToken } from '../services/authService.js'
import { updateTraceUser } from '../utils/logger.js'

function extractAuthToken(req: Request): string | null {
  if (req.cookies?.token) {
    return String(req.cookies.token).trim() || null
  }
  if (req.cookies?.__session) {
    return String(req.cookies.__session).trim() || null
  }

  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    const bearer = authHeader.slice(7).trim()
    if (bearer) return bearer
  }

  const rawCookie = req.headers.cookie
  if (!rawCookie) return null

  const match = rawCookie.match(/(?:^|;\s*)(?:token|__session)=([^;]+)/)
  if (!match) return null

  try {
    return decodeURIComponent(match[1]).trim() || null
  } catch {
    return null
  }
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = extractAuthToken(req)

  if (!token) {
    res.status(401).json({ success: false, message: 'Missing authorization token' })
    return
  }

  try {
    const payload = verifySessionToken(token)
    req.userId = payload.sub
    req.userRole = payload.role
    req.userEmail = payload.email
    req.userUsername = payload.username
    updateTraceUser(payload.sub)
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired session token' })
  }
}

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const token = extractAuthToken(req)

  if (!token) {
    req.userId = undefined
    next()
    return
  }

  try {
    const payload = verifySessionToken(token)
    req.userId = payload.sub
    req.userRole = payload.role
    req.userEmail = payload.email
    req.userUsername = payload.username
    updateTraceUser(payload.sub)
    next()
  } catch {
    req.userId = undefined
    next()
  }
}