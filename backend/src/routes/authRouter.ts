import { Router } from 'express'
import {
  getGoogleUrl,
  googleCallback,
  passwordLogin,
  getCurrentUser,
} from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/google/url', getGoogleUrl)
router.post('/google/callback', googleCallback)
router.post('/login', passwordLogin)
router.get('/me', requireAuth, getCurrentUser)

export default router
