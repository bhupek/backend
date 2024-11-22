import express from 'express';
import {
  createTest,
  getTests,
  getTestById,
  updateTest,
  deleteTest,
  publishTest,
} from '../controllers/TestController';
import { authenticate } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';

const router = express.Router();

// Protected routes - Admin only
router.post('/', authenticate, checkRole(['admin']), createTest);
router.get('/', authenticate, checkRole(['admin']), getTests);
router.get('/:id', authenticate, checkRole(['admin']), getTestById);
router.put('/:id', authenticate, checkRole(['admin']), updateTest);
router.delete('/:id', authenticate, checkRole(['admin']), deleteTest);
router.post('/:id/publish', authenticate, checkRole(['admin']), publishTest);

export default router;
