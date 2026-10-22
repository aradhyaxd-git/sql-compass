import assert from 'node:assert'
import { SlidingWindowMemoryStore } from '../utils/slidingWindowStore.js'
import rateLimit from 'express-rate-limit'

async function runTests() {
  console.log('Testing Sliding Window Rate Limiter Store...')

  // Test 1: SlidingWindowMemoryStore increments and computes resetTime
  const store = new SlidingWindowMemoryStore(1000) // 1 second window
  const key = 'user_test_1'

  const res1 = await store.increment(key)
  assert.strictEqual(res1.totalHits, 1, 'First hit should equal 1')
  assert.ok(res1.resetTime instanceof Date, 'resetTime must be a valid Date')

  const res2 = await store.increment(key)
  assert.strictEqual(res2.totalHits, 2, 'Second hit should equal 2')

  const clientInfo = await store.get(key)
  assert.strictEqual(clientInfo?.totalHits, 2, 'get() should return 2 totalHits')

  // Test 2: Decrement works
  await store.decrement(key)
  const clientInfoAfterDec = await store.get(key)
  assert.strictEqual(clientInfoAfterDec?.totalHits, 1, 'Decrement should reduce totalHits to 1')

  // Test 3: Sliding window pruning
  // Wait for 1100ms so the 1-second window expires
  await new Promise((resolve) => setTimeout(resolve, 1100))

  const clientInfoExpired = await store.get(key)
  assert.strictEqual(clientInfoExpired, undefined, 'Expired hits should be pruned by sliding window')

  const resAfterExpiry = await store.increment(key)
  assert.strictEqual(resAfterExpiry.totalHits, 1, 'Hit after window expiry should reset counter to 1')

  // Test 4: Reset key
  await store.resetKey(key)
  const clientInfoReset = await store.get(key)
  assert.strictEqual(clientInfoReset, undefined, 'resetKey should remove the key')

  store.shutdown()
  console.log('SlidingWindowMemoryStore unit tests passed.')

  // Test 5: In-process express-rate-limit integration
  const testWindowMs = 2000
  const integrationStore = new SlidingWindowMemoryStore(testWindowMs)
  const limiter = rateLimit({
    windowMs: testWindowMs,
    max: 2,
    store: integrationStore,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests' },
    validate: { xForwardedForHeader: false, trustProxy: false },
  })

  const createMockReqRes = () => {
    const req: any = { ip: '127.0.0.1', headers: {} }
    let statusCode = 200
    let body: any = null
    const res: any = {
      statusCode,
      setHeader: () => {},
      getHeader: () => undefined,
      status(code: number) {
        this.statusCode = code
        return this
      },
      send(data: any) {
        this.body = data
        return this
      },
      json(data: any) {
        this.body = data
        return this
      },
    }
    return { req, res }
  }

  // Request 1: Should pass
  const r1 = createMockReqRes()
  let next1 = false
  await new Promise<void>((resolve) => {
    limiter(r1.req, r1.res, () => {
      next1 = true
      resolve()
    })
  })
  assert.strictEqual(next1, true, 'Request 1 should call next()')

  // Request 2: Should pass
  const r2 = createMockReqRes()
  let next2 = false
  await new Promise<void>((resolve) => {
    limiter(r2.req, r2.res, () => {
      next2 = true
      resolve()
    })
  })
  assert.strictEqual(next2, true, 'Request 2 should call next()')

  // Request 3: Should be blocked by rate limiter (429)
  const r3 = createMockReqRes()
  let next3 = false
  await new Promise<void>((resolve) => {
    // If blocked, express-rate-limit calls res.status().send() instead of next()
    const origSend = r3.res.send.bind(r3.res)
    r3.res.send = (data: any) => {
      origSend(data)
      resolve()
    }
    limiter(r3.req, r3.res, () => {
      next3 = true
      resolve()
    })
  })
  assert.strictEqual(next3, false, 'Request 3 should not call next()')
  assert.strictEqual(r3.res.statusCode, 429, 'Request 3 should return HTTP 429')

  integrationStore.shutdown()
  console.log('express-rate-limit sliding window integration test passed.')

  console.log('[SUCCESS] All Sliding Window Rate Limiter tests passed cleanly.')
}

runTests().catch((err) => {
  console.error('Rate limiter test failed:', err)
  process.exit(1)
})
