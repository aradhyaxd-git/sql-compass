import type { Request, Response } from 'express'
import { getUserStats, getUserAttempts } from '../services/attemptService.js'

export const getProfileStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!
    const stats = await getUserStats(userId)
    res.status(200).json({ success: true, data: stats })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    res.status(500).json({ success: false, message: msg })
  }
}


export const getAttemptHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!
    const attempts = await getUserAttempts(userId)
    res.status(200).json({ success: true, data: attempts })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    res.status(500).json({ success: false, message: msg })
  }
}