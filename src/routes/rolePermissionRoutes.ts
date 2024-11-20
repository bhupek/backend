import express from 'express';
import RolePermissionController from '../controllers/RolePermissionController';
import { requirePermission } from '../middleware/authorizationMiddleware';
import { Permission } from '../models/RolePermission';

const router = express.Router();

// Get all roles and their permissions for a school
router.get(
  '/',
  requirePermission(Permission.MANAGE_ROLES),
  RolePermissionController.getRolePermissions
);

// Update permissions for a role
router.put(
  '/:role/permissions',
  requirePermission(Permission.MANAGE_ROLES),
  RolePermissionController.updateRolePermissions
);

// Create a custom role
router.post(
  '/custom',
  requirePermission(Permission.MANAGE_ROLES),
  RolePermissionController.createCustomRole
);

// Update enabled standard roles
router.put(
  '/enabled',
  requirePermission(Permission.MANAGE_ROLES),
  RolePermissionController.updateEnabledRoles
);

// Delete a custom role
router.delete(
  '/custom/:role',
  requirePermission(Permission.MANAGE_ROLES),
  RolePermissionController.deleteCustomRole
);

export default router;
