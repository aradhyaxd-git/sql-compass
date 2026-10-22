import assert from 'node:assert'
import {
  acquireExecutionSlot,
  getActiveExecutionCount,
  clearAllExecutionSlots,
} from '../services/concurrencyGuard.js'

console.log('Testing concurrencyGuard...')

clearAllExecutionSlots()
assert.strictEqual(getActiveExecutionCount(), 0)

const userA1 = acquireExecutionSlot('user-a')
assert.strictEqual(userA1.allowed, true)
assert.strictEqual(getActiveExecutionCount(), 1)

const userA2 = acquireExecutionSlot('user-a')
assert.strictEqual(userA2.allowed, false)
assert.strictEqual(getActiveExecutionCount(), 1)

const userB1 = acquireExecutionSlot('user-b')
assert.strictEqual(userB1.allowed, true)
assert.strictEqual(getActiveExecutionCount(), 2)

userA1.release()
assert.strictEqual(getActiveExecutionCount(), 1)

const userA3 = acquireExecutionSlot('user-a')
assert.strictEqual(userA3.allowed, true)
assert.strictEqual(getActiveExecutionCount(), 2)

userA3.release()
userB1.release()
assert.strictEqual(getActiveExecutionCount(), 0)

console.log('[SUCCESS] concurrencyGuard test suite passed successfully.')
