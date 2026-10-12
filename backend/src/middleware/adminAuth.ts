import type { Request, Response, NextFunction } from 'express'

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const userId = req.userId
  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' })
    return
  }

  const adminIds = (process.env.ADMIN_USER_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)

  if (adminIds.length === 0) {
    if (process.env.NODE_ENV === 'production') {
      res.status(403).json({ success: false, message: 'Forbidden: Admin access not configured' })
      return
    }
  } else if (!adminIds.includes(userId)) {
    res.status(403).json({ success: false, message: 'Forbidden: Admin access required' })
    return
  }

  next()
}
