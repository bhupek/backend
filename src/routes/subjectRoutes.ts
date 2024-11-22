import express from 'express';
import {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../controllers/subjectController';
import { authenticate } from '../middleware/authentication';
import { authorize, authorizeSchool } from '../middleware/authorization';

const router = express.Router();

/**
 * @swagger
 * /api/subjects:
 *   get:
 *     summary: Get all subjects for a school
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: schoolId
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the school
 *     responses:
 *       200:
 *         description: List of subjects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     subjects:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Subject'
 */
router.get('/', authenticate, authorizeSchool, getAllSubjects);

/**
 * @swagger
 * /api/subjects/{id}:
 *   get:
 *     summary: Get a subject by ID
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the subject
 *     responses:
 *       200:
 *         description: Subject details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     subject:
 *                       $ref: '#/components/schemas/Subject'
 */
router.get('/:id', authenticate, authorizeSchool, getSubjectById);

/**
 * @swagger
 * /api/subjects:
 *   post:
 *     summary: Create a new subject
 *     tags: [Subjects]
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
 *               - school_id
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               credits:
 *                 type: number
 *               school_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subject created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     subject:
 *                       $ref: '#/components/schemas/Subject'
 */
router.post(
  '/',
  authenticate,
  authorize(['ADMIN', 'SCHOOL_ADMIN']),
  authorizeSchool,
  createSubject
);

/**
 * @swagger
 * /api/subjects/{id}:
 *   put:
 *     summary: Update a subject
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the subject
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               credits:
 *                 type: number
 *     responses:
 *       200:
 *         description: Subject updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     subject:
 *                       $ref: '#/components/schemas/Subject'
 */
router.put(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'SCHOOL_ADMIN']),
  authorizeSchool,
  updateSubject
);

/**
 * @swagger
 * /api/subjects/{id}:
 *   delete:
 *     summary: Delete a subject
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID of the subject
 *     responses:
 *       204:
 *         description: Subject deleted successfully
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN', 'SCHOOL_ADMIN']),
  authorizeSchool,
  deleteSubject
);

export default router;
