import { UUID } from 'crypto';
import { Pool } from 'pg';
import { ClassAssignment, CreateClassAssignmentDTO, UpdateClassAssignmentDTO, AssignmentFile } from '../models/ClassAssignment';
import fileStorageService from './FileStorageService';
import logger from '../utils/logger';
import { AppError } from '../utils/AppError';

export class AssignmentService {
    constructor(private db: Pool) {}

    private async validateAssignment(classId: UUID, subjectId: UUID, schoolId: UUID): Promise<void> {
        // Check if class exists and belongs to the school
        const classResult = await this.db.query(
            'SELECT id FROM classes WHERE id = $1 AND school_id = $2',
            [classId, schoolId]
        );
        if (classResult.rows.length === 0) {
            throw new AppError('Class not found or does not belong to the school', 404);
        }

        // Check if subject exists and belongs to the school
        const subjectResult = await this.db.query(
            'SELECT id FROM subjects WHERE id = $1 AND school_id = $2',
            [subjectId, schoolId]
        );
        if (subjectResult.rows.length === 0) {
            throw new AppError('Subject not found or does not belong to the school', 404);
        }
    }

    async createAssignment(dto: CreateClassAssignmentDTO, userId: UUID): Promise<ClassAssignment> {
        logger.info('Creating new assignment', { dto });
        
        try {
            await this.validateAssignment(dto.classId, dto.subjectId, dto.schoolId);

            // Start transaction
            await this.db.query('BEGIN');

            // Create assignment
            const result = await this.db.query(
                `INSERT INTO class_assignments 
                (type, class_id, subject_id, school_id, assignment_date, description, created_by)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *`,
                [dto.type, dto.classId, dto.subjectId, dto.schoolId, dto.assignmentDate, dto.description, userId]
            );

            const assignment = result.rows[0];

            // Handle file uploads if any
            if (dto.files && dto.files.length > 0) {
                for (const file of dto.files) {
                    const fileUrl = await fileStorageService.uploadFile(file);
                    await this.db.query(
                        `INSERT INTO assignment_files 
                        (assignment_id, file_url, file_type, file_name, school_id)
                        VALUES ($1, $2, $3, $4, $5)`,
                        [assignment.id, fileUrl, file.mimetype, file.originalname, dto.schoolId]
                    );
                }
            }

            // Commit transaction
            await this.db.query('COMMIT');

            logger.info('Assignment created successfully', { assignmentId: assignment.id });
            return this.getAssignmentById(assignment.id, dto.schoolId);

        } catch (error) {
            await this.db.query('ROLLBACK');
            logger.error('Error creating assignment:', error);
            throw error instanceof AppError ? error : new AppError('Failed to create assignment', 500);
        }
    }

    async getAssignmentById(id: UUID, schoolId: UUID): Promise<ClassAssignment> {
        try {
            const result = await this.db.query(
                `SELECT a.*, json_agg(f.*) as files
                FROM class_assignments a
                LEFT JOIN assignment_files f ON a.id = f.assignment_id
                WHERE a.id = $1 AND a.school_id = $2
                GROUP BY a.id`,
                [id, schoolId]
            );

            if (result.rows.length === 0) {
                throw new AppError('Assignment not found', 404);
            }

            logger.info('Assignment retrieved successfully', { assignmentId: id });
            return result.rows[0];
        } catch (error) {
            logger.error('Error retrieving assignment:', error);
            throw error instanceof AppError ? error : new AppError('Failed to retrieve assignment', 500);
        }
    }

    async updateAssignment(id: UUID, schoolId: UUID, dto: UpdateClassAssignmentDTO): Promise<ClassAssignment> {
        logger.info('Updating assignment', { id, dto });

        try {
            // Verify assignment exists and belongs to the school
            const existingAssignment = await this.getAssignmentById(id, schoolId);

            if (dto.classId || dto.subjectId) {
                await this.validateAssignment(
                    dto.classId || existingAssignment.classId,
                    dto.subjectId || existingAssignment.subjectId,
                    schoolId
                );
            }

            await this.db.query('BEGIN');

            // Update assignment details
            const updateFields: string[] = [];
            const values: any[] = [];
            let valueIndex = 1;

            if (dto.type) {
                updateFields.push(`type = $${valueIndex}`);
                values.push(dto.type);
                valueIndex++;
            }
            if (dto.classId) {
                updateFields.push(`class_id = $${valueIndex}`);
                values.push(dto.classId);
                valueIndex++;
            }
            if (dto.subjectId) {
                updateFields.push(`subject_id = $${valueIndex}`);
                values.push(dto.subjectId);
                valueIndex++;
            }
            if (dto.assignmentDate) {
                updateFields.push(`assignment_date = $${valueIndex}`);
                values.push(dto.assignmentDate);
                valueIndex++;
            }
            if (dto.description) {
                updateFields.push(`description = $${valueIndex}`);
                values.push(dto.description);
                valueIndex++;
            }

            if (updateFields.length > 0) {
                values.push(id, schoolId);
                await this.db.query(
                    `UPDATE class_assignments 
                    SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = $${valueIndex} AND school_id = $${valueIndex + 1}`,
                    values
                );
            }

            // Handle file additions
            if (dto.filesToAdd && dto.filesToAdd.length > 0) {
                for (const file of dto.filesToAdd) {
                    const fileUrl = await fileStorageService.uploadFile(file);
                    await this.db.query(
                        `INSERT INTO assignment_files 
                        (assignment_id, file_url, file_type, file_name, school_id)
                        VALUES ($1, $2, $3, $4, $5)`,
                        [id, fileUrl, file.mimetype, file.originalname, schoolId]
                    );
                }
            }

            // Handle file deletions
            if (dto.fileIdsToRemove && dto.fileIdsToRemove.length > 0) {
                const filesToDelete = await this.db.query(
                    'SELECT file_url FROM assignment_files WHERE id = ANY($1) AND school_id = $2',
                    [dto.fileIdsToRemove, schoolId]
                );

                for (const file of filesToDelete.rows) {
                    await fileStorageService.deleteFile(file.file_url);
                }

                await this.db.query(
                    'DELETE FROM assignment_files WHERE id = ANY($1) AND school_id = $2',
                    [dto.fileIdsToRemove, schoolId]
                );
            }

            await this.db.query('COMMIT');

            logger.info('Assignment updated successfully', { assignmentId: id });
            return this.getAssignmentById(id, schoolId);

        } catch (error) {
            await this.db.query('ROLLBACK');
            logger.error('Error updating assignment:', error);
            throw error instanceof AppError ? error : new AppError('Failed to update assignment', 500);
        }
    }

    async deleteAssignment(id: UUID, schoolId: UUID): Promise<void> {
        logger.info('Deleting assignment', { id });

        try {
            await this.db.query('BEGIN');

            // Get all file URLs before deleting
            const files = await this.db.query(
                'SELECT file_url FROM assignment_files WHERE assignment_id = $1 AND school_id = $2',
                [id, schoolId]
            );

            // Delete files from storage
            for (const file of files.rows) {
                await fileStorageService.deleteFile(file.file_url);
            }

            // Delete assignment (cascade will handle file records)
            const result = await this.db.query(
                'DELETE FROM class_assignments WHERE id = $1 AND school_id = $2',
                [id, schoolId]
            );

            if (result.rowCount === 0) {
                throw new AppError('Assignment not found or does not belong to the school', 404);
            }

            await this.db.query('COMMIT');
            logger.info('Assignment deleted successfully', { assignmentId: id });

        } catch (error) {
            await this.db.query('ROLLBACK');
            logger.error('Error deleting assignment:', error);
            throw error instanceof AppError ? error : new AppError('Failed to delete assignment', 500);
        }
    }

    async getAssignments(
        schoolId: UUID,
        classId?: UUID,
        subjectId?: UUID,
        type?: string,
        startDate?: string,
        endDate?: string,
        page: number = 1,
        limit: number = 10
    ): Promise<{ assignments: ClassAssignment[]; total: number }> {
        try {
            const conditions: string[] = ['school_id = $1'];
            const values: any[] = [schoolId];
            let valueIndex = 2;

            if (classId) {
                conditions.push(`class_id = $${valueIndex}`);
                values.push(classId);
                valueIndex++;
            }
            if (subjectId) {
                conditions.push(`subject_id = $${valueIndex}`);
                values.push(subjectId);
                valueIndex++;
            }
            if (type) {
                conditions.push(`type = $${valueIndex}`);
                values.push(type);
                valueIndex++;
            }
            if (startDate) {
                conditions.push(`assignment_date >= $${valueIndex}`);
                values.push(startDate);
                valueIndex++;
            }
            if (endDate) {
                conditions.push(`assignment_date <= $${valueIndex}`);
                values.push(endDate);
                valueIndex++;
            }

            const whereClause = `WHERE ${conditions.join(' AND ')}`;
            
            // Get total count
            const countResult = await this.db.query(
                `SELECT COUNT(*) FROM class_assignments ${whereClause}`,
                values
            );
            const total = parseInt(countResult.rows[0].count);

            // Get paginated results
            const offset = (page - 1) * limit;
            const paginatedValues = [...values, limit, offset];
            
            const result = await this.db.query(
                `SELECT a.*, json_agg(f.*) as files
                FROM class_assignments a
                LEFT JOIN assignment_files f ON a.id = f.assignment_id
                ${whereClause}
                GROUP BY a.id
                ORDER BY a.created_at DESC
                LIMIT $${valueIndex} OFFSET $${valueIndex + 1}`,
                paginatedValues
            );

            logger.info('Assignments retrieved successfully', {
                filters: { schoolId, classId, subjectId, type, startDate, endDate },
                page,
                limit,
                total
            });

            return {
                assignments: result.rows,
                total
            };
        } catch (error) {
            logger.error('Error retrieving assignments:', error);
            throw new AppError('Failed to retrieve assignments', 500);
        }
    }
}
