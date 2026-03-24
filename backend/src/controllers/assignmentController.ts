import type { Request, Response } from 'express'
import Assignment from '../models/Assignment.js'
import { getSchemaForTables } from '../services/schemaService.js'


export const getAllAssignments = async (req: Request, res: Response): Promise<void> => {
  try {
    const assignments = await Assignment.find({})
      .select('title difficulty description tags tableNames createdAt')
      .lean()

    res.status(200).json({ success: true, data: assignments })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    res.status(500).json({ success: false, message: msg })
  }
}



export const getAssignmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const assignment = await Assignment.findById(id).lean()

    if (!assignment) {
      res.status(404).json({ success: false, message: 'Assignment not found' })
      return
    }

    res.status(200).json({ success: true, data: assignment })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    res.status(500).json({ success: false, message: msg })
  }
}


export const getAssignmentSchema = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
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
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    res.status(500).json({ success: false, message: msg })
  }
}