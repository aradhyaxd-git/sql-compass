import { Router } from 'express'
import {
  getGoogleUrl,
  googleCallback,
  setUsernameController,
  register,
  passwordLogin,
  verify2FALoginController,
  confirm2FASetupWithChallengeController,
  setup2FAController,
  confirm2FAController,
  forgotPasswordController,
  resetPasswordController,
  getCurrentUser,
  logout,
} from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/google/url', getGoogleUrl)
router.post('/google/callback', googleCallback)
router.post('/set-username', setUsernameController)
router.post('/register', register)
router.post('/login', passwordLogin)
router.post('/2fa/login', verify2FALoginController)
router.post('/2fa/setup-confirm', confirm2FASetupWithChallengeController)
router.post('/2fa/setup', requireAuth, setup2FAController)
router.post('/2fa/confirm', requireAuth, confirm2FAController)
router.post('/forgot-password', forgotPasswordController)
router.post('/reset-password', resetPasswordController)
router.get('/me', requireAuth, getCurrentUser)
router.post('/logout', logout)

export default router
