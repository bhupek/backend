import express from 'express';
import { getAttendanceTrends, getClassworkTrends, getFeePaymentStats } from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/auth';
import { checkRole } from '../middleware/roles';

const router = express.Router();

// Protect all analytics routes with authentication and admin role
router.use(authenticateToken);
router.use(checkRole(['ADMIN', 'SUPER_ADMIN']));

// Attendance analytics
router.get('/attendance/trends', getAttendanceTrends);

// Classwork analytics
router.get('/classwork/trends', getClassworkTrends);

// Fee payment analytics
router.get('/fees/payment-stats', getFeePaymentStats);

export default router;
