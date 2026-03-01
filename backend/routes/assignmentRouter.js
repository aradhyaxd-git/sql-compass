import express from 'express';
import { getAllAssignments, getAssignmentById } from '../controllers/assignmentController.js';

const router= express.Router();

router.get('/', getAllAssignments);
router.get('/:id', getAssignmentById);

export default router;