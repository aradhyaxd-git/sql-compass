import type { Request, Response } from 'express'
import { getUserStats, getUserAttempts } from '../services/attemptService.js'

export const getProfileStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!
    const stats = await getUserStats(userId)
    res.status(200).json({ success: true, data: stats })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error fetching profile stats' })
  }
}

export const getAttemptHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!
    const assignmentId = typeof req.query.assignmentId === 'string' ? req.query.assignmentId : undefined
    const parsedLimit = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : 20
    const limit = Number.isInteger(parsedLimit) && parsedLimit > 0 ? Math.min(parsedLimit, 100) : 20
    const attempts = await getUserAttempts(userId, limit, assignmentId)
    res.status(200).json({ success: true, data: attempts })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error fetching attempt history' })
  }
}