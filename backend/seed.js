import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Assignment from './models/Assignment.js';
dotenv.config();
const sampleAssignments = [
    {
        title: 'Find High Earners',
        difficulty: 'Easy',
        description: 'Write a SQL query to retrieve the names and salaries of all employees who earn more than 70,000.',
        schemaDetails: 'Table: employees (id SERIAL PRIMARY KEY, name VARCHAR, department VARCHAR, salary INT)'
    },
    {
        title: 'Department Headcount',
        difficulty: 'Medium',
        description: 'Write a SQL query to count the number of employees in each department. Return the department name and the total count.',
        schemaDetails: 'Table: employees (id SERIAL PRIMARY KEY, name VARCHAR, department VARCHAR, salary INT)'
    },
    {
        title: 'Second Highest Salary',
        difficulty: 'Hard',
        description: 'Write a SQL query to find the second highest salary from the employees table. If there is no second highest salary, return null.',
        schemaDetails: 'Table: employees (id SERIAL PRIMARY KEY, name VARCHAR, department VARCHAR, salary INT)'
    }
];
const runSeeder = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        await Assignment.deleteMany();
        console.log('Cleared existing assignments.');

        await Assignment.insertMany(sampleAssignments);
        console.log('Sample assignments inserted successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error.message);
        process.exit(1);
    }
};

runSeeder();