import { Request, Response } from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validate';
import { catchAsync } from '../utils/catchAsync';
import School from '../models/School';
import User from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config';
import { ApiError } from '../utils/ApiError';
import { Role } from '../models/RolePermission';
import { v4 as uuidv4 } from 'uuid';

// Validation schemas
const createSchoolSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'School name is required'),
    address: z.string().min(1, 'Address is required'),
    contactNumber: z.string().optional(),
    email: z.string().email('Invalid email address'),
    domainName: z.string().optional(),
    // Admin user details
    adminName: z.string().min(1, 'Admin name is required'),
    adminEmail: z.string().email('Invalid admin email'),
    adminPassword: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

const updateSchoolSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    name: z.string().optional(),
    address: z.string().optional(),
    contactNumber: z.string().optional(),
    email: z.string().email().optional(),
    domainName: z.string().optional(),
    settings: z.record(z.any()).optional(),
    themeColors: z.record(z.any()).optional(),
    features: z.array(z.string()).optional(),
    customization: z.record(z.any()).optional(),
    subscriptionPlan: z.enum(['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE']).optional(),
    subscriptionStatus: z.enum(['ACTIVE', 'INACTIVE', 'TRIAL', 'EXPIRED']).optional(),
  }),
});

class SchoolController {
  /**
   * Create a new school with admin user
   */
  createSchool = catchAsync(
    validateRequest(createSchoolSchema, async (req: Request, res: Response) => {
      const {
        name,
        address,
        contactNumber,
        email,
        domainName,
        adminName,
        adminEmail,
        adminPassword,
      } = req.body;

      // Check if school with same domain exists
      if (domainName) {
        const existingSchool = await School.findOne({ where: { domainName } });
        if (existingSchool) {
          throw new ApiError(400, 'School with this domain already exists');
        }
      }

      // Check if admin email is already in use
      const existingAdmin = await User.findOne({ where: { email: adminEmail } });
      if (existingAdmin) {
        throw new ApiError(400, 'Admin email is already in use');
      }

      // Generate unique school ID
      const schoolId = uuidv4();

      // Create school with SaaS-specific fields
      const school = await School.create({
        id: schoolId,
        name,
        address,
        contactNumber,
        email,
        domainName,
        settings: {
          timezone: 'UTC',
          dateFormat: 'YYYY-MM-DD',
          timeFormat: '24h',
          language: 'en',
          currency: 'USD',
        },
        themeColors: {
          primary: '#0066cc',
          secondary: '#4d4d4d',
          accent: '#ff6b6b',
        },
        features: ['BASIC_FEATURES'],
        customization: {
          logo: null,
          favicon: null,
          loginBackground: null,
        },
        subscriptionPlan: 'FREE',
        subscriptionStatus: 'TRIAL',
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
        roleConfig: {
          enabledRoles: [Role.ADMIN, Role.TEACHER, Role.STUDENT],
          customRoles: [],
        },
        maxUsers: 50, // Default limit for free plan
        maxStorage: 1024 * 1024 * 1024, // 1GB default storage
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMIN,
        schoolId: school.id,
        status: 'ACTIVE',
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Generate JWT token with school context
      const token = jwt.sign(
        { 
          userId: admin.id, 
          schoolId: school.id, 
          role: Role.ADMIN,
          plan: school.subscriptionPlan,
          status: school.subscriptionStatus
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      res.status(201).json({
        success: true,
        data: {
          school: {
            id: school.id,
            name: school.name,
            email: school.email,
            domainName: school.domainName,
            subscriptionPlan: school.subscriptionPlan,
            subscriptionStatus: school.subscriptionStatus,
            trialEndsAt: school.trialEndsAt,
            features: school.features,
          },
          admin: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
          },
          token,
        },
      });
    })
  );

  /**
   * Get school details
   */
  getSchool = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { includeStats } = req.query;

    const school = await School.findByPk(id);
    if (!school) {
      throw new ApiError(404, 'School not found');
    }

    let stats = {};
    if (includeStats) {
      // Get school statistics
      const [userCount, storageUsed] = await Promise.all([
        User.count({ where: { schoolId: id } }),
        // Add storage calculation logic here
      ]);

      stats = {
        userCount,
        storageUsed,
        storageLimit: school.maxStorage,
        userLimit: school.maxUsers,
      };
    }

    res.json({
      success: true,
      data: {
        ...school.toJSON(),
        stats: includeStats ? stats : undefined,
      },
    });
  });

  /**
   * Update school details
   */
  updateSchool = catchAsync(
    validateRequest(updateSchoolSchema, async (req: Request, res: Response) => {
      const { id } = req.params;
      const updateData = req.body;

      const school = await School.findByPk(id);
      if (!school) {
        throw new ApiError(404, 'School not found');
      }

      // If updating domain name, check if it's already in use
      if (updateData.domainName) {
        const existingSchool = await School.findOne({
          where: { domainName: updateData.domainName },
        });
        if (existingSchool && existingSchool.id !== id) {
          throw new ApiError(400, 'Domain name is already in use');
        }
      }

      // If updating subscription plan, update related limits
      if (updateData.subscriptionPlan) {
        const planLimits = {
          FREE: { users: 50, storage: 1024 * 1024 * 1024 }, // 1GB
          BASIC: { users: 200, storage: 5 * 1024 * 1024 * 1024 }, // 5GB
          PREMIUM: { users: 1000, storage: 20 * 1024 * 1024 * 1024 }, // 20GB
          ENTERPRISE: { users: 5000, storage: 100 * 1024 * 1024 * 1024 }, // 100GB
        };

        const newLimits = planLimits[updateData.subscriptionPlan];
        updateData.maxUsers = newLimits.users;
        updateData.maxStorage = newLimits.storage;
      }

      await school.update(updateData);

      res.json({
        success: true,
        data: school,
      });
    })
  );

  /**
   * Delete school
   */
  deleteSchool = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const school = await School.findByPk(id);
    if (!school) {
      throw new ApiError(404, 'School not found');
    }

    // Delete all related data
    await Promise.all([
      User.destroy({ where: { schoolId: id } }),
      // Add other related model deletions here
    ]);

    await school.destroy();

    res.status(204).send();
  });
}

export default new SchoolController();
