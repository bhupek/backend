import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';
import { Role } from '../models/RolePermission';
import config from '../config';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: Role;
                schoolId: string | null;
            };
        }
    }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            logger.warn('Authentication failed: No authorization header');
            return res.status(401).json({
                error: 'Authentication required',
                message: 'Please log in to access this resource'
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            logger.warn('Authentication failed: No token provided');
            return res.status(401).json({
                error: 'Authentication required',
                message: 'Please log in to access this resource'
            });
        }

        try {
            const decoded = jwt.verify(token, config.jwtSecret) as {
                id: string;
                email: string;
                role: Role;
                schoolId: string | null;
                iat: number;
                exp: number;
            };

            // Token verification successful, set user in request
            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
                schoolId: decoded.schoolId
            };
            
            next();
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                logger.warn('Authentication failed: Token expired');
                return res.status(401).json({
                    error: 'Token expired',
                    message: 'Your session has expired. Please log in again'
                });
            }
            
            if (error instanceof jwt.JsonWebTokenError) {
                logger.warn('Authentication failed: Invalid token');
                return res.status(401).json({
                    error: 'Invalid token',
                    message: 'Your session is invalid. Please log in again'
                });
            }

            logger.error('Token verification failed:', error);
            return res.status(401).json({
                error: 'Authentication failed',
                message: 'Please log in again'
            });
        }
    } catch (error) {
        logger.error('Authentication middleware error:', error);
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
