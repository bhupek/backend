import { Permission, Role } from '../models/RolePermission';
import RolePermission from '../models/RolePermission';
import School from '../models/School';
import { createClient } from 'redis';
import { logger } from '../utils/logger';

class PermissionService {
  private static instance: PermissionService;
  private redisClient: ReturnType<typeof createClient>;
  private cacheExpiry = 300; // 5 minutes

  private constructor() {
    this.redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });
    
    this.redisClient.on('error', (err) => {
      logger.error('Redis Client Error', err);
    });

    this.redisClient.connect().catch((err) => {
      logger.error('Redis Connection Error', err);
    });
  }

  public static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  private getCacheKey(schoolId: string, role: string): string {
    return `permissions:${schoolId}:${role}`;
  }

  /**
   * Get permissions for a specific role in a school
   */
  public async getPermissions(schoolId: string, role: Role): Promise<Permission[]> {
    const cacheKey = this.getCacheKey(schoolId, role);

    // Try to get from cache first
    try {
      const cachedPermissions = await this.redisClient.get(cacheKey);
      if (cachedPermissions) {
        return JSON.parse(cachedPermissions);
      }
    } catch (error) {
      logger.error('Redis Get Error', error);
    }

    // If not in cache, fetch from database
    const rolePermission = await RolePermission.findOne({
      where: { schoolId, role },
      include: [{
        model: School,
        as: 'school',
        attributes: ['roleConfig'],
      }],
    });

    if (!rolePermission || !rolePermission.school?.roleConfig?.enabledRoles?.includes(role)) {
      return [];
    }

    // Cache the permissions
    try {
      await this.redisClient.setEx(
        cacheKey,
        this.cacheExpiry,
        JSON.stringify(rolePermission.permissions)
      );
    } catch (error) {
      logger.error('Redis Set Error', error);
    }

    return rolePermission.permissions;
  }

  /**
   * Check if a role has a specific permission in a school
   */
  public async hasPermission(schoolId: string, role: Role, permission: Permission): Promise<boolean> {
    const permissions = await this.getPermissions(schoolId, role);
    return permissions.includes(permission);
  }

  /**
   * Update permissions for a role in a school
   */
  public async updatePermissions(schoolId: string, role: Role, permissions: Permission[]): Promise<void> {
    // Update in database
    await RolePermission.upsert({
      schoolId,
      role,
      permissions,
    });

    // Invalidate cache
    const cacheKey = this.getCacheKey(schoolId, role);
    try {
      await this.redisClient.del(cacheKey);
    } catch (error) {
      logger.error('Redis Delete Error', error);
    }
  }

  /**
   * Invalidate all permission caches for a school
   */
  public async invalidateSchoolCache(schoolId: string): Promise<void> {
    try {
      const pattern = this.getCacheKey(schoolId, '*');
      const keys = await this.redisClient.keys(pattern);
      if (keys.length > 0) {
        await this.redisClient.del(keys);
      }
    } catch (error) {
      logger.error('Redis Pattern Delete Error', error);
    }
  }
}

export default PermissionService;
