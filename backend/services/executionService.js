import { sandboxPool } from "../config/db.postgres.js";

export const executeUserQuery = async (sqlQuery) => {
    const client= await sandboxPool.connect();
    try{
        const res= await client.query(sqlQuery);
        return res.rows;
    }
    catch(error){
        throw new Error(`Query Execution Failed: ${error.message}`);
    }
    finally{
        client.release();
    }
};
