import type { Request, Response } from 'express'
import { executeUserQuery } from '../services/executionService.js'
import { saveAttempt } from '../services/attemptService.js'
import Assignment from '../models/Assignment.js'
import type { ExecuteRequestBody } from '../types/index.js' 

export const handleExecution = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assignmentId, sql } = req.body as ExecuteRequestBody
    const userId = req.userId! 

    if (!sql || !sql.trim()) {
      res.status(400).json({ success: false, message: 'SQL query is required' })
      return
    }

    if (!assignmentId) {
      res.status(400).json({ success: false, message: 'assignmentId is required' })
      return
    }

    const assignment = await Assignment.findById(assignmentId).select('title').lean()

    let result
    try {
      result = await executeUserQuery(sql)
    } catch (execError) {
      const msg = execError instanceof Error ? execError.message : String(execError)
      if (assignment) {
        await saveAttempt({
          userId,
          assignmentId,
          assignmentTitle: assignment.title,
          query: sql,
          status: 'error',
          rowCount: 0,
          errorMessage: msg,
        }).catch((saveErr) => {
          console.error('[ExecutionController] Error saving failed attempt:', saveErr)
        })  
      }

      res.status(400).json({ success: false, message: msg })
      return
    }

    if (assignment) {
      await saveAttempt({
        userId,
        assignmentId,
        assignmentTitle: assignment.title,
        query: sql,
        status: 'success',
        rowCount: result.rowCount,
      }).catch((saveErr) => {
        console.error('[ExecutionController] Error saving successful attempt:', saveErr)
      })
    }

    res.status(200).json({ success: true, data: result })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    res.status(500).json({ success: false, message: msg })
  }
}