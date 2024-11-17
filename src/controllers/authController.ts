import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User';
import config from '../config';

// Login controller
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ 
        error: "Email and password are required" 
      });
    }

    // Find user by email
    console.log('Searching for user with email:', email);
    const user = await User.findOne({ 
      where: { email },
      attributes: ['id', 'name', 'email', 'password', 'role']
    });

    console.log('User found:', user ? 'Yes' : 'No');

    // Check if user exists
    if (!user) {
      console.log('User not found with email:', email);
      return res.status(401).json({ 
        error: "Invalid email or password" 
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      console.log('Invalid credentials for user:', email);
      return res.status(401).json({ 
        error: "Invalid email or password" 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role 
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    console.log('Login successful for user:', email);

    res.json({
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
    res.status(500).json({ error: "Internal server error" });
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
        role: user.role 
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
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
        role: user.role 
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
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
