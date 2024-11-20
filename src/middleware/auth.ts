import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';
import { Role } from '../models/RolePermission';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: Role;
                schoolId: string;
            };
        }
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new AppError('No authorization header', 401);
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new AppError('No token provided', 401);
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
                id: string;
                email: string;
                role: Role;
                schoolId: string;
            };
            req.user = decoded;
            next();
        } catch (error) {
            throw new AppError('Invalid token', 401);
        }
    } catch (error) {
        next(error);
    }
};

export const authorizeRoles = (...roles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                throw new AppError('User not authenticated', 401);
            }

            if (!roles.includes(req.user.role)) {
                throw new AppError('Not authorized to access this resource', 403);
            }

            next();
        } catch (error) {
            if (error instanceof AppError) {
                next(error);
            } else {
                next(new AppError('Authorization failed', 403));
            }
        }
    };
};
