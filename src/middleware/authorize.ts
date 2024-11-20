import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Not authenticated');
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new ApiError(403, 'Not authorized to access this resource');
      }

      next();
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
};
