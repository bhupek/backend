import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Op } from 'sequelize';
import User from '../models/User';
import School from '../models/School';
import config from '../config';
import { sendEmail, generatePasswordResetEmail } from '../utils/emailService';
import { ApiError } from '../utils/ApiError';

// Login controller
export const login = async (req: Request, res: Response) => {
  try {
    console.log('Login attempt with data:', req.body);
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ 
        error: "Email and password are required",
        details: "Please provide both email and password"
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ 
        error: "Invalid credentials",
        message: "The email or password you entered is incorrect"
      });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ 
        error: "Invalid credentials",
        message: "The email or password you entered is incorrect"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId || null
      },
      config.jwt.secret,
      { 
        algorithm: 'HS256',
        expiresIn: '24h'
      }
    );

    console.log('Login successful for user:', email);

    // Set response headers
    res.setHeader('Content-Type', 'application/json');
    if (req.headers.origin === 'http://localhost:3001') {
      res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');

    // Send response
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    // Set CORS headers for error response
    if (req.headers.origin === 'http://localhost:3001') {
      res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    return res.status(500).json({ 
      error: "Internal server error",
      message: "An error occurred during login. Please try again."
    });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // The user ID will be available from the auth middleware
    const userId = req.user?.id;
    console.log('Getting current user info for ID:', userId);

    if (!userId) {
      console.log('No user ID found in request');
      return res.status(401)
        .header('Access-Control-Allow-Origin', '*')
        .json({ error: "Not authenticated" });
    }

    // Find user by ID
    const user = await User.findOne({
      where: { id: userId },
      attributes: ['id', 'name', 'email', 'role'] // Exclude password
    });

    if (!user) {
      console.log('User not found in database:', userId);
      return res.status(404)
        .header('Access-Control-Allow-Origin', '*')
        .json({ error: "User not found" });
    }

    console.log('Found user:', user.email);

    // Generate a fresh token
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId || null
      },
      config.jwt.secret,
      { 
        algorithm: 'HS256',
        expiresIn: '24h'
      }
    );

    console.log('Generated fresh token for user:', user.email);

    const response = {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };

    // Set response headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    
    // Send response
    return res.status(200).json(response);
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500)
      .header('Access-Control-Allow-Origin', '*')
      .json({ error: "Internal server error" });
  }
};

// Forgot password controller
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email, schoolName } = req.body;

    if (!email) {
      throw new ApiError(400, 'Email is required');
    }

    // Find user and their school
    const user = await User.findOne({ 
      where: { email },
      include: [{
        model: School,
        where: schoolName ? { name: schoolName } : undefined
      }]
    });

    if (!user) {
      // Don't reveal that the user doesn't exist
      return res.status(200).json({
        message: 'If a user with that email exists, a password reset link will be sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save reset token and expiry
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    try {
      // Send reset email
      const school = await School.findByPk(user.schoolId);
      const schoolNameToUse = school?.name || 'School Management System';
      
      await sendEmail(
        user.email,
        'Password Reset Request',
        generatePasswordResetEmail(resetToken, schoolNameToUse)
      );

      res.status(200).json({
        message: 'Password reset link sent to email'
      });
    } catch (error) {
      // If email fails, reset the token
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      throw new ApiError(500, 'Error sending password reset email');
    }
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Forgot password error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Reset password controller
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      throw new ApiError(400, 'Token and password are required');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }

    // Update password and clear reset token
    user.password = password; // Will be hashed by User model hooks
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      console.error('Reset password error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Register controller
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: "Name, email and password are required" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      where: { email } 
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: "Email already registered" 
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password, // Password will be hashed by User model hooks
      role: 'student' // Default role
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        schoolId: user.schoolId || null
      },
      config.jwt.secret,
      { 
        algorithm: 'HS256',
        expiresIn: '24h'
      }
    );

    // Return user info and token (excluding password)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.status(201).json({ 
      message: "User registered successfully",
      user: userResponse,
      token 
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};
