import assert from 'assert'
import crypto from 'crypto'
import { generateSecret, generateSync, verifySync } from 'otplib'
import {
  generateSessionToken,
  verifySessionToken,
  generate2FAChallengeToken,
  verify2FAChallengeToken,
  generateResetChallengeToken,
  verifyResetChallengeToken,
} from '../utils/tokenUtils.js'

async function runAuthSecurityTests() {
  console.log('Testing Auth Security & 2FA Suite...')

  // 1. Session Token JWT Verification
  const dummyUser: any = {
    _id: '654321098765432109876543',
    email: 'engineer@sqlcompass.internal',
    username: 'sectester',
    name: 'Security Tester',
    picture: 'https://example.com/pic.png',
    role: 'admin',
    twoFactorEnabled: true,
  }

  const sessionToken = generateSessionToken(dummyUser)
  const decoded = verifySessionToken(sessionToken)
  assert.strictEqual(decoded.sub, dummyUser._id)
  assert.strictEqual(decoded.email, dummyUser.email)
  assert.strictEqual(decoded.username, dummyUser.username)
  assert.strictEqual(decoded.role, dummyUser.role)
  console.log('Session JWT signing and verification passed.')

  // 2. 2FA Challenge Token Expiry and Type Verification
  const challengeToken = generate2FAChallengeToken(dummyUser._id)
  const challengeDecoded = verify2FAChallengeToken(challengeToken)
  assert.strictEqual(challengeDecoded.sub, dummyUser._id)

  assert.throws(() => {
    verify2FAChallengeToken(sessionToken)
  }, /Invalid challenge token/)
  console.log('2FA Challenge token type isolation passed.')

  // 3. TOTP Generation and Verification with otplib
  const secret = generateSecret()
  const validTotp = generateSync({ secret })
  const verifyResult = verifySync({ token: validTotp, secret })
  assert.strictEqual(verifyResult.valid, true)

  const invalidTotpResult = verifySync({ token: '000000', secret })
  assert.strictEqual(invalidTotpResult.valid, false)
  console.log('TOTP code generation and cryptographic validation passed.')

  // 4. Anti-Replay Simulation
  let lastTotpUsed: string | undefined = undefined
  function processTotp(token: string, userSecret: string): boolean {
    if (lastTotpUsed === token) {
      throw new Error('This authenticator code was already used. Please wait for the next code.')
    }
    const res = verifySync({ token, secret: userSecret })
    if (!res.valid) return false
    lastTotpUsed = token
    return true
  }

  assert.strictEqual(processTotp(validTotp, secret), true)
  assert.throws(() => {
    processTotp(validTotp, secret)
  }, /already used/)
  console.log('Anti-replay TOTP enforcement passed.')

  // 5. Password Reset Challenge Token Verification and Isolation
  const resetToken = generateResetChallengeToken(dummyUser._id, dummyUser.username)
  const resetDecoded = verifyResetChallengeToken(resetToken)
  assert.strictEqual(resetDecoded.sub, dummyUser._id)
  assert.strictEqual(resetDecoded.username, dummyUser.username)

  assert.throws(() => {
    verifyResetChallengeToken(sessionToken)
  }, /Invalid password reset challenge token/)

  assert.throws(() => {
    verifyResetChallengeToken(challengeToken)
  }, /Invalid password reset challenge token/)

  console.log('Password reset challenge token verification and isolation passed.')

  console.log('[SUCCESS] All Auth Security test suites passed cleanly.')
}

runAuthSecurityTests().catch((err) => {
  console.error('[FAIL] Auth Security test failed:', err)
  process.exit(1)
})
