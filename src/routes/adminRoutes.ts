import express from 'express';
import { authenticate, authorize } from '../middleware/authentication';
import AdminController from '../controllers/AdminController';

const router = express.Router();

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

export default router;
