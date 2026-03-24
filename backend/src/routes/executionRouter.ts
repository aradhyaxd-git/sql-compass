import { Router } from 'express'
import { handleExecution } from '../controllers/executionController.js'
import { requireAuth } from '../middleware/auth.js'
import { queryLimiter } from '../middleware/rateLimiter.js'

const router = Router()
router.post('/execute', queryLimiter, requireAuth, handleExecution)

export default router