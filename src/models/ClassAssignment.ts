import { UUID } from 'crypto';
import { Subject } from './Subject';

export type AssignmentType = 'classwork' | 'homework';

export interface ClassAssignment {
    id: UUID;
    type: AssignmentType;
    classId: UUID;
    subjectId: UUID;
    schoolId: UUID;
    assignmentDate: Date;
    description: string;
    createdBy: UUID;
    createdAt: Date;
    updatedAt: Date;
    files?: AssignmentFile[];
    subject?: Subject;
}

export interface AssignmentFile {
    id: UUID;
    assignmentId: UUID;
    fileUrl: string;
    fileType: string;
    fileName: string;
    schoolId: UUID;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateClassAssignmentDTO {
    type: AssignmentType;
    classId: UUID;
    subjectId: UUID;
    schoolId: UUID;
    assignmentDate: string;
    description: string;
    files?: Express.Multer.File[];
}

export interface UpdateClassAssignmentDTO {
    type?: AssignmentType;
    classId?: UUID;
    subjectId?: UUID;
    schoolId?: UUID;
    assignmentDate?: string;
    description?: string;
    filesToAdd?: Express.Multer.File[];
    fileIdsToRemove?: UUID[];
}
