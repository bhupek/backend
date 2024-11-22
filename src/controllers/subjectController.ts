import { Request, Response } from 'express';
import Subject from '../models/Subject';
import School from '../models/School';
import { AppError, catchAsync } from '../utils/errorHandler';
import { validateRequest } from '../middleware/validate';
import { z } from 'zod';

// Validation schemas
const bulkCreateSubjectSchema = z.object({
  body: z.object({
    subjects: z.array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        credits: z.number().optional(),
        school_id: z.string(),
      })
    ),
  }),
});

// Get all subjects
export const getAllSubjects = catchAsync(async (req: Request, res: Response) => {
  const { schoolId } = req.query;

  if (!schoolId) {
    throw new AppError('School ID is required', 400);
  }

  const subjects = await Subject.findAll({
    where: { school_id: schoolId },
    include: [
      {
        model: School,
        as: 'school',
        attributes: ['id', 'name']
      }
    ]
  });

  res.status(200).json({
    status: 'success',
    data: {
      subjects
    }
  });
});

// Get subject by ID
export const getSubjectById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const subject = await Subject.findByPk(id, {
    include: [
      {
        model: School,
        as: 'school',
        attributes: ['id', 'name']
      }
    ]
  });

  if (!subject) {
    throw new AppError('Subject not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      subject
    }
  });
});

// Create new subject
export const createSubject = catchAsync(async (req: Request, res: Response) => {
  const { name, description, credits, school_id } = req.body;

  if (!name || !school_id) {
    throw new AppError('Name and school_id are required', 400);
  }

  // Check if school exists
  const school = await School.findByPk(school_id);
  if (!school) {
    throw new AppError('School not found', 404);
  }

  // Check if subject with same name exists in the school
  const existingSubject = await Subject.findOne({
    where: {
      name,
      school_id
    }
  });

  if (existingSubject) {
    throw new AppError('Subject already exists in this school', 400);
  }

  const subject = await Subject.create({
    name,
    description,
    credits,
    school_id
  });

  res.status(201).json({
    status: 'success',
    data: {
      subject
    }
  });
});

// Bulk create subjects
export const bulkCreateSubjects = catchAsync(async (req: Request, res: Response) => {
  const { subjects } = req.body;

  // Validate required fields
  if (!subjects || !Array.isArray(subjects)) {
    throw new AppError('subjects is required and must be an array', 400);
  }

  // Validate each subject
  for (const subject of subjects) {
    if (!subject.name || !subject.school_id) {
      throw new AppError('name and school_id are required for each subject', 400);
    }
  }

  // Create all subjects in a transaction
  const createdSubjects = await Subject.bulkCreate(subjects, {
    validate: true,
    returning: true,
  });

  res.status(201).json({
    status: 'success',
    data: {
      subjects: createdSubjects,
    },
  });
});

// Update subject
export const updateSubject = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, credits } = req.body;

  const subject = await Subject.findByPk(id);
  if (!subject) {
    throw new AppError('Subject not found', 404);
  }

  // Check if updated name conflicts with existing subject
  if (name && name !== subject.name) {
    const existingSubject = await Subject.findOne({
      where: {
        name,
        school_id: subject.school_id,
        id: { [Op.ne]: id }
      }
    });

    if (existingSubject) {
      throw new AppError('Subject name already exists in this school', 400);
    }
  }

  await subject.update({
    name: name || subject.name,
    description: description || subject.description,
    credits: credits || subject.credits
  });

  res.status(200).json({
    status: 'success',
    data: {
      subject
    }
  });
});

// Delete subject
export const deleteSubject = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const subject = await Subject.findByPk(id);
  if (!subject) {
    throw new AppError('Subject not found', 404);
  }

  await subject.destroy();

  res.status(204).json({
    status: 'success',
    data: null
  });
});
