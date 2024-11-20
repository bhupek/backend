import { Request, Response, NextFunction } from 'express';
import { UUID } from 'crypto';
import multer from 'multer';
import { AssignmentService } from '../services/AssignmentService';
import { CreateClassAssignmentDTO, UpdateClassAssignmentDTO } from '../models/ClassAssignment';
import logger from '../utils/logger';
import { AppError } from '../utils/AppError';

// Configure multer for memory storage
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

export class AssignmentController {
    constructor(private assignmentService: AssignmentService) {}

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
    async createAssignment(req: Request, res: Response, next: NextFunction) {
        try {
            const files = req.files as Express.Multer.File[];
            const dto: CreateClassAssignmentDTO = {
                type: req.body.type,
                classId: req.body.classId,
                subjectId: req.body.subjectId,
                schoolId: (req.user as any).schoolId,
                assignmentDate: req.body.assignmentDate,
                description: req.body.description,
                files
            };

            const userId = (req.user as any).id;
            const result = await this.assignmentService.createAssignment(dto, userId);
            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

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
     *           format: uuid
     *     responses:
     *       200:
     *         description: Assignment details
     *       404:
     *         description: Assignment not found
     */
    getAssignment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.assignmentService.getAssignmentById(
                req.params.id as UUID,
                (req.user as any).schoolId
            );
            res.json(result);
        } catch (error) {
            next(error);
        }
    };

    /**
     * @swagger
     * /api/assignments/{id}:
     *   put:
     *     summary: Update an assignment
     *     tags: [Assignments]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
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
     *               filesToAdd:
     *                 type: array
     *                 items:
     *                   type: string
     *                   format: binary
     *               fileIdsToRemove:
     *                 type: array
     *                 items:
     *                   type: string
     *                   format: uuid
     *     responses:
     *       200:
     *         description: Assignment updated successfully
     *       404:
     *         description: Assignment not found
     */
    updateAssignment = [
        upload.array('filesToAdd', 10),
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const files = req.files as Express.Multer.File[];
                const dto: UpdateClassAssignmentDTO = {
                    ...req.body,
                    filesToAdd: files,
                    fileIdsToRemove: req.body.fileIdsToRemove 
                        ? JSON.parse(req.body.fileIdsToRemove)
                        : undefined
                };

                const result = await this.assignmentService.updateAssignment(
                    req.params.id as UUID,
                    (req.user as any).schoolId,
                    dto
                );
                res.json(result);
            } catch (error) {
                next(error);
            }
        }
    ];

    /**
     * @swagger
     * /api/assignments/{id}:
     *   delete:
     *     summary: Delete an assignment
     *     tags: [Assignments]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *     responses:
     *       204:
     *         description: Assignment deleted successfully
     *       404:
     *         description: Assignment not found
     */
    deleteAssignment = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.assignmentService.deleteAssignment(
                req.params.id as UUID,
                (req.user as any).schoolId
            );
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    /**
     * @swagger
     * /api/assignments:
     *   get:
     *     summary: Get assignments with filters and pagination
     *     tags: [Assignments]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: classId
     *         schema:
     *           type: string
     *           format: uuid
     *       - in: query
     *         name: subjectId
     *         schema:
     *           type: string
     *           format: uuid
     *       - in: query
     *         name: type
     *         schema:
     *           type: string
     *           enum: [classwork, homework]
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
     *         name: page
     *         schema:
     *           type: integer
     *           minimum: 1
     *           default: 1
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 100
     *           default: 10
     *     responses:
     *       200:
     *         description: List of assignments
     */
    getAssignments = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const {
                classId,
                subjectId,
                type,
                startDate,
                endDate,
                page = 1,
                limit = 10
            } = req.query;

            const result = await this.assignmentService.getAssignments(
                (req.user as any).schoolId,
                classId as UUID,
                subjectId as UUID,
                type as string,
                startDate as string,
                endDate as string,
                Number(page),
                Number(limit)
            );

            res.json(result);
        } catch (error) {
            next(error);
        }
    };
}
