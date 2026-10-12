import { Router } from 'express'
import { getAssignmentHint, streamAssignmentHint } from '../controllers/hintController.js'
import { requireAuth } from '../middleware/auth.js'
import { hintLimiter } from '../middleware/rateLimiter.js'

const router = Router()
router.post('/', requireAuth, hintLimiter, getAssignmentHint)
router.post('/stream', requireAuth, hintLimiter, streamAssignmentHint)

export default router