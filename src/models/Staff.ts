import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import School from './School';
import Department from './Department';
import User from './User';
import Address from './Address';
import { Role } from './RolePermission';

interface StaffAttributes {
  id: string;
  userId: string;
  schoolId: string;
  departmentId?: string;
  staffId: string;
  role: Role;
  employeeId: string;
  designation: string;
  joiningDate: Date;
  qualification?: string[];
  experienceYears?: number;
  salary?: number;
  addressId?: string;
  documents?: {
    resume?: string;
    idProof?: string;
    certificates?: string[];
    contractDocument?: string;
    otherDocuments?: { [key: string]: string };
  };
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    address?: string;
  };
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    branchName: string;
    ifscCode: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

class Staff extends Model<StaffAttributes> implements StaffAttributes {
  public id!: string;
  public userId!: string;
  public schoolId!: string;
  public departmentId?: string;
  public staffId!: string;
  public role!: Role;
  public employeeId!: string;
  public designation!: string;
  public joiningDate!: Date;
  public qualification?: string[];
  public experienceYears?: number;
  public salary?: number;
  public addressId?: string;
  public documents?: {
    resume?: string;
    idProof?: string;
    certificates?: string[];
    contractDocument?: string;
    otherDocuments?: { [key: string]: string };
  };
  public status!: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';
  public emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    address?: string;
  };
  public bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    branchName: string;
    ifscCode: string;
  };
  public createdAt!: Date;
  public updatedAt!: Date;

  // Associations
  public readonly user?: User;
  public readonly school?: School;
  public readonly department?: Department;
  public readonly address?: Address;
}

Staff.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    schoolId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'schools',
        key: 'id',
      },
    },
    departmentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'departments',
        key: 'id',
      },
    },
    staffId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    employeeId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    designation: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    joiningDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    qualification: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
    },
    experienceYears: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    addressId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'addresses',
        key: 'id',
      },
    },
    documents: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
    emergencyContact: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    bankDetails: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Staff',
    tableName: 'staff',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['schoolId', 'employeeId'],
        name: 'staff_school_employee_id_unique',
      },
      {
        unique: true,
        fields: ['schoolId', 'staffId'],
        name: 'staff_school_staff_id_unique',
      },
      {
        fields: ['userId'],
        name: 'staff_user_id_index',
      },
      {
        fields: ['departmentId'],
        name: 'staff_department_id_index',
      },
      {
        fields: ['role'],
        name: 'staff_role_index',
      },
    ],
  }
);

// Define associations
Staff.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

Staff.belongsTo(School, {
  foreignKey: 'schoolId',
  as: 'school',
});

Staff.belongsTo(Department, {
  foreignKey: 'departmentId',
  as: 'department',
});

Staff.belongsTo(Address, {
  foreignKey: 'addressId',
  as: 'address',
});

// Add the staff association to Department model
Department.hasMany(Staff, {
  foreignKey: 'departmentId',
  as: 'staff',
});

export default Staff;
