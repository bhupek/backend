import express from 'express';
import { getProfile, updateProfile } from '../controllers/profileController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all profile routes
router.use(authenticateToken);

// Get user profile
router.get('/', getProfile);

// Update user profile
router.put('/', updateProfile);

export default router;
