import { UUID } from 'crypto';

export interface Subject {
    id: UUID;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateSubjectDTO {
    name: string;
}

export interface UpdateSubjectDTO {
    name?: string;
}
