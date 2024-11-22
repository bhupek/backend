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
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         schema:
 *           type: string
 *         description: Filter classes by school ID
 *     responses:
 *       200:
 *         description: List of classes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 classes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       grade:
 *                         type: string
 *                       section:
 *                         type: string
 *                       school_id:
 *                         type: string
 *                       class_teacher_id:
 *                         type: string
 *                       classTeacher:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       subjects:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             name:
 *                               type: string
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
 *           type: string
 *     responses:
 *       200:
 *         description: Class details
 */
router.get('/:id', authenticate, classController.getClassById);

/**
 * @swagger
 * /api/classes:
 *   post:
 *     summary: Create a new class
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
 *               - grade
 *               - section
 *               - school_id
 *             properties:
 *               grade:
 *                 type: string
 *               section:
 *                 type: string
 *               school_id:
 *                 type: string
 *               class_teacher_id:
 *                 type: string
 *               capacity:
 *                 type: number
 *               academicYear:
 *                 type: string
 *     responses:
 *       201:
 *         description: Class created successfully
 */
router.post('/', authenticate, authorize(['ADMIN', 'SCHOOL_ADMIN']), classController.createClass);

/**
 * @swagger
 * /api/classes/{id}:
 *   put:
 *     summary: Update a class
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               grade:
 *                 type: string
 *               section:
 *                 type: string
 *               class_teacher_id:
 *                 type: string
 *               capacity:
 *                 type: number
 *               academicYear:
 *                 type: string
 *     responses:
 *       200:
 *         description: Class updated successfully
 */
router.put('/:id', authenticate, authorize(['ADMIN', 'SCHOOL_ADMIN']), classController.updateClass);

/**
 * @swagger
 * /api/classes/{id}:
 *   delete:
 *     summary: Delete a class
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Class deleted successfully
 */
router.delete('/:id', authenticate, authorize(['ADMIN', 'SCHOOL_ADMIN']), classController.deleteClass);

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
 *           type: string
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
 *           type: string
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student added to class successfully
 */
router.post('/:classId/students/:studentId', authenticate, authorize(['ADMIN']), classController.addStudentToClass);

export default router;
