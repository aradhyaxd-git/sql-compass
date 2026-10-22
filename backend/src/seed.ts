import './env.js'

import mongoose from 'mongoose'
import Assignment from './models/Assignment.js'
import { sandboxPool } from './config/db.postgres.js'
import { logger } from './utils/logger.js'

const SCHEMAS = {
  employees: `TABLE: EMPLOYEES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
id (SERIAL PRIMARY KEY)
name (VARCHAR 100)
department (VARCHAR 100)
salary (INT)
hire_date (DATE)
manager_id (INT, nullable)`,

  customers_orders: `TABLE: CUSTOMERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
id (SERIAL PRIMARY KEY)
name (VARCHAR 100)
email (VARCHAR 150)
city (VARCHAR 100)
joined_date (DATE)

TABLE: ORDERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
id (SERIAL PRIMARY KEY)
customer_id (INT → customers.id)
total_amount (NUMERIC 10,2)
status (VARCHAR 50)
order_date (DATE)`,

  products_categories: `TABLE: CATEGORIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
id (SERIAL PRIMARY KEY)
name (VARCHAR 100)

TABLE: PRODUCTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
id (SERIAL PRIMARY KEY)
name (VARCHAR 150)
category_id (INT → categories.id)
price (NUMERIC 10,2)
stock_quantity (INT)
created_at (DATE)`,

  students_courses: `TABLE: STUDENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
id (SERIAL PRIMARY KEY)
name (VARCHAR 100)
email (VARCHAR 150)
enrollment_year (INT)
gpa (NUMERIC 3,2)

TABLE: COURSES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
id (SERIAL PRIMARY KEY)
title (VARCHAR 150)
instructor (VARCHAR 100)
credits (INT)
department (VARCHAR 100)

TABLE: ENROLLMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
id (SERIAL PRIMARY KEY)
student_id (INT → students.id)
course_id (INT → courses.id)
grade (VARCHAR 2)
enrolled_at (DATE)`,

  departments: `TABLE: EMPLOYEES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
id (SERIAL PRIMARY KEY)
name (VARCHAR 100)
department (VARCHAR 100)
salary (INT)
hire_date (DATE)
manager_id (INT, nullable)

TABLE: DEPARTMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
id (SERIAL PRIMARY KEY)
name (VARCHAR 100)
budget (NUMERIC 12,2)
head_id (INT → employees.id)`,

  sessions_events: `TABLE: SESSIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
id (SERIAL PRIMARY KEY)
user_id (INT)
started_at (TIMESTAMP)
ended_at (TIMESTAMP, nullable)
device (VARCHAR 50)

TABLE: EVENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
id (SERIAL PRIMARY KEY)
session_id (INT → sessions.id)
event_type (VARCHAR 100)
occurred_at (TIMESTAMP)`,
}

export const sampleAssignments = [
  // GROUP 1: employees (8)
  {
    title: 'List All Employees',
    difficulty: 'easy' as const,
    description: 'Retrieve the name, department, and salary of all employees. Order the results alphabetically by name.',
    tags: ['SELECT', 'ORDER BY'],
    tableNames: ['employees'],
    schemaDetails: SCHEMAS.employees,
    referenceSql: 'SELECT name, department, salary FROM employees ORDER BY name ASC',
    orderMatters: true,
  },
  {
    title: 'Find High Earners',
    difficulty: 'easy' as const,
    description: 'Retrieve the names and salaries of all employees who earn more than 70,000. Order by salary descending.',
    tags: ['SELECT', 'WHERE', 'ORDER BY'],
    tableNames: ['employees'],
    schemaDetails: SCHEMAS.employees,
    referenceSql: 'SELECT name, salary FROM employees WHERE salary > 70000 ORDER BY salary DESC',
    orderMatters: true,
  },
  {
    title: 'Department Headcount',
    difficulty: 'easy' as const,
    description: 'Count the number of employees in each department. Return department name and count, ordered by count descending.',
    tags: ['GROUP BY', 'COUNT', 'ORDER BY'],
    tableNames: ['employees'],
    schemaDetails: SCHEMAS.employees,
    referenceSql: 'SELECT department, COUNT(*) AS count FROM employees GROUP BY department ORDER BY count DESC',
    orderMatters: true,
  },
  {
    title: 'Average Salary by Department',
    difficulty: 'medium' as const,
    description: 'Find departments where the average salary exceeds 65,000. Return department name and average salary rounded to 2 decimal places.',
    tags: ['GROUP BY', 'HAVING', 'AVG', 'ROUND'],
    tableNames: ['employees'],
    schemaDetails: SCHEMAS.employees,
    referenceSql: 'SELECT department, ROUND(AVG(salary), 2) AS average_salary FROM employees GROUP BY department HAVING AVG(salary) > 65000',
    orderMatters: false,
  },
  {
    title: 'Most Recent Hires',
    difficulty: 'easy' as const,
    description: 'Find the 5 most recently hired employees. Return their name, department, and hire date.',
    tags: ['ORDER BY', 'LIMIT'],
    tableNames: ['employees'],
    schemaDetails: SCHEMAS.employees,
    referenceSql: 'SELECT name, department, hire_date FROM employees ORDER BY hire_date DESC LIMIT 5',
    orderMatters: true,
  },
  {
    title: 'Second Highest Salary',
    difficulty: 'hard' as const,
    description: 'Find the second highest salary from the employees table without using LIMIT/OFFSET. If no second exists, return null.',
    tags: ['Subquery', 'MAX', 'DISTINCT'],
    tableNames: ['employees'],
    schemaDetails: SCHEMAS.employees,
    referenceSql: 'SELECT MAX(salary) AS second_highest_salary FROM employees WHERE salary < (SELECT MAX(salary) FROM employees)',
    orderMatters: false,
  },
  {
    title: 'Employees Without Managers',
    difficulty: 'easy' as const,
    description: 'Find all employees who do not have a manager assigned (manager_id is NULL). Return their name and department.',
    tags: ['WHERE', 'IS NULL'],
    tableNames: ['employees'],
    schemaDetails: SCHEMAS.employees,
    referenceSql: 'SELECT name, department FROM employees WHERE manager_id IS NULL',
    orderMatters: false,
  },
  {
    title: 'Salary Band Classification',
    difficulty: 'medium' as const,
    description: 'Categorize employees into salary bands: Low (under 50k), Mid (50k-80k), High (above 80k). Return employee name, salary, and their band.',
    tags: ['CASE WHEN', 'SELECT'],
    tableNames: ['employees'],
    schemaDetails: SCHEMAS.employees,
    referenceSql: "SELECT name, salary, CASE WHEN salary < 50000 THEN 'Low' WHEN salary BETWEEN 50000 AND 80000 THEN 'Mid' ELSE 'High' END AS salary_band FROM employees",
    orderMatters: false,
  },

  // GROUP 2: customers + orders (6)
  {
    title: 'Top Customers by Revenue',
    difficulty: 'medium' as const,
    description: 'Find the top 5 customers by total order value. Return customer name and total spend, ordered by spend descending.',
    tags: ['JOIN', 'GROUP BY', 'SUM', 'LIMIT'],
    tableNames: ['customers', 'orders'],
    schemaDetails: SCHEMAS.customers_orders,
    referenceSql: 'SELECT c.name, SUM(o.total_amount) AS total_spend FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.id, c.name ORDER BY total_spend DESC LIMIT 5',
    orderMatters: true,
  },
  {
    title: 'Customers With No Orders',
    difficulty: 'medium' as const,
    description: 'Find all customers who have never placed an order. Return their name and email.',
    tags: ['LEFT JOIN', 'IS NULL'],
    tableNames: ['customers', 'orders'],
    schemaDetails: SCHEMAS.customers_orders,
    referenceSql: 'SELECT c.name, c.email FROM customers c LEFT JOIN orders o ON c.id = o.customer_id WHERE o.id IS NULL',
    orderMatters: false,
  },
  {
    title: 'Orders by Status',
    difficulty: 'easy' as const,
    description: 'Count the number of orders grouped by status. Order by count descending.',
    tags: ['GROUP BY', 'COUNT', 'ORDER BY'],
    tableNames: ['orders'],
    schemaDetails: SCHEMAS.customers_orders,
    referenceSql: 'SELECT status, COUNT(*) AS count FROM orders GROUP BY status ORDER BY count DESC',
    orderMatters: true,
  },
  {
    title: 'Monthly Revenue Trend',
    difficulty: 'hard' as const,
    description: 'Calculate total revenue for each month. Return year, month number, and total revenue ordered chronologically. Only include completed orders.',
    tags: ['EXTRACT', 'GROUP BY', 'SUM', 'WHERE'],
    tableNames: ['orders'],
    schemaDetails: SCHEMAS.customers_orders,
    referenceSql: "SELECT EXTRACT(YEAR FROM order_date) AS order_year, EXTRACT(MONTH FROM order_date) AS order_month, SUM(total_amount) AS total_revenue FROM orders WHERE status = 'completed' GROUP BY EXTRACT(YEAR FROM order_date), EXTRACT(MONTH FROM order_date) ORDER BY order_year ASC, order_month ASC",
    orderMatters: true,
  },
  {
    title: 'Average Order Value per City',
    difficulty: 'medium' as const,
    description: 'Find the average order value grouped by customer city. Only include cities with more than 2 orders. Return city and average value rounded to 2 decimal places.',
    tags: ['JOIN', 'GROUP BY', 'HAVING', 'AVG'],
    tableNames: ['customers', 'orders'],
    schemaDetails: SCHEMAS.customers_orders,
    referenceSql: 'SELECT c.city, ROUND(AVG(o.total_amount), 2) AS average_order_value FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.city HAVING COUNT(o.id) > 2',
    orderMatters: false,
  },
  {
    title: 'First Order per Customer',
    difficulty: 'hard' as const,
    description: 'For each customer, find the date of their very first order. Return customer name and first order date.',
    tags: ['JOIN', 'GROUP BY', 'MIN'],
    tableNames: ['customers', 'orders'],
    schemaDetails: SCHEMAS.customers_orders,
    referenceSql: 'SELECT c.name, MIN(o.order_date) AS first_order_date FROM customers c JOIN orders o ON c.id = o.customer_id GROUP BY c.id, c.name',
    orderMatters: false,
  },

  // GROUP 3: products + categories (5)
  {
    title: 'Products by Category',
    difficulty: 'easy' as const,
    description: 'List all products with their category name. Return product name, price, and category. Order by category then product name.',
    tags: ['JOIN', 'ORDER BY'],
    tableNames: ['products', 'categories'],
    schemaDetails: SCHEMAS.products_categories,
    referenceSql: 'SELECT p.name, p.price, c.name AS category FROM products p JOIN categories c ON p.category_id = c.id ORDER BY category ASC, p.name ASC',
    orderMatters: true,
  },
  {
    title: 'Low Stock Alert',
    difficulty: 'easy' as const,
    description: 'Find all products where stock quantity is below 10. Return product name, category name, and current stock. Order by stock ascending.',
    tags: ['JOIN', 'WHERE', 'ORDER BY'],
    tableNames: ['products', 'categories'],
    schemaDetails: SCHEMAS.products_categories,
    referenceSql: 'SELECT p.name, c.name AS category, p.stock_quantity FROM products p JOIN categories c ON p.category_id = c.id WHERE p.stock_quantity < 10 ORDER BY p.stock_quantity ASC',
    orderMatters: true,
  },
  {
    title: 'Most Expensive per Category',
    difficulty: 'hard' as const,
    description: 'For each category, find the single most expensive product. Return category name, product name, and price.',
    tags: ['JOIN', 'Subquery', 'MAX'],
    tableNames: ['products', 'categories'],
    schemaDetails: SCHEMAS.products_categories,
    referenceSql: 'SELECT c.name AS category, p.name AS product, p.price FROM products p JOIN categories c ON p.category_id = c.id WHERE (p.category_id, p.price) IN (SELECT category_id, MAX(price) FROM products GROUP BY category_id)',
    orderMatters: false,
  },
  {
    title: 'Category Inventory Value',
    difficulty: 'medium' as const,
    description: 'Calculate total inventory value (price × stock_quantity) for each category. Return category name and total value, ordered by value descending.',
    tags: ['JOIN', 'GROUP BY', 'SUM'],
    tableNames: ['products', 'categories'],
    schemaDetails: SCHEMAS.products_categories,
    referenceSql: 'SELECT c.name AS category, SUM(p.price * p.stock_quantity) AS total_value FROM categories c JOIN products p ON c.id = p.category_id GROUP BY c.id, c.name ORDER BY total_value DESC',
    orderMatters: true,
  },
  {
    title: 'Products Added in 2024',
    difficulty: 'medium' as const,
    description: 'Find all products added in the year 2024. Return product name, category, price, and the date added.',
    tags: ['WHERE', 'EXTRACT', 'JOIN'],
    tableNames: ['products', 'categories'],
    schemaDetails: SCHEMAS.products_categories,
    referenceSql: 'SELECT p.name, c.name AS category, p.price, p.created_at FROM products p JOIN categories c ON p.category_id = c.id WHERE EXTRACT(YEAR FROM p.created_at) = 2024',
    orderMatters: false,
  },

  // GROUP 4: students + courses + enrollments (6)
  {
    title: 'Student Enrollment Count',
    difficulty: 'easy' as const,
    description: 'Count how many courses each student is enrolled in. Return student name and enrollment count, ordered by count descending.',
    tags: ['JOIN', 'GROUP BY', 'COUNT'],
    tableNames: ['students', 'enrollments'],
    schemaDetails: SCHEMAS.students_courses,
    referenceSql: 'SELECT s.name, COUNT(e.course_id) AS enrollment_count FROM students s JOIN enrollments e ON s.id = e.student_id GROUP BY s.id, s.name ORDER BY enrollment_count DESC',
    orderMatters: true,
  },
  {
    title: 'Course Popularity',
    difficulty: 'easy' as const,
    description: 'Find the number of students enrolled in each course. Return course title and student count, ordered by count descending.',
    tags: ['JOIN', 'GROUP BY', 'COUNT'],
    tableNames: ['courses', 'enrollments'],
    schemaDetails: SCHEMAS.students_courses,
    referenceSql: 'SELECT c.title, COUNT(e.student_id) AS student_count FROM courses c JOIN enrollments e ON c.id = e.course_id GROUP BY c.id, c.title ORDER BY student_count DESC',
    orderMatters: true,
  },
  {
    title: 'Students With Grade A',
    difficulty: 'medium' as const,
    description: 'Find all students who received an A grade in at least one course. Return student name, course title, and grade. No duplicates.',
    tags: ['JOIN', 'WHERE', 'DISTINCT'],
    tableNames: ['students', 'courses', 'enrollments'],
    schemaDetails: SCHEMAS.students_courses,
    referenceSql: "SELECT DISTINCT s.name, c.title, e.grade FROM students s JOIN enrollments e ON s.id = e.student_id JOIN courses c ON e.course_id = c.id WHERE e.grade = 'A'",
    orderMatters: false,
  },
  {
    title: 'GPA Above Average',
    difficulty: 'medium' as const,
    description: 'Find all students whose GPA is above the class average. Return their name, enrollment year, and GPA.',
    tags: ['WHERE', 'Subquery', 'AVG'],
    tableNames: ['students'],
    schemaDetails: SCHEMAS.students_courses,
    referenceSql: 'SELECT name, enrollment_year, gpa FROM students WHERE gpa > (SELECT AVG(gpa) FROM students)',
    orderMatters: false,
  },
  {
    title: 'Courses Never Enrolled',
    difficulty: 'medium' as const,
    description: 'Find all courses that have zero students enrolled. Return course title and instructor.',
    tags: ['LEFT JOIN', 'IS NULL'],
    tableNames: ['courses', 'enrollments'],
    schemaDetails: SCHEMAS.students_courses,
    referenceSql: 'SELECT c.title, c.instructor FROM courses c LEFT JOIN enrollments e ON c.id = e.course_id WHERE e.id IS NULL',
    orderMatters: false,
  },
  {
    title: 'Top Student per Department',
    difficulty: 'hard' as const,
    description: 'Find the student with the highest GPA in each course department. Return department, student name, and GPA.',
    tags: ['JOIN', 'GROUP BY', 'MAX', 'Subquery'],
    tableNames: ['students', 'courses', 'enrollments'],
    schemaDetails: SCHEMAS.students_courses,
    referenceSql: 'SELECT c.department, s.name, s.gpa FROM students s JOIN enrollments e ON s.id = e.student_id JOIN courses c ON e.course_id = c.id WHERE (c.department, s.gpa) IN (SELECT c2.department, MAX(s2.gpa) FROM students s2 JOIN enrollments e2 ON s2.id = e2.student_id JOIN courses c2 ON e2.course_id = c2.id GROUP BY c2.department)',
    orderMatters: false,
  },

  // GROUP 5: departments (3)
  {
    title: 'Department Budget vs Payroll',
    difficulty: 'hard' as const,
    description: 'For each department, compare the budget to total employee payroll. Return department name, budget, total payroll, and the difference.',
    tags: ['JOIN', 'GROUP BY', 'SUM'],
    tableNames: ['employees', 'departments'],
    schemaDetails: SCHEMAS.departments,
    referenceSql: 'SELECT d.name, d.budget, SUM(e.salary) AS total_payroll, (d.budget - SUM(e.salary)) AS difference FROM departments d JOIN employees e ON d.name = e.department GROUP BY d.id, d.name, d.budget',
    orderMatters: false,
  },
  {
    title: 'Manager Headcount',
    difficulty: 'medium' as const,
    description: 'Find all employees who manage at least one other person. Return their name and the number of direct reports, ordered by headcount descending.',
    tags: ['Self JOIN', 'GROUP BY', 'COUNT'],
    tableNames: ['employees'],
    schemaDetails: SCHEMAS.departments,
    referenceSql: 'SELECT m.name, COUNT(e.id) AS direct_reports FROM employees m JOIN employees e ON m.id = e.manager_id GROUP BY m.id, m.name ORDER BY direct_reports DESC',
    orderMatters: true,
  },
  {
    title: 'Underpaid vs Department Average',
    difficulty: 'hard' as const,
    description: 'Find employees who earn less than the average salary of their own department. Return employee name, their salary, and the department average.',
    tags: ['Correlated Subquery', 'AVG', 'WHERE'],
    tableNames: ['employees'],
    schemaDetails: SCHEMAS.departments,
    referenceSql: 'SELECT e.name, e.salary, dept_avg.avg_salary AS department_average FROM employees e JOIN (SELECT department, AVG(salary) AS avg_salary FROM employees GROUP BY department) dept_avg ON e.department = dept_avg.department WHERE e.salary < dept_avg.avg_salary',
    orderMatters: false,
  },

  // GROUP 6: sessions + events (3)
  {
    title: 'Average Session Duration',
    difficulty: 'medium' as const,
    description: 'Calculate the average session duration in minutes for each device type. Return device type and average duration rounded to 1 decimal place.',
    tags: ['GROUP BY', 'AVG', 'EXTRACT', 'EPOCH'],
    tableNames: ['sessions'],
    schemaDetails: SCHEMAS.sessions_events,
    referenceSql: 'SELECT device, ROUND(AVG(EXTRACT(EPOCH FROM (ended_at - started_at)) / 60)::numeric, 1) AS avg_duration_minutes FROM sessions WHERE ended_at IS NOT NULL GROUP BY device',
    orderMatters: false,
  },
  {
    title: 'Most Common Event Types',
    difficulty: 'easy' as const,
    description: 'Find the top 5 most frequently occurring event types. Return event type and count, ordered by count descending.',
    tags: ['GROUP BY', 'COUNT', 'ORDER BY', 'LIMIT'],
    tableNames: ['events'],
    schemaDetails: SCHEMAS.sessions_events,
    referenceSql: 'SELECT event_type, COUNT(*) AS count FROM events GROUP BY event_type ORDER BY count DESC LIMIT 5',
    orderMatters: true,
  },
  {
    title: 'Users With Most Sessions',
    difficulty: 'medium' as const,
    description: 'Find the top 10 users by total number of sessions. Return user_id and session count, ordered by count descending.',
    tags: ['GROUP BY', 'COUNT', 'ORDER BY', 'LIMIT'],
    tableNames: ['sessions'],
    schemaDetails: SCHEMAS.sessions_events,
    referenceSql: 'SELECT user_id, COUNT(*) AS session_count FROM sessions GROUP BY user_id ORDER BY session_count DESC LIMIT 10',
    orderMatters: true,
  },

  // GROUP 7: interview classics & dml sandbox (8)
  {
    title: 'Employees Earning More Than Their Managers',
    difficulty: 'easy' as const,
    description: 'Find employees who earn more than their managers. Return the employee name under the alias Employee.',
    tags: ['JOIN', 'SELF JOIN', 'WHERE'],
    tableNames: ['employees'],
    schemaDetails: SCHEMAS.employees,
    referenceSql: 'SELECT e1.name AS "Employee" FROM employees e1 JOIN employees e2 ON e1.manager_id = e2.id WHERE e1.salary > e2.salary',
    orderMatters: false,
  },
  {
    title: 'Department Top Three Salaries',
    difficulty: 'hard' as const,
    description: 'Find employees who earn top 3 unique salaries in each department. Return department name, employee name, and salary.',
    tags: ['DENSE_RANK', 'WINDOW FUNCTION', 'JOIN', 'CTE'],
    tableNames: ['employees', 'departments'],
    schemaDetails: SCHEMAS.departments,
    referenceSql: 'WITH ranked AS (SELECT d.name AS department, e.name AS employee, e.salary, DENSE_RANK() OVER (PARTITION BY e.department ORDER BY e.salary DESC) AS rnk FROM employees e JOIN departments d ON e.department = d.name) SELECT department, employee, salary FROM ranked WHERE rnk <= 3',
    orderMatters: false,
  },
  {
    title: 'Rank Salaries Without Gaps',
    difficulty: 'medium' as const,
    description: 'Rank unique employee salaries in descending order without gaps in ranking numbers. Return salary and its dense rank.',
    tags: ['DENSE_RANK', 'WINDOW FUNCTION', 'ORDER BY'],
    tableNames: ['employees'],
    schemaDetails: SCHEMAS.employees,
    referenceSql: 'SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rank FROM employees ORDER BY salary DESC',
    orderMatters: true,
  },
  {
    title: 'Managers with Multiple Direct Reports',
    difficulty: 'medium' as const,
    description: 'Find managers who directly supervise at least two employees. Return the manager name.',
    tags: ['JOIN', 'GROUP BY', 'HAVING'],
    tableNames: ['employees'],
    schemaDetails: SCHEMAS.employees,
    referenceSql: 'SELECT m.name FROM employees m JOIN employees e ON m.id = e.manager_id GROUP BY m.id, m.name HAVING COUNT(e.id) >= 2',
    orderMatters: false,
  },
  {
    title: 'Count Salary Categories',
    difficulty: 'medium' as const,
    description: 'Categorize employee salaries into Low Salary (strictly less than 50000), Average Salary (between 50000 and 80000 inclusive), and High Salary (strictly greater than 80000). Return category and accounts_count across all categories.',
    tags: ['UNION ALL', 'COUNT', 'WHERE'],
    tableNames: ['employees'],
    schemaDetails: SCHEMAS.employees,
    referenceSql: "SELECT 'Low Salary' AS category, COUNT(*) AS accounts_count FROM employees WHERE salary < 50000 UNION ALL SELECT 'Average Salary' AS category, COUNT(*) AS accounts_count FROM employees WHERE salary >= 50000 AND salary <= 80000 UNION ALL SELECT 'High Salary' AS category, COUNT(*) AS accounts_count FROM employees WHERE salary > 80000",
    orderMatters: false,
  },
  {
    title: 'Consecutive Higher Order Amounts',
    difficulty: 'medium' as const,
    description: 'Find orders where the total amount was strictly higher than the previous order placed by the same customer, ordered by order date. Return order id and customer id.',
    tags: ['LAG', 'WINDOW FUNCTION', 'CTE'],
    tableNames: ['orders'],
    schemaDetails: SCHEMAS.customers_orders,
    referenceSql: 'WITH lagged AS (SELECT id, customer_id, total_amount, LAG(total_amount) OVER (PARTITION BY customer_id ORDER BY order_date ASC, id ASC) AS prev_amount FROM orders) SELECT id, customer_id FROM lagged WHERE total_amount > prev_amount',
    orderMatters: false,
  },
  {
    title: 'Purge Redundant Customer Records',
    difficulty: 'medium' as const,
    description: 'In an isolated write sandbox, delete all duplicate customer records keeping only the record with the smallest id for each email. Return the deleted rows using RETURNING id, email.',
    tags: ['DELETE', 'DML', 'SUBQUERY', 'RETURNING'],
    tableNames: ['customers'],
    schemaDetails: SCHEMAS.customers_orders,
    referenceSql: 'DELETE FROM customers WHERE id NOT IN (SELECT MIN(id) FROM customers GROUP BY email) RETURNING id, email',
    orderMatters: false,
  },
  {
    title: 'Department Cost-of-Living Raise',
    difficulty: 'medium' as const,
    description: 'In an isolated write sandbox, grant a 10 percent raise to all employees in the Engineering department. Return the updated employee name and new salary using RETURNING name, salary.',
    tags: ['UPDATE', 'DML', 'WHERE', 'RETURNING'],
    tableNames: ['employees'],
    schemaDetails: SCHEMAS.employees,
    referenceSql: "UPDATE employees SET salary = ROUND(salary * 1.10) WHERE department = 'Engineering' RETURNING name, salary",
    orderMatters: false,
  },
]

export const validateReferenceQueries = async (): Promise<void> => {
  if (!process.env.NEON_DATABASE_URL && !process.env.SANDBOX_RO_URL) {
    logger.info('Skipping live Postgres validation (no DB url configured)', {
      event: 'seed_validation_skipped',
    })
    return
  }

  logger.info(`Validating all ${sampleAssignments.length} reference queries against Postgres...`, {
    event: 'seed_validation_start',
  })
  const client = await sandboxPool.connect()
  try {
    for (const [index, assignment] of sampleAssignments.entries()) {
      const isWrite = /^(INSERT|UPDATE|DELETE)\b/i.test(assignment.referenceSql.trim())
      let res
      if (isWrite) {
        await client.query('BEGIN')
        try {
          res = await client.query(assignment.referenceSql)
        } finally {
          await client.query('ROLLBACK')
        }
      } else {
        res = await client.query(assignment.referenceSql)
      }
      if (res.rows.length === 0) {
        throw new Error(`Assignment #${index + 1} "${assignment.title}" returned 0 rows!`)
      }
      if (res.rows.length > 500) {
        throw new Error(`Assignment #${index + 1} "${assignment.title}" returned ${res.rows.length} rows (> 500 cap)!`)
      }
    }
    logger.info(`All ${sampleAssignments.length} reference queries returned non-empty valid results within limits`, {
      event: 'seed_validation_success',
      totalQueries: sampleAssignments.length,
    })
  } finally {
    client.release()
  }
}

const runSeeder = async (): Promise<void> => {
  try {
    await validateReferenceQueries()

    if (!process.env.MONGO_URI) {
      logger.warn('MONGO_URI is not set. Skipping Mongo insertion.', {
        event: 'seeder_mongo_skipped',
      })
      process.exit(0)
    }

    await mongoose.connect(process.env.MONGO_URI)
    logger.info('Connected to MongoDB', { event: 'seeder_mongodb_connected' })

    await Assignment.deleteMany()
    logger.info('Cleared existing assignments', { event: 'seeder_cleared_assignments' })

    await Assignment.insertMany(sampleAssignments)
    logger.info(`Inserted ${sampleAssignments.length} assignments`, {
      event: 'seeder_inserted_assignments',
      count: sampleAssignments.length,
    })

    const easy   = sampleAssignments.filter(a => a.difficulty === 'easy').length
    const medium = sampleAssignments.filter(a => a.difficulty === 'medium').length
    const hard   = sampleAssignments.filter(a => a.difficulty === 'hard').length
    logger.info('Seeding completed breakdown', {
      event: 'seeder_completed',
      easy,
      medium,
      hard,
      total: sampleAssignments.length,
    })

    process.exit(0)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    logger.error('Seeder execution error', {
      event: 'seeder_error',
      error: msg,
    })
    process.exit(1)
  }
}

// Only run automatically when executed directly
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  runSeeder()
}