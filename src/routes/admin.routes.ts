import { Router } from 'express';
import AdminController from '../controllers/AdminController';
import { checkRole } from '../middleware/roles';
import { UserRole } from '../types';
import * as classController from '../controllers/classController';

const router = Router();

// Analytics routes
router.get('/analytics/attendance/trends', checkRole([UserRole.ADMIN]), AdminController.getAttendanceTrends);
router.get('/fees/analytics/payment-methods', checkRole([UserRole.ADMIN]), AdminController.getFeePaymentStats);

// Data routes
router.get('/students', checkRole([UserRole.ADMIN]), AdminController.getStudents);
router.get('/users', checkRole([UserRole.ADMIN]), AdminController.getUsers);
router.get('/classes', checkRole([UserRole.ADMIN]), AdminController.getClasses);
router.post('/classes', checkRole([UserRole.ADMIN]), classController.createClass);
router.put('/classes/:id', checkRole([UserRole.ADMIN]), classController.updateClass);
router.delete('/classes/:id', checkRole([UserRole.ADMIN]), classController.deleteClass);

// Fee management routes
router.post('/fees/types/bulk', checkRole([UserRole.ADMIN]), ...AdminController.bulkCreateFeeTypes);
router.patch('/fees/types/bulk', checkRole([UserRole.ADMIN]), ...AdminController.bulkUpdateFeeTypes);
router.get('/fees/report', checkRole([UserRole.ADMIN]), ...AdminController.getFeeCollectionReport);
router.get('/fees/defaulters', checkRole([UserRole.ADMIN]), AdminController.getDefaultersList);

export default router;
