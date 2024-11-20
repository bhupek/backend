import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';
import multer from 'multer';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Handle multer errors
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      status: 'error',
      message: err.message,
      code: 'FILE_UPLOAD_ERROR'
    });
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      code: err.isOperational ? 'OPERATIONAL_ERROR' : 'INTERNAL_ERROR'
    });
  }

  // Handle validation errors (e.g., from express-validator)
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: err.message,
      code: 'VALIDATION_ERROR',
      errors: err.errors
    });
  }

  // Default error
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    code: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};