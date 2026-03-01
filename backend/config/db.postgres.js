import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
export const sandboxPool = new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: {
        require: true, 
    },
});
export const connectSandboxDB = async () => {
    try {
        const client = await sandboxPool.connect();
        console.log('Neon PostgreSQL Sandbox Connected Successfully');
        client.release();
    } catch (error) {
        console.error('Neon Database connection error:', error.message);
        process.exit(1); 
    }
};