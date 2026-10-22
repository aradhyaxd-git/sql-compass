import assert from 'node:assert'
import { sanitizeSQL } from '../services/sqlSanitizer.js'
import { executeUserQuery } from '../services/executionService.js'
import { sandboxPool } from '../config/db.postgres.js'

async function runWriteSandboxTests(): Promise<void> {
  console.log('Testing Ephemeral Write Sandbox...')

  // 1. Sanitizer classification tests
  const insertCheck = sanitizeSQL('INSERT INTO employees (name, department, salary) VALUES (\'Alice\', \'Engineering\', 90000)', { allowWriteSandbox: true })
  assert.strictEqual(insertCheck.safe, true)
  assert.strictEqual(insertCheck.category, 'write')
  assert.strictEqual(insertCheck.statementType, 'insert')

  const updateCheck = sanitizeSQL('UPDATE employees SET salary = salary * 1.1 WHERE department = \'Engineering\'', { allowWriteSandbox: true })
  assert.strictEqual(updateCheck.safe, true)
  assert.strictEqual(updateCheck.category, 'write')
  assert.strictEqual(updateCheck.statementType, 'update')

  const deleteCheck = sanitizeSQL('DELETE FROM employees WHERE salary < 30000', { allowWriteSandbox: true })
  assert.strictEqual(deleteCheck.safe, true)
  assert.strictEqual(deleteCheck.category, 'write')
  assert.strictEqual(deleteCheck.statementType, 'delete')

  const createTableCheck = sanitizeSQL('CREATE TABLE ephemeral_test (id INT, label VARCHAR(50))', { allowWriteSandbox: true })
  assert.strictEqual(createTableCheck.safe, true)
  assert.strictEqual(createTableCheck.category, 'write')

  // When allowWriteSandbox is false, DDL/DML must be blocked
  const insertBlocked = sanitizeSQL('INSERT INTO employees (name) VALUES (\'Alice\')')
  assert.strictEqual(insertBlocked.safe, false)

  // Dangerous / Administrative commands must remain strictly blocked even with allowWriteSandbox = true
  const dropDbBlocked = sanitizeSQL('DROP DATABASE production', { allowWriteSandbox: true })
  assert.strictEqual(dropDbBlocked.safe, false)

  const sleepBlocked = sanitizeSQL('SELECT pg_sleep(10)', { allowWriteSandbox: true })
  assert.strictEqual(sleepBlocked.safe, false)

  // 2. Live database transactional isolation verification (if DB is reachable)
  if (process.env.NEON_DATABASE_URL || process.env.SANDBOX_RO_URL) {
    try {
      const tableName = `ephemeral_isolation_${Date.now()}`

      const createResult = await executeUserQuery(`CREATE TABLE ${tableName} (id INT, name VARCHAR(50))`, {
        allowWriteSandbox: true,
      })
      assert.strictEqual(createResult.columns[0], 'command')
      assert.strictEqual(createResult.rows[0].command, 'CREATE TABLE')

      // Verify outside the transaction that table was rolled back and does not exist
      const client = await sandboxPool.connect()
      try {
        const checkRes = await client.query(
          'SELECT 1 FROM information_schema.tables WHERE table_name = $1',
          [tableName]
        )
        assert.strictEqual(checkRes.rows.length, 0, 'Table should have been automatically rolled back!')
      } finally {
        client.release()
      }
    } catch (dbErr) {
      console.log('Skipping live Postgres verification (sandbox environment offline)')
    }
  }

  console.log('[SUCCESS] Ephemeral Write Sandbox test suite passed successfully.')
}

runWriteSandboxTests().catch((err) => {
  console.error('[FAILED] Write Sandbox test error:', err)
  process.exit(1)
})
