import { Router } from 'express';

import { authenticate, authorize } from '../middleware/authentication';

import * as classController from '../controllers/classController';



const router = Router();



/**
 * @swagger
 * /api/classes:
 *   get:
 *     summary: Get all classes
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of classes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   grade:
 *                     type: string
 *                   section:
 *                     type: string
 */
router.get('/', authenticate, classController.getAllClasses);

/**
 * @swagger
 * /api/classes/{id}:
 *   get:
 *     summary: Get class by ID
 *     tags: [Classes]
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
 *         description: Class details
 */
router.get('/:id', authenticate, classController.getClassById);

/**
 * @swagger
 * /api/classes:
 *   post:
 *     summary: Create new class
 *     tags: [Classes]
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
 *               - grade
 *               - section
 *             properties:
 *               name:
 *                 type: string
 *               grade:
 *                 type: string
 *               section:
 *                 type: string
 *     responses:
 *       201:
 *         description: Class created successfully
 */
router.post('/', authenticate, authorize('admin'), classController.createClass);

/**
 * @swagger
 * /api/classes/{id}/students:
 *   get:
 *     summary: Get students in a class
 *     tags: [Classes]
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
 *         description: List of students in the class
 */
router.get('/:id/students', authenticate, classController.getClassStudents);

/**
 * @swagger
 * /api/classes/{classId}/students/{studentId}:
 *   post:
 *     summary: Add student to class
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Student added to class successfully
 */
router.post('/:classId/students/:studentId', authenticate, authorize('admin'), classController.addStudentToClass);



export default router; 
