import { Request, Response } from 'express';
import Teacher from '../models/Teacher';
import User from '../models/User';
import Subject from '../models/Subject';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';

// Get all teachers with filtering
export const getAllTeachers = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.query;
    const where: any = {};

    if (schoolId) {
      where.school_id = schoolId;
    }

    const teachers = await Teacher.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Subject,
          as: 'subjects',
          through: { attributes: [] }
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const formattedTeachers = teachers.map(teacher => ({
      id: teacher.id,
      name: teacher.user.name,
      email: teacher.user.email,
      phone: teacher.phone,
      school_id: teacher.school_id,
      subjects: teacher.subjects?.map(subject => ({
        id: subject.id,
        name: subject.name
      })),
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt
    }));

    return res.json({ teachers: formattedTeachers });
  } catch (error) {
    console.error('Error in getAllTeachers:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch teachers',
      details: error.message 
    });
  }
};

// Get teacher by ID
export const getTeacherById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const teacher = await Teacher.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Subject,
          as: 'subjects',
          through: { attributes: [] }
        }
      ]
    });

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const formattedTeacher = {
      id: teacher.id,
      name: teacher.user.name,
      email: teacher.user.email,
      phone: teacher.phone,
      school_id: teacher.school_id,
      subjects: teacher.subjects?.map(subject => ({
        id: subject.id,
        name: subject.name
      })),
      createdAt: teacher.createdAt,
      updatedAt: teacher.updatedAt
    };

    return res.json(formattedTeacher);
  } catch (error) {
    console.error('Error in getTeacherById:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch teacher details',
      details: error.message 
    });
  }
};

// Create new teacher
export const createTeacher = async (req: Request, res: Response) => {
  try {
    const { 
      name,
      email,
      phone,
      school_id,
      subjects
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !school_id) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'name, email, phone, and school_id are required'
      });
    }

    // Check if teacher with email already exists
    const existingTeacher = await Teacher.findOne({
      include: [{
        model: User,
        as: 'user',
        where: { email }
      }]
    });

    if (existingTeacher) {
      return res.status(409).json({
        error: 'Teacher already exists',
        details: 'A teacher with this email already exists'
      });
    }

    // Create user first
    const user = await User.create({
      id: uuidv4(),
      name,
      email,
      role: 'TEACHER',
      status: 'ACTIVE'
    });

    // Create teacher
    const teacher = await Teacher.create({
      id: uuidv4(),
      user_id: user.id,
      school_id,
      phone
    });

    // Add subjects if provided
    if (subjects && subjects.length > 0) {
      await teacher.setSubjects(subjects);
    }

    const createdTeacher = await Teacher.findByPk(teacher.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Subject,
          as: 'subjects',
          through: { attributes: [] }
        }
      ]
    });

    return res.status(201).json({
      id: createdTeacher.id,
      name: createdTeacher.user.name,
      email: createdTeacher.user.email,
      phone: createdTeacher.phone,
      school_id: createdTeacher.school_id,
      subjects: createdTeacher.subjects?.map(subject => ({
        id: subject.id,
        name: subject.name
      })),
      createdAt: createdTeacher.createdAt,
      updatedAt: createdTeacher.updatedAt
    });
  } catch (error) {
    console.error('Error in createTeacher:', error);
    return res.status(500).json({ 
      error: 'Failed to create teacher',
      details: error.message 
    });
  }
};

// Update teacher
export const updateTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      subjects
    } = req.body;

    const teacher = await Teacher.findByPk(id, {
      include: [{
        model: User,
        as: 'user'
      }]
    });

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Check if email is being changed and if it's already in use
    if (email && email !== teacher.user.email) {
      const existingTeacher = await Teacher.findOne({
        include: [{
          model: User,
          as: 'user',
          where: { 
            email,
            id: { [Op.ne]: teacher.user.id }
          }
        }]
      });

      if (existingTeacher) {
        return res.status(409).json({
          error: 'Email already in use',
          details: 'This email is already registered to another teacher'
        });
      }
    }

    // Update user information
    if (name || email) {
      await teacher.user.update({
        name: name || teacher.user.name,
        email: email || teacher.user.email
      });
    }

    // Update teacher information
    if (phone) {
      await teacher.update({ phone });
    }

    // Update subjects if provided
    if (subjects) {
      await teacher.setSubjects(subjects);
    }

    const updatedTeacher = await Teacher.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Subject,
          as: 'subjects',
          through: { attributes: [] }
        }
      ]
    });

    return res.json({
      id: updatedTeacher.id,
      name: updatedTeacher.user.name,
      email: updatedTeacher.user.email,
      phone: updatedTeacher.phone,
      school_id: updatedTeacher.school_id,
      subjects: updatedTeacher.subjects?.map(subject => ({
        id: subject.id,
        name: subject.name
      })),
      createdAt: updatedTeacher.createdAt,
      updatedAt: updatedTeacher.updatedAt
    });
  } catch (error) {
    console.error('Error in updateTeacher:', error);
    return res.status(500).json({ 
      error: 'Failed to update teacher',
      details: error.message 
    });
  }
};

// Delete teacher
export const deleteTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const teacher = await Teacher.findByPk(id, {
      include: [{
        model: User,
        as: 'user'
      }]
    });

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Delete associated user
    await teacher.user.destroy();
    
    // Teacher will be automatically deleted due to CASCADE
    return res.status(204).send();
  } catch (error) {
    console.error('Error in deleteTeacher:', error);
    return res.status(500).json({ 
      error: 'Failed to delete teacher',
      details: error.message 
    });
  }
};

// Add subjects to teacher
export const addSubjectsToTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { subjectIds } = req.body;

    if (!subjectIds || !Array.isArray(subjectIds)) {
      return res.status(400).json({
        error: 'Invalid request',
        details: 'subjectIds must be an array of subject IDs'
      });
    }

    const teacher = await Teacher.findByPk(id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Verify all subjects exist and belong to the same school
    const subjects = await Subject.findAll({
      where: {
        id: subjectIds,
        school_id: teacher.school_id
      }
    });

    if (subjects.length !== subjectIds.length) {
      return res.status(400).json({
        error: 'Invalid subjects',
        details: 'One or more subjects do not exist or do not belong to the teacher\'s school'
      });
    }

    // Add subjects to teacher
    await teacher.addSubjects(subjectIds);

    const updatedTeacher = await Teacher.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Subject,
          as: 'subjects',
          through: { attributes: [] }
        }
      ]
    });

    return res.json({
      id: updatedTeacher.id,
      name: updatedTeacher.user.name,
      email: updatedTeacher.user.email,
      phone: updatedTeacher.phone,
      school_id: updatedTeacher.school_id,
      subjects: updatedTeacher.subjects?.map(subject => ({
        id: subject.id,
        name: subject.name
      }))
    });
  } catch (error) {
    console.error('Error in addSubjectsToTeacher:', error);
    return res.status(500).json({
      error: 'Failed to add subjects to teacher',
      details: error.message
    });
  }
};

// Remove subjects from teacher
export const removeSubjectsFromTeacher = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { subjectIds } = req.body;

    if (!subjectIds || !Array.isArray(subjectIds)) {
      return res.status(400).json({
        error: 'Invalid request',
        details: 'subjectIds must be an array of subject IDs'
      });
    }

    const teacher = await Teacher.findByPk(id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Remove subjects from teacher
    await teacher.removeSubjects(subjectIds);

    const updatedTeacher = await Teacher.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Subject,
          as: 'subjects',
          through: { attributes: [] }
        }
      ]
    });

    return res.json({
      id: updatedTeacher.id,
      name: updatedTeacher.user.name,
      email: updatedTeacher.user.email,
      phone: updatedTeacher.phone,
      school_id: updatedTeacher.school_id,
      subjects: updatedTeacher.subjects?.map(subject => ({
        id: subject.id,
        name: subject.name
      }))
    });
  } catch (error) {
    console.error('Error in removeSubjectsFromTeacher:', error);
    return res.status(500).json({
      error: 'Failed to remove subjects from teacher',
      details: error.message
    });
  }
};

// Get teacher's subjects
export const getTeacherSubjects = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const teacher = await Teacher.findByPk(id, {
      include: [
        {
          model: Subject,
          as: 'subjects',
          through: { attributes: [] }
        }
      ]
    });

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    return res.json({
      subjects: teacher.subjects?.map(subject => ({
        id: subject.id,
        name: subject.name,
        description: subject.description,
        credits: subject.credits
      }))
    });
  } catch (error) {
    console.error('Error in getTeacherSubjects:', error);
    return res.status(500).json({
      error: 'Failed to get teacher subjects',
      details: error.message
    });
  }
};
