import express from 'express';
import adminRoutes from './adminRoutes';
import authRoutes from './authRoutes';
import classRoutes from './classRoutes';
import userRoutes from './userRoutes';
import profileRoutes from './profileRoutes';
import schoolRoutes from './schoolRoutes';
import assignmentRoutes from './assignmentRoutes';
import attendanceRoutes from './attendanceRoutes';
import feeRoutes from './feeRoutes';
import notificationRoutes from './notificationRoutes';
import analyticsRoutes from './analyticsRoutes';
import subjectRoutes from './subjectRoutes';

const router = express.Router();

// Admin routes
router.use('/admin', adminRoutes);

// Auth routes
router.use('/auth', authRoutes);

// Other routes
router.use('/classes', classRoutes);
router.use('/users', userRoutes);
router.use('/profile', profileRoutes);
router.use('/schools', schoolRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/fees', feeRoutes);
router.use('/notifications', notificationRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/subjects', subjectRoutes);

export default router;