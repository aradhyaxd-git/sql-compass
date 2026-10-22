import assert from 'node:assert'
import { requireAuth, optionalAuth } from '../middleware/auth.js'
import { sanitizeSQL } from '../services/sqlSanitizer.js'
import type { Request, Response, NextFunction } from 'express'

console.log('Testing security hardening regressions...')

async function runSecurityTests(): Promise<void> {
  // SC-01: Malformed percent-encoded cookie must not crash process or throw unhandled rejection
  const reqWithMalformedCookie = {
    headers: {
      cookie: '__session=%E0%A4%A',
    },
  } as unknown as Request

  let optionalAuthNextCalled = false
  await optionalAuth(reqWithMalformedCookie, {} as Response, () => {
    optionalAuthNextCalled = true
  })
  assert.strictEqual(optionalAuthNextCalled, true, 'optionalAuth should proceed when cookie is malformed')
  assert.strictEqual(reqWithMalformedCookie.userId, undefined, 'userId should be undefined for malformed cookie')

  let requireAuthStatus: number | null = null
  let requireAuthBody: { success?: boolean; message?: string } | null = null
  const fakeRes = {
    status(code: number) {
      requireAuthStatus = code
      return {
        json(body: Record<string, unknown>) {
          requireAuthBody = body
        },
      }
    },
  } as unknown as Response

  await requireAuth(reqWithMalformedCookie, fakeRes, (() => {}) as NextFunction)
  assert.strictEqual(requireAuthStatus, 401, 'requireAuth should reject with 401 on malformed cookie')
  assert.strictEqual((requireAuthBody as { success?: boolean } | null)?.success, false)

  // SC-12: UNION, UNION ALL, and VALUES must be permitted
  const unionRes = sanitizeSQL('SELECT 1 UNION SELECT 2')
  assert.strictEqual(unionRes.safe, true, 'SELECT 1 UNION SELECT 2 should be safe')
  assert.strictEqual(unionRes.category, 'read')

  const unionAllRes = sanitizeSQL('SELECT 1 UNION ALL SELECT 2')
  assert.strictEqual(unionAllRes.safe, true, 'SELECT 1 UNION ALL SELECT 2 should be safe')

  const valuesRes = sanitizeSQL('VALUES (1, 2), (3, 4)')
  assert.strictEqual(valuesRes.safe, true, 'VALUES should be safe')

  // Attack inside UNION must still be rejected
  const unionAttack = sanitizeSQL('SELECT 1 UNION SELECT pg_sleep(10)')
  assert.strictEqual(unionAttack.safe, false, 'UNION with pg_sleep must be blocked')

  // SC-13: System tables and sequence manipulation functions must be blocked
  const statActivityAttack = sanitizeSQL('SELECT * FROM pg_stat_activity')
  assert.strictEqual(statActivityAttack.safe, false, 'SELECT from pg_stat_activity must be blocked')
  assert.ok(statActivityAttack.reason?.includes('pg_stat_activity'))

  const nextvalAttack = sanitizeSQL("SELECT nextval('my_seq')")
  assert.strictEqual(nextvalAttack.safe, false, 'nextval must be blocked')

  const setvalAttack = sanitizeSQL("SELECT setval('my_seq', 1)")
  assert.strictEqual(setvalAttack.safe, false, 'setval must be blocked')

  console.log('[SUCCESS] securityHardening test suite passed successfully.')
}

runSecurityTests().catch((err) => {
  console.error('[FAILURE] securityHardening tests failed:', err)
  process.exit(1)
})
