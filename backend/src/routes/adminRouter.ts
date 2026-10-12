import { Router } from 'express'
import {
  generateAssignments,
  resumeAssignmentGeneration,
} from '../controllers/adminController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/adminAuth.js'

const router = Router()

router.post('/assignments/generate', requireAuth, requireAdmin, generateAssignments)
router.post('/assignments/generate/:runId/resume', requireAuth, requireAdmin, resumeAssignmentGeneration)

export default router
