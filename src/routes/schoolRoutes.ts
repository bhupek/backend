import express from 'express';
import SchoolController from '../controllers/SchoolController';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { Role } from '../models/RolePermission';
import { validateRequest } from '../middleware/validate';

const router = express.Router();

// Public routes
router.post('/register', validateRequest(SchoolController.createSchoolSchema), SchoolController.createSchool);

// Protected routes
router.use(authenticateToken);

// School admin only routes
router.get('/:id', authorize([Role.ADMIN]), SchoolController.getSchool);
router.patch('/:id', authorize([Role.ADMIN]), validateRequest(SchoolController.updateSchoolSchema), SchoolController.updateSchool);
router.delete('/:id', authorize([Role.ADMIN]), SchoolController.deleteSchool);

export default router;
