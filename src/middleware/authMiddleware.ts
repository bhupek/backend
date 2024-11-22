import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';

interface JwtPayload {
  id: number;
  email: string;
  role: string;
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).send();
  }

  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ error: "Access token is required" });
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      console.log('Token verified for user:', decoded.email);
      req.user = decoded;
      next();
    } catch (err) {
      console.log('Token verification failed:', err.message);
      return res.status(403).json({ error: "Invalid or expired token" });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
