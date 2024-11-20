import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import School from './School';

// Define all possible permissions in the system
export enum Permission {
  // Student Management
  VIEW_STUDENTS = 'view_students',
  ADD_STUDENT = 'add_student',
  EDIT_STUDENT = 'edit_student',
  DELETE_STUDENT = 'delete_student',
  
  // Staff Management
  VIEW_STAFF = 'view_staff',
  ADD_STAFF = 'add_staff',
  EDIT_STAFF = 'edit_staff',
  DELETE_STAFF = 'delete_staff',
  
  // Fee Management
  VIEW_FEES = 'view_fees',
  ADD_FEE = 'add_fee',
  EDIT_FEE = 'edit_fee',
  DELETE_FEE = 'delete_fee',
  COLLECT_FEE = 'collect_fee',
  
  // Academic Management
  VIEW_CLASSES = 'view_classes',
  MANAGE_CLASSES = 'manage_classes',
  VIEW_SUBJECTS = 'view_subjects',
  MANAGE_SUBJECTS = 'manage_subjects',
  
  // Attendance Management
  VIEW_ATTENDANCE = 'view_attendance',
  MARK_ATTENDANCE = 'mark_attendance',
  
  // Examination Management
  VIEW_EXAMS = 'view_exams',
  MANAGE_EXAMS = 'manage_exams',
  ENTER_MARKS = 'enter_marks',
  
  // Report Management
  VIEW_REPORTS = 'view_reports',
  GENERATE_REPORTS = 'generate_reports',
  
  // Settings & Configuration
  MANAGE_SETTINGS = 'manage_settings',
  MANAGE_ROLES = 'manage_roles',
}

export enum Role {
  ADMIN = 'ADMIN',
  PRINCIPAL = 'PRINCIPAL',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

// Default role permissions mapping
export const DEFAULT_ROLE_PERMISSIONS = {
  [Role.ADMIN]: Object.values(Permission), // Admin has all permissions
  [Role.PRINCIPAL]: [
    Permission.VIEW_STUDENTS, Permission.ADD_STUDENT, Permission.EDIT_STUDENT,
    Permission.VIEW_STAFF, Permission.ADD_STAFF, Permission.EDIT_STAFF,
    Permission.VIEW_FEES, Permission.ADD_FEE, Permission.EDIT_FEE, Permission.COLLECT_FEE,
    Permission.VIEW_CLASSES, Permission.MANAGE_CLASSES,
    Permission.VIEW_SUBJECTS, Permission.MANAGE_SUBJECTS,
    Permission.VIEW_ATTENDANCE, Permission.MARK_ATTENDANCE,
    Permission.VIEW_EXAMS, Permission.MANAGE_EXAMS,
    Permission.VIEW_REPORTS, Permission.GENERATE_REPORTS,
    Permission.MANAGE_SETTINGS
  ],
  [Role.TEACHER]: [
    Permission.VIEW_STUDENTS,
    Permission.VIEW_CLASSES,
    Permission.VIEW_SUBJECTS,
    Permission.VIEW_ATTENDANCE, Permission.MARK_ATTENDANCE,
    Permission.VIEW_EXAMS, Permission.ENTER_MARKS,
    Permission.VIEW_REPORTS
  ],
  [Role.STUDENT]: [
    Permission.VIEW_FEES,
  ]
};

interface RolePermissionAttributes {
  id: string;
  school_id: string;
  role: Role;
  permissions: Permission[];
  created_at: Date;
  updated_at: Date;
}

class RolePermission extends Model<RolePermissionAttributes> implements RolePermissionAttributes {
  public id!: string;
  public school_id!: string;
  public role!: Role;
  public permissions!: Permission[];
  public created_at!: Date;
  public updated_at!: Date;

  // Associations
  public readonly school?: School;
}

RolePermission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    school_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'schools',
        key: 'id',
      },
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    permissions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'RolePermission',
    tableName: 'role_permissions',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['school_id', 'role'],
        name: 'role_permissions_school_role_unique',
      },
    ],
  }
);

// Define associations
RolePermission.belongsTo(School, {
  foreignKey: 'school_id',
  as: 'school',
});

export default RolePermission;
