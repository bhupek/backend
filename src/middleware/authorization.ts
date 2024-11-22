import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errorHandler';

// Define allowed roles
export type UserRole = 'ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        school_id?: string;
      };
    }
  }
}

/**
 * Authorization middleware factory
 * @param allowedRoles Array of roles that are allowed to access the route
 * @returns Middleware function that checks if user has required role
 */
export const authorize = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};

/**
 * School-specific authorization middleware
 * Checks if user belongs to the same school as the resource
 */
export const authorizeSchool = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('User not authenticated', 401));
  }

  // ADMIN can access all schools
  if (req.user.role === 'ADMIN') {
    return next();
  }

  const schoolId = req.params.schoolId || req.body.school_id || req.query.schoolId;

  if (!schoolId) {
    return next(new AppError('School ID is required', 400));
  }

  if (req.user.school_id !== schoolId) {
    return next(new AppError('You do not have permission to access this school\'s resources', 403));
  }

  next();
};

/**
 * Resource ownership middleware
 * Checks if user owns or has permission to access the resource
 */
export const authorizeResource = (resourceType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    const resourceId = req.params.id;
    if (!resourceId) {
      return next(new AppError(`${resourceType} ID is required`, 400));
    }

    // ADMIN can access all resources
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // For SCHOOL_ADMIN, check if resource belongs to their school
    if (req.user.role === 'SCHOOL_ADMIN') {
      const resource = await getResourceById(resourceType, resourceId);
      if (!resource) {
        return next(new AppError(`${resourceType} not found`, 404));
      }

      if (resource.school_id !== req.user.school_id) {
        return next(new AppError('You do not have permission to access this resource', 403));
      }
    }

    // For TEACHER and STUDENT, implement specific access rules
    if (['TEACHER', 'STUDENT'].includes(req.user.role)) {
      const hasAccess = await checkResourceAccess(resourceType, resourceId, req.user);
      if (!hasAccess) {
        return next(new AppError('You do not have permission to access this resource', 403));
      }
    }

    next();
  };
};

// Helper function to get resource by ID
async function getResourceById(resourceType: string, id: string) {
  try {
    const model = require(`../models/${resourceType}`).default;
    return await model.findByPk(id);
  } catch (error) {
    console.error(`Error fetching ${resourceType}:`, error);
    return null;
  }
}

// Helper function to check resource access
async function checkResourceAccess(resourceType: string, resourceId: string, user: Express.Request['user']) {
  try {
    const model = require(`../models/${resourceType}`).default;
    const resource = await model.findByPk(resourceId);

    if (!resource) {
      return false;
    }

    switch (user?.role) {
      case 'TEACHER':
        // Teachers can access their own resources and assigned classes/subjects
        return resource.teacher_id === user.id || 
               await checkTeacherAccess(resourceType, resource, user.id);
      
      case 'STUDENT':
        // Students can access their own resources and enrolled classes/subjects
        return resource.student_id === user.id || 
               await checkStudentAccess(resourceType, resource, user.id);
      
      default:
        return false;
    }
  } catch (error) {
    console.error(`Error checking ${resourceType} access:`, error);
    return false;
  }
}

// Helper function to check teacher access
async function checkTeacherAccess(resourceType: string, resource: any, teacherId: string) {
  switch (resourceType.toLowerCase()) {
    case 'class':
      return await resource.hasTeacher(teacherId);
    case 'subject':
      return await resource.hasTeacher(teacherId);
    default:
      return false;
  }
}

// Helper function to check student access
async function checkStudentAccess(resourceType: string, resource: any, studentId: string) {
  switch (resourceType.toLowerCase()) {
    case 'class':
      return await resource.hasStudent(studentId);
    case 'subject':
      return await resource.hasStudent(studentId);
    default:
      return false;
  }
}
