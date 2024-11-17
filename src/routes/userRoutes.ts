import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authentication';
import * as userController from '../controllers/userController';

const router = Router();

// User Management Routes
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.put('/change-password', authenticate, userController.changePassword);

// Admin only routes
router.get('/', authenticate, authorize('admin'), userController.getAllUsers);
router.post('/', authenticate, authorize('admin'), userController.createUser);
router.put('/:id', authenticate, authorize('admin'), userController.updateUser);
router.delete('/:id', authenticate, authorize('admin'), userController.deleteUser);

export default router; 