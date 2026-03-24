import type { Request, Response } from 'express'
import { generateHint } from '../services/llmService.js'
import Assignment from '../models/Assignment.js'
import type { HintRequestBody } from '../types/index.js'

export const getAssignmentHint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { assignmentId, currentQuery } = req.body as HintRequestBody

    if (!assignmentId) {
      res.status(400).json({ success: false, message: 'assignmentId is required' })
      return
    }

    const assignment = await Assignment.findById(assignmentId)
      .select('description schemaDetails')
      .lean()

    if (!assignment) {
      res.status(404).json({ success: false, message: 'Assignment not found' })
      return
    }

    const hint = await generateHint(
      assignment.description,
      assignment.schemaDetails,
      currentQuery ?? ''
    )

    res.status(200).json({ success: true, data: { hint } })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    res.status(500).json({ success: false, message: msg })
  }
}