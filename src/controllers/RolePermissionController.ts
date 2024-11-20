import { Request, Response, NextFunction } from 'express';
import { Permission, DEFAULT_ROLE_PERMISSIONS } from '../models/RolePermission';
import PermissionService from '../services/PermissionService';
import School from '../models/School';
import { BadRequestError, NotFoundError } from '../utils/errors';

class RolePermissionController {
  /**
   * Get all roles and their permissions for a school
   */
  public async getRolePermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId } = req.user!;

      const school = await School.findByPk(schoolId);
      if (!school) {
        throw new NotFoundError('School not found');
      }

      const permissionService = PermissionService.getInstance();
      const roleConfig = school.roleConfig || { enabledRoles: [], customRoles: [] };
      const allRoles = [...roleConfig.enabledRoles, ...roleConfig.customRoles];

      const rolePermissions = await Promise.all(
        allRoles.map(async (role) => ({
          role,
          permissions: await permissionService.getPermissions(schoolId, role),
        }))
      );

      res.json({
        success: true,
        data: rolePermissions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update permissions for a role
   */
  public async updateRolePermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId } = req.user!;
      const { role } = req.params;
      const { permissions } = req.body;

      // Validate permissions
      if (!Array.isArray(permissions)) {
        throw new BadRequestError('Permissions must be an array');
      }

      const invalidPermissions = permissions.filter(
        (p) => !Object.values(Permission).includes(p)
      );
      if (invalidPermissions.length > 0) {
        throw new BadRequestError(`Invalid permissions: ${invalidPermissions.join(', ')}`);
      }

      // Get school and validate role
      const school = await School.findByPk(schoolId);
      if (!school) {
        throw new NotFoundError('School not found');
      }

      const roleConfig = school.roleConfig || { enabledRoles: [], customRoles: [] };
      const isValidRole =
        roleConfig.enabledRoles.includes(role) || roleConfig.customRoles.includes(role);

      if (!isValidRole) {
        throw new BadRequestError('Invalid role for this school');
      }

      // Update permissions
      const permissionService = PermissionService.getInstance();
      await permissionService.updatePermissions(schoolId, role, permissions);

      res.json({
        success: true,
        message: 'Role permissions updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a custom role for a school
   */
  public async createCustomRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId } = req.user!;
      const { role, permissions } = req.body;

      // Validate role name
      if (!role || typeof role !== 'string' || role.length < 3) {
        throw new BadRequestError('Invalid role name');
      }

      // Validate permissions
      if (!Array.isArray(permissions)) {
        throw new BadRequestError('Permissions must be an array');
      }

      const invalidPermissions = permissions.filter(
        (p) => !Object.values(Permission).includes(p)
      );
      if (invalidPermissions.length > 0) {
        throw new BadRequestError(`Invalid permissions: ${invalidPermissions.join(', ')}`);
      }

      // Update school's role configuration
      const school = await School.findByPk(schoolId);
      if (!school) {
        throw new NotFoundError('School not found');
      }

      const roleConfig = school.roleConfig || { enabledRoles: [], customRoles: [] };
      
      if (roleConfig.enabledRoles.includes(role) || roleConfig.customRoles.includes(role)) {
        throw new BadRequestError('Role already exists');
      }

      roleConfig.customRoles.push(role);
      await school.update({ roleConfig });

      // Create role permissions
      const permissionService = PermissionService.getInstance();
      await permissionService.updatePermissions(schoolId, role, permissions);

      res.json({
        success: true,
        message: 'Custom role created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Enable or disable standard roles for a school
   */
  public async updateEnabledRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId } = req.user!;
      const { enabledRoles } = req.body;

      // Validate roles
      if (!Array.isArray(enabledRoles)) {
        throw new BadRequestError('enabledRoles must be an array');
      }

      const invalidRoles = enabledRoles.filter(
        (role) => !Object.keys(DEFAULT_ROLE_PERMISSIONS).includes(role)
      );
      if (invalidRoles.length > 0) {
        throw new BadRequestError(`Invalid standard roles: ${invalidRoles.join(', ')}`);
      }

      // Update school's role configuration
      const school = await School.findByPk(schoolId);
      if (!school) {
        throw new NotFoundError('School not found');
      }

      const roleConfig = school.roleConfig || { enabledRoles: [], customRoles: [] };
      roleConfig.enabledRoles = enabledRoles;
      await school.update({ roleConfig });

      // Set default permissions for newly enabled roles
      const permissionService = PermissionService.getInstance();
      await Promise.all(
        enabledRoles.map(async (role) => {
          const defaultPermissions = DEFAULT_ROLE_PERMISSIONS[role];
          await permissionService.updatePermissions(schoolId, role, defaultPermissions);
        })
      );

      // Invalidate cache for this school
      await permissionService.invalidateSchoolCache(schoolId);

      res.json({
        success: true,
        message: 'Enabled roles updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a custom role
   */
  public async deleteCustomRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { schoolId } = req.user!;
      const { role } = req.params;

      const school = await School.findByPk(schoolId);
      if (!school) {
        throw new NotFoundError('School not found');
      }

      const roleConfig = school.roleConfig || { enabledRoles: [], customRoles: [] };
      
      if (!roleConfig.customRoles.includes(role)) {
        throw new BadRequestError('Custom role not found');
      }

      // Remove role from configuration
      roleConfig.customRoles = roleConfig.customRoles.filter((r) => r !== role);
      await school.update({ roleConfig });

      // Delete role permissions and invalidate cache
      const permissionService = PermissionService.getInstance();
      await permissionService.updatePermissions(schoolId, role, []);
      await permissionService.invalidateSchoolCache(schoolId);

      res.json({
        success: true,
        message: 'Custom role deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new RolePermissionController();
