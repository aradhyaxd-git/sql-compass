import { Router } from 'express'
import { getProfileStats, getAttemptHistory } from '../controllers/profileController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

router.get('/stats', getProfileStats)    
router.get('/attempts', getAttemptHistory)  

export default router