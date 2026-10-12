import assert from 'node:assert'
import { hintCache } from '../services/hintCacheService.js'

console.log('Testing hintCacheService...')

hintCache.clear()

// Test 1: Cache Miss
const miss = hintCache.get('assign1', 'SELECT * FROM employees', 1)
assert.strictEqual(miss, null)

// Test 2: Cache Set and Hit
hintCache.set('assign1', 'SELECT * FROM employees', 1, {
  hint: 'Check your department column.',
  errorClass: 'wrong_columns',
  concept: 'Projection',
})

const hit = hintCache.get('assign1', 'SELECT * FROM employees', 1)
assert.notStrictEqual(hit, null)
assert.strictEqual(hit?.hint, 'Check your department column.')
assert.strictEqual(hit?.level, 1)

// Test 3: Whitespace normalization generates identical key
const hitNormalized = hintCache.get('assign1', '  select   *   from   employees  ', 1)
assert.notStrictEqual(hitNormalized, null)
assert.strictEqual(hitNormalized?.hint, 'Check your department column.')

// Test 4: Different level gives miss
const levelMiss = hintCache.get('assign1', 'SELECT * FROM employees', 2)
assert.strictEqual(levelMiss, null)

const stats = hintCache.getStats()
assert.strictEqual(stats.hits, 2)
assert.strictEqual(stats.misses, 2)

console.log('[SUCCESS] hintCacheService test suite passed successfully.')
