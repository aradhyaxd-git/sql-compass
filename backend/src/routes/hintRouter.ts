import { Router } from 'express'
import { getAssignmentHint } from '../controllers/hintController.js'
import { requireAuth } from '../middleware/auth.js'
import { hintLimiter } from '../middleware/rateLimiter.js'

const router = Router()
router.post('/', hintLimiter, requireAuth, getAssignmentHint)

export default router