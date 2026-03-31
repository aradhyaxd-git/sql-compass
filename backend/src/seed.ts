import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import Assignment from './models/Assignment.js'

const SCHEMAS = {
  employees: `📋 EMPLOYEES TABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
id (SERIAL PRIMARY KEY)
name (VARCHAR 100)
department (VARCHAR 100)
salary (INT)
hire_date (DATE)
manager_id (INT, nullable)`,

  customers_orders: `📋 CUSTOMERS TABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
id (SERIAL PRIMARY KEY)
name (VARCHAR 100)
email (VARCHAR 150)
city (VARCHAR 100)
joined_date (DATE)

📋 ORDERS TABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
id (SERIAL PRIMARY KEY)
customer_id (INT → customers.id)
total_amount (NUMERIC 10,2)
status (VARCHAR 50)
order_date (DATE)`,

  products_categories: `📋 CATEGORIES TABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
id (SERIAL PRIMARY KEY)
name (VARCHAR 100)

📋 PRODUCTS TABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
id (SERIAL PRIMARY KEY)
name (VARCHAR 150)
category_id (INT → categories.id)
price (NUMERIC 10,2)
stock_quantity (INT)
created_at (DATE)`,

  students_courses: `📋 STUDENTS TABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
id (SERIAL PRIMARY KEY)
name (VARCHAR 100)
email (VARCHAR 150)
enrollment_year (INT)
gpa (NUMERIC 3,2)

📋 COURSES TABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
id (SERIAL PRIMARY KEY)
title (VARCHAR 150)
instructor (VARCHAR 100)
credits (INT)
department (VARCHAR 100)

📋 ENROLLMENTS TABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
id (SERIAL PRIMARY KEY)
student_id (INT → students.id)
course_id (INT → courses.id)
grade (VARCHAR 2)
enrolled_at (DATE)`,

  departments: `📋 EMPLOYEES TABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
id (SERIAL PRIMARY KEY)
name (VARCHAR 100)
department (VARCHAR 100)
salary (INT)
hire_date (DATE)
manager_id (INT, nullable)

📋 DEPARTMENTS TABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
id (SERIAL PRIMARY KEY)
name (VARCHAR 100)
budget (NUMERIC 12,2)
head_id (INT → employees.id)`,

  sessions_events: `📋 SESSIONS TABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
id (SERIAL PRIMARY KEY)
user_id (INT)
started_at (TIMESTAMP)
ended_at (TIMESTAMP, nullable)
device (VARCHAR 50)

📋 EVENTS TABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
id (SERIAL PRIMARY KEY)
session_id (INT → sessions.id)
event_type (VARCHAR 100)
occurred_at (TIMESTAMP)`,
}

const sampleAssignments = [
  // GROUP 1: employees (8)
  {
    title: 'List All Employees',
    difficulty: 'easy',
    description: 'Retrieve the name, department, and salary of all employees. Order the results alphabetically by name.',
    tags: ['SELECT', 'ORDER BY'],
    tableNames: ['employees'],
    schemaDetails: SCHEMAS.employees,
  },
  {
    title: 'Find High Earners',
    difficulty: 'easy',
    description: 'Retrieve the names and salaries of all employees who earn more than 70,000. Order by salary descending.',
    tags: ['SELECT', 'WHERE', 'ORDER BY'],
    tableNames: ['employees'],
    schemaDetails: SCHEMAS.employees,
  },
  {
    title: 'Department Headcount',
    difficulty: 'easy',
    description: 'Count the number of employees in each department. Return department name and count, ordered by count descending.',
    tags: ['GROUP BY', 'COUNT', 'ORDER BY'],
    tableNames: ['employees'],
    schemaDetails: SCHEMAS.employees,
  },
  {
    title: 'Average Salary by Department',
    difficulty: 'medium',
    description: 'Find departments where the average salary exceeds 65,000. Return department name and average salary rounded to 2 decimal places.',
    tags: ['GROUP BY', 'HAVING', 'AVG', 'ROUND'],
    tableNames: ['employees'],
    schemaDetails: SCHEMAS.employees,
  },
  {
    title: 'Most Recent Hires',
    difficulty: 'easy',
    description: 'Find the 5 most recently hired employees. Return their name, department, and hire date.',
    tags: ['ORDER BY', 'LIMIT'],
    tableNames: ['employees'],
    schemaDetails: SCHEMAS.employees,
  },
  {
    title: 'Second Highest Salary',
    difficulty: 'hard',
    description: 'Find the second highest salary from the employees table without using LIMIT/OFFSET. If no second exists, return null.',
    tags: ['Subquery', 'MAX', 'DISTINCT'],
    tableNames: ['employees'],
    schemaDetails: SCHEMAS.employees,
  },
  {
    title: 'Employees Without Managers',
    difficulty: 'easy',
    description: 'Find all employees who do not have a manager assigned (manager_id is NULL). Return their name and department.',
    tags: ['WHERE', 'IS NULL'],
    tableNames: ['employees'],
    schemaDetails: SCHEMAS.employees,
  },
  {
    title: 'Salary Band Classification',
    difficulty: 'medium',
    description: 'Categorize employees into salary bands: Low (under 50k), Mid (50k-80k), High (above 80k). Return employee name, salary, and their band.',
    tags: ['CASE WHEN', 'SELECT'],
    tableNames: ['employees'],
    schemaDetails: SCHEMAS.employees,
  },

  // GROUP 2: customers + orders (6)
  {
    title: 'Top Customers by Revenue',
    difficulty: 'medium',
    description: 'Find the top 5 customers by total order value. Return customer name and total spend, ordered by spend descending.',
    tags: ['JOIN', 'GROUP BY', 'SUM', 'LIMIT'],
    tableNames: ['customers', 'orders'],
    schemaDetails: SCHEMAS.customers_orders,
  },
  {
    title: 'Customers With No Orders',
    difficulty: 'medium',
    description: 'Find all customers who have never placed an order. Return their name and email.',
    tags: ['LEFT JOIN', 'IS NULL'],
    tableNames: ['customers', 'orders'],
    schemaDetails: SCHEMAS.customers_orders,
  },
  {
    title: 'Orders by Status',
    difficulty: 'easy',
    description: 'Count the number of orders grouped by status. Order by count descending.',
    tags: ['GROUP BY', 'COUNT', 'ORDER BY'],
    tableNames: ['orders'],
    schemaDetails: SCHEMAS.customers_orders,
  },
  {
    title: 'Monthly Revenue Trend',
    difficulty: 'hard',
    description: 'Calculate total revenue for each month. Return year, month number, and total revenue ordered chronologically. Only include completed orders.',
    tags: ['EXTRACT', 'GROUP BY', 'SUM', 'WHERE'],
    tableNames: ['orders'],
    schemaDetails: SCHEMAS.customers_orders,
  },
  {
    title: 'Average Order Value per City',
    difficulty: 'medium',
    description: 'Find the average order value grouped by customer city. Only include cities with more than 2 orders. Return city and average value rounded to 2 decimal places.',
    tags: ['JOIN', 'GROUP BY', 'HAVING', 'AVG'],
    tableNames: ['customers', 'orders'],
    schemaDetails: SCHEMAS.customers_orders,
  },
  {
    title: 'First Order per Customer',
    difficulty: 'hard',
    description: 'For each customer, find the date of their very first order. Return customer name and first order date.',
    tags: ['JOIN', 'GROUP BY', 'MIN'],
    tableNames: ['customers', 'orders'],
    schemaDetails: SCHEMAS.customers_orders,
  },

  // GROUP 3: products + categories (5)
  {
    title: 'Products by Category',
    difficulty: 'easy',
    description: 'List all products with their category name. Return product name, price, and category. Order by category then product name.',
    tags: ['JOIN', 'ORDER BY'],
    tableNames: ['products', 'categories'],
    schemaDetails: SCHEMAS.products_categories,
  },
  {
    title: 'Low Stock Alert',
    difficulty: 'easy',
    description: 'Find all products where stock quantity is below 10. Return product name, category name, and current stock. Order by stock ascending.',
    tags: ['JOIN', 'WHERE', 'ORDER BY'],
    tableNames: ['products', 'categories'],
    schemaDetails: SCHEMAS.products_categories,
  },
  {
    title: 'Most Expensive per Category',
    difficulty: 'hard',
    description: 'For each category, find the single most expensive product. Return category name, product name, and price.',
    tags: ['JOIN', 'Subquery', 'MAX'],
    tableNames: ['products', 'categories'],
    schemaDetails: SCHEMAS.products_categories,
  },
  {
    title: 'Category Inventory Value',
    difficulty: 'medium',
    description: 'Calculate total inventory value (price × stock_quantity) for each category. Return category name and total value, ordered by value descending.',
    tags: ['JOIN', 'GROUP BY', 'SUM'],
    tableNames: ['products', 'categories'],
    schemaDetails: SCHEMAS.products_categories,
  },
  {
    title: 'Products Added This Year',
    difficulty: 'medium',
    description: 'Find all products added in the current year. Return product name, category, price, and the date added.',
    tags: ['WHERE', 'EXTRACT', 'JOIN'],
    tableNames: ['products', 'categories'],
    schemaDetails: SCHEMAS.products_categories,
  },

  // GROUP 4: students + courses + enrollments (6)
  {
    title: 'Student Enrollment Count',
    difficulty: 'easy',
    description: 'Count how many courses each student is enrolled in. Return student name and enrollment count, ordered by count descending.',
    tags: ['JOIN', 'GROUP BY', 'COUNT'],
    tableNames: ['students', 'enrollments'],
    schemaDetails: SCHEMAS.students_courses,
  },
  {
    title: 'Course Popularity',
    difficulty: 'easy',
    description: 'Find the number of students enrolled in each course. Return course title and student count, ordered by count descending.',
    tags: ['JOIN', 'GROUP BY', 'COUNT'],
    tableNames: ['courses', 'enrollments'],
    schemaDetails: SCHEMAS.students_courses,
  },
  {
    title: 'Students With Grade A',
    difficulty: 'medium',
    description: 'Find all students who received an A grade in at least one course. Return student name, course title, and grade. No duplicates.',
    tags: ['JOIN', 'WHERE', 'DISTINCT'],
    tableNames: ['students', 'courses', 'enrollments'],
    schemaDetails: SCHEMAS.students_courses,
  },
  {
    title: 'GPA Above Average',
    difficulty: 'medium',
    description: 'Find all students whose GPA is above the class average. Return their name, enrollment year, and GPA.',
    tags: ['WHERE', 'Subquery', 'AVG'],
    tableNames: ['students'],
    schemaDetails: SCHEMAS.students_courses,
  },
  {
    title: 'Courses Never Enrolled',
    difficulty: 'medium',
    description: 'Find all courses that have zero students enrolled. Return course title and instructor.',
    tags: ['LEFT JOIN', 'IS NULL'],
    tableNames: ['courses', 'enrollments'],
    schemaDetails: SCHEMAS.students_courses,
  },
  {
    title: 'Top Student per Department',
    difficulty: 'hard',
    description: 'Find the student with the highest GPA in each course department. Return department, student name, and GPA.',
    tags: ['JOIN', 'GROUP BY', 'MAX', 'Subquery'],
    tableNames: ['students', 'courses', 'enrollments'],
    schemaDetails: SCHEMAS.students_courses,
  },

  // GROUP 5: departments (3)
  {
    title: 'Department Budget vs Payroll',
    difficulty: 'hard',
    description: 'For each department, compare the budget to total employee payroll. Return department name, budget, total payroll, and the difference.',
    tags: ['JOIN', 'GROUP BY', 'SUM'],
    tableNames: ['employees', 'departments'],
    schemaDetails: SCHEMAS.departments,
  },
  {
    title: 'Manager Headcount',
    difficulty: 'medium',
    description: 'Find all employees who manage at least one other person. Return their name and the number of direct reports, ordered by headcount descending.',
    tags: ['Self JOIN', 'GROUP BY', 'COUNT'],
    tableNames: ['employees'],
    schemaDetails: SCHEMAS.departments,
  },
  {
    title: 'Underpaid vs Department Average',
    difficulty: 'hard',
    description: 'Find employees who earn less than the average salary of their own department. Return employee name, their salary, and the department average.',
    tags: ['Correlated Subquery', 'AVG', 'WHERE'],
    tableNames: ['employees'],
    schemaDetails: SCHEMAS.departments,
  },

  // GROUP 6: sessions + events (3)
  {
    title: 'Average Session Duration',
    difficulty: 'medium',
    description: 'Calculate the average session duration in minutes for each device type. Return device type and average duration rounded to 1 decimal place.',
    tags: ['GROUP BY', 'AVG', 'EXTRACT', 'EPOCH'],
    tableNames: ['sessions'],
    schemaDetails: SCHEMAS.sessions_events,
  },
  {
    title: 'Most Common Event Types',
    difficulty: 'easy',
    description: 'Find the top 5 most frequently occurring event types. Return event type and count, ordered by count descending.',
    tags: ['GROUP BY', 'COUNT', 'ORDER BY', 'LIMIT'],
    tableNames: ['events'],
    schemaDetails: SCHEMAS.sessions_events,
  },
  {
    title: 'Users With Most Sessions',
    difficulty: 'medium',
    description: 'Find the top 10 users by total number of sessions. Return user_id and session count, ordered by count descending.',
    tags: ['GROUP BY', 'COUNT', 'ORDER BY', 'LIMIT'],
    tableNames: ['sessions'],
    schemaDetails: SCHEMAS.sessions_events,
  },
]

const runSeeder = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI!)
    console.log('[Seeder] Connected to MongoDB')

    await Assignment.deleteMany()
    console.log('[Seeder] Cleared existing assignments')

    await Assignment.insertMany(sampleAssignments)
    console.log(`[Seeder] Inserted ${sampleAssignments.length} assignments`)

    const easy   = sampleAssignments.filter(a => a.difficulty === 'easy').length
    const medium = sampleAssignments.filter(a => a.difficulty === 'medium').length
    const hard   = sampleAssignments.filter(a => a.difficulty === 'hard').length
    console.log(`\n  Easy:   ${easy}`)
    console.log(`  Medium: ${medium}`)
    console.log(`  Hard:   ${hard}`)
    console.log(`  Total:  ${sampleAssignments.length}`)

    process.exit(0)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[Seeder] Error:', msg)
    process.exit(1)
  }
}

runSeeder()