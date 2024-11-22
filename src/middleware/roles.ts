import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

export const checkRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to access this resource'
        });
      }

      next();
    } catch (error) {
      console.error('Error in role check middleware:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error during role verification'
      });
    }
  };
};
