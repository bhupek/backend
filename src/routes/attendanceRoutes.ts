import express from 'express';
import AttendanceController from '../controllers/AttendanceController';
import { authenticate, authorize } from '../middleware/authentication';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Attendance management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Attendance:
 *       type: object
 *       required:
 *         - studentId
 *         - classId
 *         - schoolId
 *         - date
 *         - status
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Auto-generated UUID for the attendance record
 *         studentId:
 *           type: string
 *           format: uuid
 *           description: ID of the student
 *         classId:
 *           type: string
 *           format: uuid
 *           description: ID of the class
 *         schoolId:
 *           type: string
 *           format: uuid
 *           description: ID of the school
 *         date:
 *           type: string
 *           format: date
 *           description: Date of attendance
 *         status:
 *           type: string
 *           enum: [present, absent, late, excused]
 *           description: Attendance status
 *         remarks:
 *           type: string
 *           description: Optional remarks about the attendance
 *         markedBy:
 *           type: string
 *           format: uuid
 *           description: ID of the user who marked the attendance
 */

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * @swagger
 * /api/attendance:
 *   post:
 *     summary: Create a single attendance record
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - classId
 *               - schoolId
 *               - date
 *               - status
 *             properties:
 *               studentId:
 *                 type: string
 *                 format: uuid
 *               classId:
 *                 type: string
 *                 format: uuid
 *               schoolId:
 *                 type: string
 *                 format: uuid
 *               date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [present, absent, late, excused]
 *               remarks:
 *                 type: string
 *     responses:
 *       201:
 *         description: Attendance record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attendance'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not a teacher or admin
 */
router.post(
  '/',
  authorize(['teacher', 'admin']),
  AttendanceController.create
);

/**
 * @swagger
 * /api/attendance/bulk:
 *   post:
 *     summary: Create multiple attendance records at once
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentIds
 *               - classId
 *               - schoolId
 *               - date
 *               - status
 *             properties:
 *               studentIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               classId:
 *                 type: string
 *                 format: uuid
 *               schoolId:
 *                 type: string
 *                 format: uuid
 *               date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [present, absent, late, excused]
 *               remarks:
 *                 type: string
 *     responses:
 *       201:
 *         description: Attendance records created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Attendance'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not a teacher or admin
 */
router.post(
  '/bulk',
  authorize(['teacher', 'admin']),
  AttendanceController.bulkCreate
);

/**
 * @swagger
 * /api/attendance/{id}:
 *   patch:
 *     summary: Update an attendance record
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the attendance record to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [present, absent, late, excused]
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Attendance record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attendance'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not a teacher or admin
 *       404:
 *         description: Attendance record not found
 */
router.patch(
  '/:id',
  authorize(['teacher', 'admin']),
  AttendanceController.update
);

/**
 * @swagger
 * /api/attendance/student/{studentId}:
 *   get:
 *     summary: Get attendance records for a specific student
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the student
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering attendance records
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering attendance records
 *     responses:
 *       200:
 *         description: List of attendance records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Attendance'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User does not have required permissions
 *       404:
 *         description: Student not found
 */
router.get(
  '/student/:studentId',
  authorize(['teacher', 'admin', 'parent']),
  AttendanceController.getByStudent
);

/**
 * @swagger
 * /api/attendance/class/{classId}:
 *   get:
 *     summary: Get attendance records for a specific class
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the class
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date for which to get attendance
 *     responses:
 *       200:
 *         description: List of attendance records for the class
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Attendance'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not a teacher or admin
 *       404:
 *         description: Class not found
 */
router.get(
  '/class/:classId',
  authorize(['teacher', 'admin']),
  AttendanceController.getByClass
);

/**
 * @swagger
 * /api/attendance/{id}:
 *   delete:
 *     summary: Delete an attendance record
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the attendance record to delete
 *     responses:
 *       204:
 *         description: Attendance record deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User is not an admin
 *       404:
 *         description: Attendance record not found
 */
router.delete(
  '/:id',
  authorize(['admin']),
  AttendanceController.delete
);

export default router;
