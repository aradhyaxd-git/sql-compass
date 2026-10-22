import { createClerkClient, verifyToken } from '@clerk/backend'
import type { Request, Response, NextFunction } from 'express'

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
})

function extractAuthToken(req: Request): string | null {
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    const bearer = authHeader.slice(7).trim()
    if (bearer) return bearer
  }

  const rawCookie = req.headers.cookie
  if (!rawCookie) return null

  const match = rawCookie.match(/(?:^|;\s*)__session=([^;]+)/)
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
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
      ...(process.env.CLIENT_ORIGIN ? { authorizedParties: [process.env.CLIENT_ORIGIN] } : {}),
    })
    req.userId = payload.sub
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' })
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
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
      ...(process.env.CLIENT_ORIGIN ? { authorizedParties: [process.env.CLIENT_ORIGIN] } : {}),
    })
    req.userId = payload.sub
    next()
  } catch {
    req.userId = undefined
    next()
  }
}