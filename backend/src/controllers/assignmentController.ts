import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import Assignment from '../models/Assignment.js'
import { getSchemaForTables } from '../services/schemaService.js'

export const getAllAssignments = async (req: Request, res: Response): Promise<void> => {
  try {
    const assignments = await Assignment.find({})
      .select('title difficulty description tags tableNames createdAt')
      .lean()

    res.status(200).json({ success: true, data: assignments })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error fetching assignments' })
  }
}

export const getAssignmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id)

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid assignment ID format' })
      return
    }

    const assignment = await Assignment.findById(id).lean()

    if (!assignment) {
      res.status(404).json({ success: false, message: 'Assignment not found' })
      return
    }

    res.status(200).json({ success: true, data: assignment })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}

export const getAssignmentSchema = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id)

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid assignment ID format' })
      return
    }

    const assignment = await Assignment.findById(id).select('tableNames').lean()

    if (!assignment) {
      res.status(404).json({ success: false, message: 'Assignment not found' })
      return
    }

    if (!assignment.tableNames?.length) {
      res.status(200).json({ success: true, data: [] })
      return
    }

    const schema = await getSchemaForTables(assignment.tableNames)
    res.status(200).json({ success: true, data: schema })
  } catch {
    res.status(500).json({ success: false, message: 'Internal server error' })
  }
}