import { Request, Response } from 'express';
import Class from '../models/Class';
import Teacher from '../models/Teacher';
import User from '../models/User';
import Subject from '../models/Subject';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';

// Get all classes with pagination and filtering
export const getAllClasses = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.query;
    const where: any = {};

    if (schoolId) {
      where.school_id = schoolId;
    }

    const classes = await Class.findAll({
      where,
      include: [
        {
          model: Teacher,
          as: 'classTeacher',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name']
          }]
        },
        {
          model: Subject,
          as: 'subjects',
          through: { attributes: [] }
        }
      ],
      order: [['grade', 'ASC'], ['section', 'ASC']]
    });

    const formattedClasses = classes.map(cls => ({
      id: cls.id,
      grade: cls.grade,
      section: cls.section,
      school_id: cls.school_id,
      class_teacher_id: cls.class_teacher_id,
      classTeacher: cls.classTeacher ? {
        id: cls.classTeacher.id,
        name: cls.classTeacher.user.name
      } : undefined,
      subjects: cls.subjects?.map(subject => ({
        id: subject.id,
        name: subject.name
      })),
      capacity: cls.capacity,
      academicYear: cls.academicYear,
      status: cls.status,
      createdAt: cls.createdAt,
      updatedAt: cls.updatedAt
    }));

    return res.json({ classes: formattedClasses });
  } catch (error) {
    console.error('Error in getAllClasses:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch classes',
      details: error.message 
    });
  }
};

// Get class by ID
export const getClassById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const classData = await Class.findByPk(id, {
      include: [
        {
          model: Teacher,
          as: 'classTeacher',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name']
          }]
        },
        {
          model: Subject,
          as: 'subjects',
          through: { attributes: [] }
        }
      ]
    });

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const formattedClass = {
      id: classData.id,
      grade: classData.grade,
      section: classData.section,
      school_id: classData.school_id,
      class_teacher_id: classData.class_teacher_id,
      classTeacher: classData.classTeacher ? {
        id: classData.classTeacher.id,
        name: classData.classTeacher.user.name
      } : undefined,
      subjects: classData.subjects?.map(subject => ({
        id: subject.id,
        name: subject.name
      })),
      capacity: classData.capacity,
      academicYear: classData.academicYear,
      status: classData.status,
      createdAt: classData.createdAt,
      updatedAt: classData.updatedAt
    };

    return res.json(formattedClass);
  } catch (error) {
    console.error('Error in getClassById:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch class details',
      details: error.message 
    });
  }
};

// Create new class
export const createClass = async (req: Request, res: Response) => {
  try {
    const { 
      grade,
      section,
      school_id,
      class_teacher_id,
      capacity,
      academicYear
    } = req.body;

    // Validate required fields
    if (!grade || !section || !school_id) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'grade, section, and school_id are required'
      });
    }

    // Check if class already exists in the school
    const existingClass = await Class.findOne({
      where: {
        grade,
        section,
        school_id
      }
    });

    if (existingClass) {
      return res.status(409).json({
        error: 'Class already exists',
        details: `Grade ${grade} Section ${section} already exists in this school`
      });
    }

    // Validate teacher if provided
    if (class_teacher_id) {
      const teacher = await Teacher.findByPk(class_teacher_id);
      if (!teacher) {
        return res.status(404).json({
          error: 'Teacher not found',
          details: 'The specified class teacher does not exist'
        });
      }
    }

    const newClass = await Class.create({
      id: uuidv4(),
      grade,
      section,
      school_id,
      class_teacher_id,
      capacity,
      academicYear,
      status: 'ACTIVE'
    });

    const createdClass = await Class.findByPk(newClass.id, {
      include: [
        {
          model: Teacher,
          as: 'classTeacher',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name']
          }]
        }
      ]
    });

    return res.status(201).json({
      id: createdClass.id,
      grade: createdClass.grade,
      section: createdClass.section,
      school_id: createdClass.school_id,
      class_teacher_id: createdClass.class_teacher_id,
      classTeacher: createdClass.classTeacher ? {
        id: createdClass.classTeacher.id,
        name: createdClass.classTeacher.user.name
      } : undefined,
      capacity: createdClass.capacity,
      academicYear: createdClass.academicYear,
      status: createdClass.status,
      createdAt: createdClass.createdAt,
      updatedAt: createdClass.updatedAt
    });
  } catch (error) {
    console.error('Error in createClass:', error);
    return res.status(500).json({ 
      error: 'Failed to create class',
      details: error.message 
    });
  }
};

// Update class
export const updateClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      grade,
      section,
      class_teacher_id,
      capacity,
      academicYear,
      status
    } = req.body;

    const classData = await Class.findByPk(id);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Validate teacher if provided
    if (class_teacher_id) {
      const teacher = await Teacher.findByPk(class_teacher_id);
      if (!teacher) {
        return res.status(404).json({
          error: 'Teacher not found',
          details: 'The specified class teacher does not exist'
        });
      }
    }

    // Check if updated grade/section combination already exists
    if (grade || section) {
      const existingClass = await Class.findOne({
        where: {
          grade: grade || classData.grade,
          section: section || classData.section,
          school_id: classData.school_id,
          id: { [Op.ne]: id }
        }
      });

      if (existingClass) {
        return res.status(409).json({
          error: 'Class already exists',
          details: `Grade ${grade || classData.grade} Section ${section || classData.section} already exists in this school`
        });
      }
    }

    await classData.update({
      grade: grade || classData.grade,
      section: section || classData.section,
      class_teacher_id: class_teacher_id !== undefined ? class_teacher_id : classData.class_teacher_id,
      capacity: capacity !== undefined ? capacity : classData.capacity,
      academicYear: academicYear || classData.academicYear,
      status: status || classData.status
    });

    const updatedClass = await Class.findByPk(id, {
      include: [
        {
          model: Teacher,
          as: 'classTeacher',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name']
          }]
        },
        {
          model: Subject,
          as: 'subjects',
          through: { attributes: [] }
        }
      ]
    });

    return res.json({
      id: updatedClass.id,
      grade: updatedClass.grade,
      section: updatedClass.section,
      school_id: updatedClass.school_id,
      class_teacher_id: updatedClass.class_teacher_id,
      classTeacher: updatedClass.classTeacher ? {
        id: updatedClass.classTeacher.id,
        name: updatedClass.classTeacher.user.name
      } : undefined,
      subjects: updatedClass.subjects?.map(subject => ({
        id: subject.id,
        name: subject.name
      })),
      capacity: updatedClass.capacity,
      academicYear: updatedClass.academicYear,
      status: updatedClass.status,
      createdAt: updatedClass.createdAt,
      updatedAt: updatedClass.updatedAt
    });
  } catch (error) {
    console.error('Error in updateClass:', error);
    return res.status(500).json({ 
      error: 'Failed to update class',
      details: error.message 
    });
  }
};

// Delete class
export const deleteClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const classData = await Class.findByPk(id);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    await classData.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error('Error in deleteClass:', error);
    return res.status(500).json({ 
      error: 'Failed to delete class',
      details: error.message 
    });
  }
};

// Get students in a class
export const getClassStudents = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const classData = await Class.findByPk(id, {
      include: ['students']
    });

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    return res.json({ students: classData.students });
  } catch (error) {
    console.error('Error in getClassStudents:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch class students',
      details: error.message 
    });
  }
};

// Add student to class
export const addStudentToClass = async (req: Request, res: Response) => {
  try {
    const { classId, studentId } = req.params;

    const classData = await Class.findByPk(classId);
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    await classData.addStudent(studentId);
    return res.json({ message: 'Student added to class successfully' });
  } catch (error) {
    console.error('Error in addStudentToClass:', error);
    return res.status(500).json({ 
      error: 'Failed to add student to class',
      details: error.message 
    });
  }
};

// Bulk create classes
export const bulkCreateClasses = catchAsync(async (req: Request, res: Response) => {
  const { classes } = req.body;

  // Validate required fields
  if (!classes || !Array.isArray(classes)) {
    throw new AppError('classes is required and must be an array', 400);
  }

  // Validate each class
  for (const cls of classes) {
    if (!cls.grade || !cls.section || !cls.school_id) {
      throw new AppError('grade, section, and school_id are required for each class', 400);
    }
  }

  // Create all classes in a transaction
  const createdClasses = await Class.bulkCreate(classes, {
    validate: true,
    returning: true,
  });

  res.status(201).json({
    status: 'success',
    data: {
      classes: createdClasses,
    },
  });
});