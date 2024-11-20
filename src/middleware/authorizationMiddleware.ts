import { Request, Response, NextFunction } from 'express';
import { Permission } from '../models/RolePermission';
import PermissionService from '../services/PermissionService';
import { UnauthorizedError } from '../utils/errors';
import Staff from '../models/Staff';

// Extend Express Request type to include user and school info
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        schoolId: string;
      };
      staff?: Staff;
    }
  }
}

/**
 * Middleware to check if the user has the required permission
 */
export const requirePermission = (permission: Permission) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id || !req.user?.schoolId) {
        throw new UnauthorizedError('User not authenticated');
      }

      // Get staff details including role
      const staff = await Staff.findOne({
        where: {
          userId: req.user.id,
          schoolId: req.user.schoolId,
        },
      });

      if (!staff) {
        throw new UnauthorizedError('Staff record not found');
      }

      // Attach staff to request for use in controllers
      req.staff = staff;

      // Check permission
      const permissionService = PermissionService.getInstance();
      const hasPermission = await permissionService.hasPermission(
        req.user.schoolId,
        staff.role,
        permission
      );

      if (!hasPermission) {
        throw new UnauthorizedError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has any of the specified permissions
 */
export const requireAnyPermission = (permissions: Permission[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id || !req.user?.schoolId) {
        throw new UnauthorizedError('User not authenticated');
      }

      const staff = await Staff.findOne({
        where: {
          userId: req.user.id,
          schoolId: req.user.schoolId,
        },
      });

      if (!staff) {
        throw new UnauthorizedError('Staff record not found');
      }

      req.staff = staff;

      const permissionService = PermissionService.getInstance();
      const userPermissions = await permissionService.getPermissions(
        req.user.schoolId,
        staff.role
      );

      const hasAnyPermission = permissions.some(permission =>
        userPermissions.includes(permission)
      );

      if (!hasAnyPermission) {
        throw new UnauthorizedError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has all of the specified permissions
 */
export const requireAllPermissions = (permissions: Permission[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id || !req.user?.schoolId) {
        throw new UnauthorizedError('User not authenticated');
      }

      const staff = await Staff.findOne({
        where: {
          userId: req.user.id,
          schoolId: req.user.schoolId,
        },
      });

      if (!staff) {
        throw new UnauthorizedError('Staff record not found');
      }

      req.staff = staff;

      const permissionService = PermissionService.getInstance();
      const userPermissions = await permissionService.getPermissions(
        req.user.schoolId,
        staff.role
      );

      const hasAllPermissions = permissions.every(permission =>
        userPermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        throw new UnauthorizedError('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
