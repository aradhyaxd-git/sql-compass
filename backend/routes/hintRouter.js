import express from 'express';
import { getAssignmentHint } from '../controllers/hintController.js';

const router = express.Router();
router.post('/', getAssignmentHint);
export default router;