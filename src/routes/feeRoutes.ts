import express from 'express';
import { authenticate, authorize } from '../middleware/authentication';
import FeeController from '../controllers/FeeController';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Fees
 *   description: Fee management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     FeeType:
 *       type: object
 *       required:
 *         - name
 *         - amount
 *         - frequency
 *         - schoolId
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID
 *         name:
 *           type: string
 *           description: Name of the fee type
 *         description:
 *           type: string
 *           description: Optional description
 *         amount:
 *           type: number
 *           description: Fee amount
 *         currency:
 *           type: string
 *           default: INR
 *           description: Currency code (3 letters)
 *         frequency:
 *           type: string
 *           enum: [MONTHLY, YEARLY, ONE_TIME]
 *           description: Fee frequency
 *         schoolId:
 *           type: integer
 *           description: School ID
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether the fee type is active
 *     
 *     FeePayment:
 *       type: object
 *       required:
 *         - studentId
 *         - feeTypeId
 *         - schoolId
 *         - paymentMethod
 *         - year
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID
 *         studentId:
 *           type: integer
 *           description: Student ID
 *         feeTypeId:
 *           type: integer
 *           description: Fee type ID
 *         schoolId:
 *           type: integer
 *           description: School ID
 *         amount:
 *           type: number
 *           description: Payment amount
 *         currency:
 *           type: string
 *           description: Currency code
 *         paymentMethod:
 *           type: string
 *           enum: [CASH, ONLINE, CHEQUE]
 *           description: Method of payment
 *         status:
 *           type: string
 *           enum: [PENDING, PAID, FAILED, REFUNDED]
 *           description: Payment status
 *         month:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *           description: Month number (for monthly fees)
 *         year:
 *           type: integer
 *           description: Year of payment
 */

/**
 * @swagger
 * /api/fees/types:
 *   get:
 *     summary: Get all fee types (paginated)
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         default: 10
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of fee types
 */
router.get('/types', authenticate, FeeController.getAllFeeTypes);

/**
 * @swagger
 * /api/fees/types:
 *   post:
 *     summary: Create a new fee type
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FeeType'
 *     responses:
 *       201:
 *         description: Fee type created successfully
 */
router.post('/types', authenticate, authorize('admin'), FeeController.createFeeType);

/**
 * @swagger
 * /api/fees/types/school/{schoolId}:
 *   get:
 *     summary: Get all fee types for a specific school
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of fee types for the school
 */
router.get('/types/school/:schoolId', authenticate, FeeController.getFeeTypesBySchool);

/**
 * @swagger
 * /api/fees/types/{id}:
 *   get:
 *     summary: Get a fee type by ID
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Fee type details
 *       404:
 *         description: Fee type not found
 */
router.get('/types/:id', authenticate, FeeController.getFeeTypeById);

/**
 * @swagger
 * /api/fees/types/{id}:
 *   put:
 *     summary: Update a fee type
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FeeType'
 *     responses:
 *       200:
 *         description: Fee type updated successfully
 *       404:
 *         description: Fee type not found
 */
router.put('/types/:id', authenticate, authorize('admin'), FeeController.updateFeeType);

/**
 * @swagger
 * /api/fees/types/{id}:
 *   delete:
 *     summary: Delete a fee type
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Fee type deleted successfully
 *       404:
 *         description: Fee type not found
 */
router.delete('/types/:id', authenticate, authorize('admin'), FeeController.deleteFeeType);

/**
 * @swagger
 * /api/fees/types/{schoolId}:
 *   get:
 *     summary: Get all fee types for a school
 *     tags: [Fees]
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
 *         description: List of fee types
 */
router.get('/types/:schoolId', authenticate, FeeController.getFeeTypes);

/**
 * @swagger
 * /api/fees/payments:
 *   post:
 *     summary: Create a new fee payment
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FeePayment'
 *     responses:
 *       201:
 *         description: Payment created successfully
 */
router.post('/payments', authenticate, FeeController.createFeePayment);

/**
 * @swagger
 * /api/fees/payments/{id}:
 *   put:
 *     summary: Update a fee payment
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payment updated successfully
 */
router.put('/payments/:id', authenticate, authorize('admin'), FeeController.updateFeePayment);

/**
 * @swagger
 * /api/fees/school/{schoolId}/payments:
 *   get:
 *     summary: Get all fee payments for a school
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PAID, FAILED, REFUNDED]
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
 *         description: List of payments with pagination
 */
router.get('/school/:schoolId/payments', authenticate, FeeController.getAllFeePayments);

/**
 * @swagger
 * /api/fees/student/{studentId}/school/{schoolId}:
 *   get:
 *     summary: Get fee payments for a student
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of student's fee payments
 */
router.get('/student/:studentId/school/:schoolId', authenticate, FeeController.getFeePaymentsByStudent);

/**
 * @swagger
 * /api/fees/school/{schoolId}/pending:
 *   get:
 *     summary: Get students with pending fees
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: feeTypeId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: classId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of students with pending fees
 */
router.get('/school/:schoolId/pending', authenticate, FeeController.getPendingFeeStudents);

/**
 * @swagger
 * /api/fees/student/{studentId}/school/{schoolId}/status:
 *   get:
 *     summary: Get fee status for a student
 *     tags: [Fees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Student's fee status for all fee types
 */
router.get('/student/:studentId/school/:schoolId/status', authenticate, FeeController.getStudentFeeStatus);

export default router;