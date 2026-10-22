import assert from 'node:assert'
import { compareResults, normalizeValue } from '../services/judgeService.js'
import type { QueryResult } from '../types/index.js'

console.log('Testing judgeService...')

// Test 1: Normalization
assert.strictEqual(normalizeValue(null), 'null:null')
assert.strictEqual(normalizeValue(undefined), 'null:null')
assert.strictEqual(normalizeValue(50), 'num:50')
assert.strictEqual(normalizeValue('50'), 'str:50')
assert.strictEqual(normalizeValue('007'), 'str:007')
assert.notStrictEqual(normalizeValue('007'), normalizeValue('7'))
assert.strictEqual(normalizeValue('Alice'), 'str:Alice')
assert.notStrictEqual(normalizeValue('Alice'), normalizeValue('alice'))
assert.strictEqual(normalizeValue(0.001), 'num:0.001')
assert.notStrictEqual(normalizeValue(0.001), normalizeValue(0.004))

// Test 2: Positional column alias test (alias shouldn't fail correct result)
const refRes: QueryResult = {
  columns: ['name', 'salary'],
  rows: [
    { name: 'Alice', salary: 75000 },
    { name: 'Bob', salary: 60000 },
  ],
  rawTuples: [
    ['Alice', 75000],
    ['Bob', 60000],
  ],
  rowCount: 2,
  duration: 10,
}

const studentResAliases: QueryResult = {
  columns: ['employee_name', 'current_pay'],
  rows: [
    { employee_name: 'Alice', current_pay: 75000 },
    { employee_name: 'Bob', current_pay: 60000 },
  ],
  rawTuples: [
    ['Alice', 75000],
    ['Bob', 60000],
  ],
  rowCount: 2,
  duration: 12,
}

const v1 = compareResults(studentResAliases, refRes, false)
assert.strictEqual(v1.correct, true, 'Positional matching should pass regardless of aliases')
assert.strictEqual(v1.reason, 'match')

// Test 3: Unordered multiset match (orderMatters: false)
const studentResUnordered: QueryResult = {
  columns: ['name', 'salary'],
  rows: [
    { name: 'Bob', salary: 60000 },
    { name: 'Alice', salary: 75000 },
  ],
  rawTuples: [
    ['Bob', 60000],
    ['Alice', 75000],
  ],
  rowCount: 2,
  duration: 12,
}

const v2 = compareResults(studentResUnordered, refRes, false)
assert.strictEqual(v2.correct, true, 'Unordered match should pass when orderMatters is false')

// Test 4: Order mismatch when orderMatters: true
const v3 = compareResults(studentResUnordered, refRes, true)
assert.strictEqual(v3.correct, false, 'Order mismatch should fail when orderMatters is true')
assert.strictEqual(v3.reason, 'order_mismatch')

// Test 5: Column count mismatch
const studentWrongCols: QueryResult = {
  columns: ['name'],
  rows: [{ name: 'Alice' }, { name: 'Bob' }],
  rawTuples: [['Alice'], ['Bob']],
  rowCount: 2,
  duration: 8,
}
const v4 = compareResults(studentWrongCols, refRes, false)
assert.strictEqual(v4.correct, false)
assert.strictEqual(v4.reason, 'column_count_mismatch')

// Test 6: Row count mismatch
const studentWrongRows: QueryResult = {
  columns: ['name', 'salary'],
  rows: [{ name: 'Alice', salary: 75000 }],
  rawTuples: [['Alice', 75000]],
  rowCount: 1,
  duration: 8,
}
const v5 = compareResults(studentWrongRows, refRes, false)
assert.strictEqual(v5.correct, false)
assert.strictEqual(v5.reason, 'row_count_mismatch')

// Test 7: Value mismatch
const studentWrongVals: QueryResult = {
  columns: ['name', 'salary'],
  rows: [
    { name: 'Alice', salary: 99999 },
    { name: 'Bob', salary: 60000 },
  ],
  rawTuples: [
    ['Alice', 99999],
    ['Bob', 60000],
  ],
  rowCount: 2,
  duration: 8,
}
const v6 = compareResults(studentWrongVals, refRes, false)
assert.strictEqual(v6.correct, false)
assert.strictEqual(v6.reason, 'values_mismatch')

// Test 8: Case sensitivity (Upper case != lower case)
const studentWrongCase: QueryResult = {
  columns: ['name', 'salary'],
  rows: [
    { name: 'ALICE', salary: 75000 },
    { name: 'BOB', salary: 60000 },
  ],
  rawTuples: [
    ['ALICE', 75000],
    ['BOB', 60000],
  ],
  rowCount: 2,
  duration: 8,
}
const v7 = compareResults(studentWrongCase, refRes, false)
assert.strictEqual(v7.correct, false, 'Different casing must fail judge check')
assert.strictEqual(v7.reason, 'values_mismatch')

// Test 9: Duplicate column names (e.g. SELECT a.id, b.id)
const refDuplicateCols: QueryResult = {
  columns: ['id', 'id'],
  rows: [{ id: 2 }],
  rawTuples: [[1, 2]],
  rowCount: 1,
  duration: 5,
}
const studentCorrectDup: QueryResult = {
  columns: ['user_id', 'order_id'],
  rows: [{ user_id: 1, order_id: 2 }],
  rawTuples: [[1, 2]],
  rowCount: 1,
  duration: 5,
}
const studentWrongDup: QueryResult = {
  columns: ['user_id', 'order_id'],
  rows: [{ user_id: 2, order_id: 2 }],
  rawTuples: [[2, 2]],
  rowCount: 1,
  duration: 5,
}
assert.strictEqual(compareResults(studentCorrectDup, refDuplicateCols, true).correct, true)
assert.strictEqual(compareResults(studentWrongDup, refDuplicateCols, true).correct, false)

console.log('[SUCCESS] judgeService test suite passed successfully.')
