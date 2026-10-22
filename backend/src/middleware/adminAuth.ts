import type { Request, Response, NextFunction } from 'express'

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const userId = req.userId
  if (!userId) {
    res.status(401).json({ success: false, message: 'Authentication required' })
    return
  }

  if (req.userRole === 'admin') {
    next()
    return
  }

  const adminIds = (process.env.ADMIN_USER_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)

  if (adminIds.length > 0 && adminIds.includes(userId)) {
    next()
    return
  }

  res.status(403).json({ success: false, message: 'Forbidden: Admin access required' })
}
