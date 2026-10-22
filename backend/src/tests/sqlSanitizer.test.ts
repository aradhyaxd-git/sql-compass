import assert from 'node:assert'
import { sanitizeSQL } from '../services/sqlSanitizer.js'

const legitimateQueries = [
  'SELECT name, created_at FROM products',
  "SELECT * FROM employees WHERE name LIKE '%alter%'",
  '-- comment line\nSELECT id, name FROM categories',
  '/* multi line comment */ SELECT 1',
  'SELECT p.name, p.price, c.name FROM products p JOIN categories c ON p.category_id = c.id',
  'WITH cte AS (SELECT id, salary FROM employees) SELECT * FROM cte WHERE salary > 50000',
  'WITH RECURSIVE cnt(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM cnt WHERE x < 5) SELECT * FROM cnt',
  'SELECT department, COUNT(*), AVG(salary) FROM employees GROUP BY department HAVING AVG(salary) > 60000',
  "SELECT * FROM orders WHERE status IN ('pending', 'completed')",
  "SELECT name, CASE WHEN salary > 80000 THEN 'High' ELSE 'Low' END AS band FROM employees",
  'SELECT EXTRACT(YEAR FROM order_date) AS yr, SUM(total_amount) FROM orders GROUP BY 1',
  'SELECT DISTINCT city FROM customers',
  'SELECT * FROM employees WHERE manager_id IS NULL',
  'SELECT c.name, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) FROM customers c',
  'SELECT ROUND(AVG(salary), 2) FROM employees',
  'SELECT * FROM products ORDER BY price DESC LIMIT 10 OFFSET 5',
  'SELECT UPPER(name), LOWER(email) FROM customers',
  "SELECT * FROM sessions WHERE started_at >= '2026-01-01'::date",
  'SELECT name, salary FROM employees WHERE salary BETWEEN 40000 AND 60000',
  'SELECT e.name, d.budget FROM departments d JOIN employees e ON d.name = e.department',
  'SELECT COALESCE(ended_at, started_at) FROM sessions',
  'SELECT * FROM products WHERE stock_quantity < 10',
  'SELECT c.title, c.instructor FROM courses c LEFT JOIN enrollments e ON c.id = e.course_id WHERE e.id IS NULL',
  'SELECT s.name, s.gpa FROM students s WHERE s.gpa > (SELECT AVG(gpa) FROM students)',
  'SELECT device, COUNT(*) FROM sessions GROUP BY device ORDER BY count DESC',
  'SELECT event_type, occurred_at FROM events ORDER BY occurred_at DESC LIMIT 20',
  'SELECT c.name, SUM(o.total_amount) FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.id, c.name',
  'SELECT * FROM categories ORDER BY name ASC',
  "SELECT 1 AS num, 'test' AS str, true AS bool",
  'SELECT name, hire_date FROM employees WHERE hire_date <= CURRENT_DATE',
  'SELECT id, name FROM products WHERE price > 100 ORDER BY price ASC',
  'SELECT 1 AS col UNION SELECT 2 AS col',
  'SELECT 1 AS col UNION ALL SELECT 2 AS col',
  "VALUES (1, 'alpha'), (2, 'beta')",
]

const attackStrings = [
  'DROP TABLE employees;',
  'DELETE FROM customers;',
  'UPDATE employees SET salary = 999999;',
  "INSERT INTO products (name) VALUES ('Hacked');",
  'ALTER TABLE users ADD COLUMN password text;',
  'TRUNCATE TABLE orders;',
  'GRANT ALL PRIVILEGES ON DATABASE postgres TO public;',
  'REVOKE ALL ON employees FROM student;',
  'SELECT 1; DROP TABLE users;',
  'SELECT 1; SELECT 2;',
  'SELECT pg_sleep(10)',
  'SELECT (SELECT pg_sleep(5))',
  'SELECT pg_sleep_for(interval \'10 seconds\')',
  'SELECT pg_sleep_until(now() + interval \'10 seconds\')',
  "SELECT set_config('session_preload_libraries', 'malicious', false)",
  "SELECT pg_read_file('/etc/passwd')",
  "SELECT pg_write_file('shell.php', '<?php ?>')",
  "SELECT pg_ls_dir('/tmp')",
  'CREATE TABLE evil (id int);',
  'SELECT pg_terminate_backend(1234)',
  'SELECT pg_cancel_backend(1234)',
  "SELECT lo_import('/etc/passwd')",
  'WITH x AS (SELECT 1) DELETE FROM employees',
  'WITH d AS (DELETE FROM employees RETURNING *) SELECT * FROM d',
  "SELECT query_to_xml_and_xmlschema('SELECT 1')",
  'SELECT pg_advisory_lock(1)',
  'SELECT pg_advisory_xact_lock(1)',
]

console.log('Testing SQL Sanitizer...')

let passedLegit = 0
for (const [i, q] of legitimateQueries.entries()) {
  const res = sanitizeSQL(q)
  if (!res.safe) {
    console.error(`FAIL: Legitimate query #${i + 1} blocked: ${q}\nReason: ${res.reason}`)
  } else {
    passedLegit++
  }
}
console.log(`Legitimate queries passed: ${passedLegit}/${legitimateQueries.length}`)
assert.strictEqual(passedLegit, legitimateQueries.length, `All ${legitimateQueries.length} legitimate queries must pass`)

let blockedAttacks = 0
for (const [i, a] of attackStrings.entries()) {
  const res = sanitizeSQL(a)
  if (res.safe) {
    console.error(`FAIL: Attack string #${i + 1} allowed: ${a}`)
  } else {
    blockedAttacks++
  }
}
console.log(`Attack strings blocked: ${blockedAttacks}/${attackStrings.length}`)
assert.strictEqual(blockedAttacks, attackStrings.length, `All ${attackStrings.length} attack strings must be blocked`)

console.log('[SUCCESS] Sanitizer test suite passed successfully.')
