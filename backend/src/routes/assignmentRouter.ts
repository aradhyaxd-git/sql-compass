import { Router } from 'express'
import {
  getAllAssignments,
  getAssignmentById,
  getAssignmentSchema,
} from '../controllers/assignmentController.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

// Assignments catalog is public read-only; optionalAuth attaches userId if user is logged in
router.use(optionalAuth)

router.get('/', getAllAssignments)
router.get('/:id', getAssignmentById)
router.get('/:id/schema', getAssignmentSchema)

export default router