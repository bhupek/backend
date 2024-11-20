import express from 'express';
import multer from 'multer';
import { AssignmentController } from '../controllers/AssignmentController';
import { AssignmentService } from '../services/AssignmentService';
import { Pool } from 'pg';
import { authenticateToken } from '../middleware/auth';
import config from '../config';

// Create database pool
const pool = new Pool(config.database);

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        // Allow only images and PDFs
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 10 // Maximum 10 files per request
    }
});

// Initialize services and controller
const assignmentService = new AssignmentService(pool);
const assignmentController = new AssignmentController(assignmentService);

// Create router
const router = express.Router();

/**
 * @swagger
 * /api/assignments:
 *   post:
 *     summary: Create a new assignment
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - classId
 *               - subjectId
 *               - assignmentDate
 *               - description
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [classwork, homework]
 *               classId:
 *                 type: string
 *                 format: uuid
 *               subjectId:
 *                 type: string
 *                 format: uuid
 *               assignmentDate:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Assignment created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post('/', 
    authenticateToken, 
    (req, res, next) => {
        upload.array('files', 10)(req, res, (err) => {
            if (err) {
                return res.status(400).send({ message: 'Error uploading files' });
            }
            next();
        });
    }, 
    assignmentController.createAssignment.bind(assignmentController)
);

/**
 * @swagger
 * /api/assignments:
 *   get:
 *     summary: Get all assignments
 *     tags: [Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *         description: Filter by class ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by assignment type
 *     responses:
 *       200:
 *         description: List of assignments
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateToken, assignmentController.getAssignments.bind(assignmentController));

/**
 * @swagger
 * /api/assignments/{id}:
 *   get:
 *     summary: Get assignment by ID
 *     tags: [Assignments]
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
 *         description: Assignment details
 *       404:
 *         description: Assignment not found
 */
router.get('/:id', authenticateToken, assignmentController.getAssignment.bind(assignmentController));

/**
 * @swagger
 * /api/assignments/{id}:
 *   put:
 *     summary: Update assignment
 *     tags: [Assignments]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Assignment updated successfully
 *       404:
 *         description: Assignment not found
 */
router.put('/:id', authenticateToken, ...assignmentController.updateAssignment);

/**
 * @swagger
 * /api/assignments/{id}:
 *   delete:
 *     summary: Delete assignment
 *     tags: [Assignments]
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
 *         description: Assignment deleted successfully
 *       404:
 *         description: Assignment not found
 */
router.delete('/:id', authenticateToken, assignmentController.deleteAssignment.bind(assignmentController));

export default router;
