import express from 'express';
import { authenticate } from '../middleware/authentication';
import { authorize } from '../middleware/authorization';
import AdminController from '../controllers/AdminController';
import * as classController from '../controllers/classController';
import * as subjectController from '../controllers/subjectController';
import * as teacherController from '../controllers/teacherController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative operations for school management
 */

// Dashboard Overview Routes
/**
 * @swagger
 * /api/admin/dashboard/overview:
 *   get:
 *     summary: Get admin dashboard overview
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *         description: School ID to get overview for
 *     responses:
 *       200:
 *         description: Dashboard overview data
 */
router.get(
  '/dashboard/overview',
  authenticate,
  authorize(['ADMIN', 'SCHOOL_ADMIN']),
  AdminController.getDashboardOverview
);

// Class Management Routes
/**
 * @swagger
 * /api/admin/classes:
 *   get:
 *     summary: Get all classes (admin view)
 *     tags: [Admin, Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         schema:
 *           type: string
 *         description: Filter classes by school ID
 *     responses:
 *       200:
 *         description: List of all classes with detailed information
 */
router.get(
  '/classes',
  authenticate,
  authorize(['ADMIN', 'SCHOOL_ADMIN']),
  classController.getAllClasses
);

/**
 * @swagger
 * /api/admin/classes/bulk:
 *   post:
 *     summary: Bulk create classes
 *     tags: [Admin, Classes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               classes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - grade
 *                     - section
 *                     - school_id
 *                   properties:
 *                     grade:
 *                       type: string
 *                     section:
 *                       type: string
 *                     school_id:
 *                       type: string
 *                     class_teacher_id:
 *                       type: string
 *     responses:
 *       201:
 *         description: Classes created successfully
 */
router.post(
  '/classes/bulk',
  authenticate,
  authorize(['ADMIN', 'SCHOOL_ADMIN']),
  classController.bulkCreateClasses
);

// Subject Management Routes
/**
 * @swagger
 * /api/admin/subjects:
 *   get:
 *     summary: Get all subjects (admin view)
 *     tags: [Admin, Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         schema:
 *           type: string
 *         description: Filter subjects by school ID
 *     responses:
 *       200:
 *         description: List of all subjects with detailed information
 */
router.get(
  '/subjects',
  authenticate,
  authorize(['ADMIN', 'SCHOOL_ADMIN']),
  subjectController.getAllSubjects
);

/**
 * @swagger
 * /api/admin/subjects/bulk:
 *   post:
 *     summary: Bulk create subjects
 *     tags: [Admin, Subjects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - name
 *                     - school_id
 *                   properties:
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     credits:
 *                       type: number
 *                     school_id:
 *                       type: string
 *     responses:
 *       201:
 *         description: Subjects created successfully
 */
router.post(
  '/subjects/bulk',
  authenticate,
  authorize(['ADMIN', 'SCHOOL_ADMIN']),
  subjectController.bulkCreateSubjects
);

// Teacher Management Routes
/**
 * @swagger
 * /api/admin/teachers:
 *   get:
 *     summary: Get all teachers (admin view)
 *     tags: [Admin, Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         schema:
 *           type: string
 *         description: Filter teachers by school ID
 *     responses:
 *       200:
 *         description: List of all teachers with detailed information
 */
router.get(
  '/teachers',
  authenticate,
  authorize(['ADMIN', 'SCHOOL_ADMIN']),
  teacherController.getAllTeachers
);

/**
 * @swagger
 * /api/admin/teachers:
 *   post:
 *     summary: Create a new teacher
 *     tags: [Admin, Teachers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - school_id
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               school_id:
 *                 type: string
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Teacher created successfully
 */
router.post(
  '/teachers',
  authenticate,
  authorize(['ADMIN', 'SCHOOL_ADMIN']),
  teacherController.createTeacher
);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative operations for fee management
 */

/**
 * @swagger
 * /api/admin/fees/types/bulk:
 *   post:
 *     summary: Bulk create fee types
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feeTypes:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/FeeType'
 *     responses:
 *       201:
 *         description: Fee types created successfully
 */
router.post(
  '/fees/types/bulk',
  authenticate,
  authorize('admin'),
  AdminController.bulkCreateFeeTypes
);

/**
 * @swagger
 * /api/admin/fees/types/bulk:
 *   put:
 *     summary: Bulk update fee types
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               updates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     amount:
 *                       type: number
 *                     isActive:
 *                       type: boolean
 *     responses:
 *       200:
 *         description: Fee types updated successfully
 */
router.put(
  '/fees/types/bulk',
  authenticate,
  authorize('admin'),
  AdminController.bulkUpdateFeeTypes
);

/**
 * @swagger
 * /api/admin/fees/reports/collection:
 *   get:
 *     summary: Get fee collection report
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: feeTypeId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: classId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Fee collection report generated successfully
 */
router.get(
  '/fees/reports/collection',
  authenticate,
  authorize('admin'),
  AdminController.getFeeCollectionReport
);

/**
 * @swagger
 * /api/admin/fees/reports/defaulters:
 *   get:
 *     summary: Get list of fee defaulters
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *       - in: query
 *         name: classId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Defaulters list retrieved successfully
 */
router.get(
  '/fees/reports/defaulters',
  authenticate,
  authorize('admin'),
  AdminController.getDefaultersList
);

/**
 * @swagger
 * /api/admin/fees/reports/daily:
 *   get:
 *     summary: Get daily fee collection report
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Daily collection report retrieved successfully
 */
router.get(
  '/fees/reports/daily',
  authenticate,
  authorize('admin'),
  AdminController.getDailyCollectionReport
);

/**
 * @swagger
 * /api/admin/fees/types/school/{schoolId}/deactivate:
 *   post:
 *     summary: Deactivate all fee types for a school
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: All fee types deactivated successfully
 */
router.post(
  '/fees/types/school/:schoolId/deactivate',
  authenticate,
  authorize('admin'),
  AdminController.deactivateAllFeeTypes
);

/**
 * @swagger
 * /api/admin/fees/types/school/{schoolId}/activate:
 *   post:
 *     summary: Activate all fee types for a school
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: All fee types activated successfully
 */
router.post(
  '/fees/types/school/:schoolId/activate',
  authenticate,
  authorize('admin'),
  AdminController.activateAllFeeTypes
);

/**
 * @swagger
 * /api/admin/fees/payments/{paymentId}/cancel:
 *   post:
 *     summary: Cancel a fee payment
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment cancelled successfully
 */
router.post(
  '/fees/payments/:paymentId/cancel',
  authenticate,
  authorize('admin'),
  AdminController.cancelPayment
);

/**
 * @swagger
 * /api/admin/fees/payments/{paymentId}/refund:
 *   post:
 *     summary: Process a fee refund
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *               refundMethod:
 *                 type: string
 *                 enum: [CASH, BANK_TRANSFER, CHEQUE]
 *     responses:
 *       200:
 *         description: Refund processed successfully
 */
router.post(
  '/fees/payments/:paymentId/refund',
  authenticate,
  authorize('admin'),
  AdminController.refundPayment
);

/**
 * @swagger
 * /api/admin/fees/analytics/revenue:
 *   get:
 *     summary: Get revenue analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Revenue analytics retrieved successfully
 */
router.get(
  '/fees/analytics/revenue',
  authenticate,
  authorize('admin'),
  AdminController.getRevenueAnalytics
);

/**
 * @swagger
 * /api/admin/fees/analytics/payment-methods:
 *   get:
 *     summary: Get payment method statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Payment method statistics retrieved successfully
 */
router.get(
  '/fees/analytics/payment-methods',
  authenticate,
  authorize('admin'),
  AdminController.getPaymentMethodStats
);

// Class routes
router.get('/classes', authenticate, authorize('admin'), classController.getAllClasses);
router.get('/classes/:id', authenticate, authorize('admin'), classController.getClassById);
router.post('/classes', authenticate, authorize('admin'), classController.createClass);
router.put('/classes/:id', authenticate, authorize('admin'), classController.updateClass);
router.delete('/classes/:id', authenticate, authorize('admin'), classController.deleteClass);

export default router;
