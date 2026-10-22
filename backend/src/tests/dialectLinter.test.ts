import assert from 'node:assert'
import { checkDialectCompatibility } from '../services/dialectLinter.js'

console.log('Testing dialectLinter...')

const cleanPostgres = 'SELECT id, COALESCE(name, "Unknown") FROM employees LIMIT 10 OFFSET 5'
assert.strictEqual(checkDialectCompatibility(cleanPostgres).hasDialectIssue, false)

const mySqlIfNull = 'SELECT id, IFNULL(name, "Unknown") FROM employees'
const d1 = checkDialectCompatibility(mySqlIfNull)
assert.strictEqual(d1.hasDialectIssue, true)
assert.ok(d1.hints.some((h) => h.includes('COALESCE')))

const mySqlLimit = 'SELECT * FROM employees LIMIT 5, 10'
const d2 = checkDialectCompatibility(mySqlLimit)
assert.strictEqual(d2.hasDialectIssue, true)
assert.ok(d2.hints.some((h) => h.includes('OFFSET')))

const mySqlBackticks = 'SELECT `name` FROM `employees`'
const d3 = checkDialectCompatibility(mySqlBackticks)
assert.strictEqual(d3.hasDialectIssue, true)
assert.ok(d3.hints.some((h) => h.includes('Backticks')))

console.log('[SUCCESS] dialectLinter test suite passed successfully.')
