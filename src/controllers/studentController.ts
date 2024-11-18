import { Request, Response } from 'express';
import Student from '../models/Student';
import User from '../models/User';

// Get all students
export const getAllStudents = async (req: Request, res: Response) => {
  try {
    // Add pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        error: "Invalid pagination parameters. Page must be >= 1 and limit must be between 1 and 100"
      });
    }

    // Get total count for pagination
    const totalCount = await Student.count();

    // Get students with pagination
    const students = await Student.findAll({
      include: [{
        model: User,
        attributes: ['name', 'email', 'role'],
        required: true // Inner join to ensure user exists
      }],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    if (!students || students.length === 0) {
      return res.status(404).json({
        message: "No students found",
        data: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0
        }
      });
    }

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      message: "Students retrieved successfully",
      data: students,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error in getAllStudents:', error);
    // Check for specific database errors
    if (error instanceof Error) {
      if (error.name === 'SequelizeConnectionError') {
        return res.status(503).json({ error: "Database connection error" });
      }
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ error: "Invalid data format" });
      }
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get student by ID
export const getStudentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Implementation pending
    res.status(200).json({ message: `Get student with ID: ${id}` });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create new student
export const createStudent = async (req: Request, res: Response) => {
  try {
    // Implementation pending
    res.status(201).json({ message: "Create student endpoint" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update student
export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Implementation pending
    res.status(200).json({ message: `Update student with ID: ${id}` });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete student
export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Implementation pending
    res.status(200).json({ message: `Delete student with ID: ${id}` });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};