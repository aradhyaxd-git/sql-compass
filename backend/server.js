import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectSandboxDB } from './config/db.postgres.js';
import { connectPersistenceDB } from './config/db.mongo.js';
import executionRoutes from './routes/executionRouter.js';
import assignmentRoutes from './routes/assignmentRouter.js';
import hintRoutes from './routes/hintRouter.js';

dotenv.config();

const app= express();
const PORT= process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); 

app.get('/health', (req, res) => {
    res.status(200).json({status:'active', message: 'server is running' });
});


app.use('/api/execute', executionRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/hints', hintRoutes);

const startServer= async()=>{
        await connectSandboxDB();
        await connectPersistenceDB();
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    };

startServer();
