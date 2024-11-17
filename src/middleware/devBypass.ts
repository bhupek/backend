import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export const devAuthBypass = (req: Request, res: Response, next: NextFunction) => {
  if (config.nodeEnv === 'development' && req.headers['x-dev-bypass'] === 'true') {
    // Add mock user to request
    (req as any).user = {
      id: 1,
      email: 'admin@school.com',
      role: 'admin',
      tenantId: 1
    };
    return next();
  }
  next();
}; 