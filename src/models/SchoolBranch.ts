import { Model, DataTypes, Op } from 'sequelize';
import sequelize from '../config/database';

interface SchoolBranchAttributes {
  id: string;
  school_id: string;
  name: string;
  address_id?: string;
  contact_number?: string;
  email?: string;
  principal_name?: string;
  is_main_branch: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  capacity?: number;
  facilities?: string[];
  created_at: Date;
  updated_at: Date;
}

class SchoolBranch extends Model<SchoolBranchAttributes> implements SchoolBranchAttributes {
  public id!: string;
  public school_id!: string;
  public name!: string;
  public address_id?: string;
  public contact_number?: string;
  public email?: string;
  public principal_name?: string;
  public is_main_branch!: boolean;
  public status!: 'ACTIVE' | 'INACTIVE';
  public capacity?: number;
  public facilities?: string[];
  public created_at!: Date;
  public updated_at!: Date;

  // Associations will be defined after model initialization
  public readonly school?: any;
  public readonly address?: any;
}

SchoolBranch.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    school_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    address_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    contact_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,10}$/,
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    principal_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    is_main_branch: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
      },
    },
    facilities: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
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
    modelName: 'SchoolBranch',
    tableName: 'school_branches',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['school_id', 'name'],
        name: 'school_branch_name_unique',
      },
      {
        fields: ['address_id'],
        name: 'school_branch_address_index',
      },
      {
        fields: ['status'],
        name: 'school_branch_status_index',
      },
      {
        fields: ['is_main_branch'],
        name: 'school_branch_main_index',
      },
    ],
    hooks: {
      beforeCreate: async (branch: SchoolBranch) => {
        if (branch.is_main_branch) {
          const existingMainBranch = await SchoolBranch.findOne({
            where: {
              school_id: branch.school_id,
              is_main_branch: true,
            },
          });
          if (existingMainBranch) {
            throw new Error('School already has a main branch');
          }
        }
      },
      beforeUpdate: async (branch: SchoolBranch) => {
        if (branch.changed('is_main_branch') && branch.is_main_branch) {
          const existingMainBranch = await SchoolBranch.findOne({
            where: {
              school_id: branch.school_id,
              is_main_branch: true,
              id: { [Op.ne]: branch.id },
            },
          });
          if (existingMainBranch) {
            throw new Error('School already has a main branch');
          }
        }
      },
    },
  }
);

export default SchoolBranch;

// Define associations after all models are initialized
export const initSchoolBranchAssociations = () => {
  const School = require('./School').default;
  const Address = require('./Address').default;

  SchoolBranch.belongsTo(School, {
    foreignKey: 'school_id',
    as: 'school',
    onDelete: 'CASCADE',
  });

  SchoolBranch.belongsTo(Address, {
    foreignKey: 'address_id',
    as: 'address',
    onDelete: 'SET NULL',
  });
};
