import express from 'express';
import { handleExcecution } from '../controllers/executionController.js';

const router= express.Router();

router.post('/execute', handleExcecution);

export default router;
