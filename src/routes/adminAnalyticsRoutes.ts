import express from 'express';
import { authenticate, authorize } from '../middleware/authentication';
import AdminAnalyticsController from '../controllers/AdminAnalyticsController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: AdminAnalytics
 *   description: Analytics endpoints for admin dashboard
 */

/**
 * @swagger
 * /api/admin/analytics/attendance/trends:
 *   get:
 *     summary: Get attendance trends
 *     tags: [AdminAnalytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *       - in: query
 *         name: classId
 *         schema:
 *           type: number
 *       - in: query
 *         name: section
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Attendance trends retrieved successfully
 */
router.get(
  '/attendance/trends',
  authenticate,
  authorize('admin'),
  AdminAnalyticsController.getAttendanceTrends
);

/**
 * @swagger
 * /api/admin/analytics/classwork/trends:
 *   get:
 *     summary: Get classwork trends
 *     tags: [AdminAnalytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *       - in: query
 *         name: classId
 *         schema:
 *           type: number
 *       - in: query
 *         name: section
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Classwork trends retrieved successfully
 */
router.get(
  '/classwork/trends',
  authenticate,
  authorize('admin'),
  AdminAnalyticsController.getClassworkTrends
);

/**
 * @swagger
 * /api/admin/analytics/homework/trends:
 *   get:
 *     summary: Get homework trends
 *     tags: [AdminAnalytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *       - in: query
 *         name: classId
 *         schema:
 *           type: number
 *       - in: query
 *         name: section
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Homework trends retrieved successfully
 */
router.get(
  '/homework/trends',
  authenticate,
  authorize('admin'),
  AdminAnalyticsController.getHomeworkTrends
);

/**
 * @swagger
 * /api/admin/analytics/payment/trends:
 *   get:
 *     summary: Get payment trends
 *     tags: [AdminAnalytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *       - in: query
 *         name: classId
 *         schema:
 *           type: number
 *       - in: query
 *         name: section
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment trends retrieved successfully
 */
router.get(
  '/payment/trends',
  authenticate,
  authorize('admin'),
  AdminAnalyticsController.getPaymentTrends
);

export default router;
