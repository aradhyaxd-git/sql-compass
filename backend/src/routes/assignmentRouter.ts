import { Router } from 'express'
import {getAllAssignments,getAssignmentById,getAssignmentSchema,} from '../controllers/assignmentController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/', getAllAssignments)
router.get('/:id', getAssignmentById)
router.get('/:id/schema', getAssignmentSchema) 

export default router