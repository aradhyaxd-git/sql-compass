import { createClerkClient, verifyToken } from '@clerk/backend'
import type { Request, Response, NextFunction } from 'express'

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
})

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization

  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
  const sessionCookieMatch = req.headers.cookie?.match(/(?:^|;\s*)__session=([^;]+)/)
  const cookieToken = sessionCookieMatch ? decodeURIComponent(sessionCookieMatch[1]) : null
  const token = bearerToken ?? cookieToken

  if (!token) {
    res.status(401).json({ success: false, message: 'Missing authorization token' })
    return
  }

  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    })
    req.userId = payload.sub
    next()
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}