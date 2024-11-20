import { Model, DataTypes, Op } from 'sequelize';
import sequelize from '../config/database';

interface SchoolAttributes {
  id: string;
  name: string;
  address: string;
  contact_number?: string;
  email?: string;
  subscription_id?: string;
  settings?: any;
  domain_name?: string;
  logo_url?: string;
  theme_colors?: any;
  features?: string[];
  created_at: Date;
  updated_at: Date;
  customization?: any;
  role_config?: any;
}

class School extends Model<SchoolAttributes> implements SchoolAttributes {
  public id!: string;
  public name!: string;
  public address!: string;
  public contact_number?: string;
  public email?: string;
  public subscription_id?: string;
  public settings?: any;
  public domain_name?: string;
  public logo_url?: string;
  public theme_colors?: any;
  public features?: string[];
  public created_at!: Date;
  public updated_at!: Date;
  public customization?: any;
  public role_config?: any;

  // Associations will be defined after model initialization
  public readonly subscription?: any;
  public readonly branches?: any[];
  public readonly role_permissions?: any[];
}

School.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    contact_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    subscription_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    settings: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    domain_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    logo_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    theme_colors: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    features: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    customization: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    role_config: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
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
    modelName: 'School',
    tableName: 'schools',
    timestamps: true,
    underscored: true, // Enable snake_case for column names
    indexes: [
      {
        unique: true,
        fields: ['domain_name'],
        name: 'schools_domain_name_unique'
      },
      {
        fields: ['email'],
        name: 'schools_email_idx'
      },
      {
        fields: ['subscription_id'],
        name: 'schools_subscription_idx'
      }
    ],
  }
);

export default School;

// Define associations after all models are initialized
export const initSchoolAssociations = () => {
  const SchoolBranch = require('./SchoolBranch').default;
  const RolePermission = require('./RolePermission').default;
  const Subscription = require('./Subscription').default;

  School.belongsTo(Subscription, {
    foreignKey: 'subscription_id',
    as: 'subscription',
  });

  School.hasMany(SchoolBranch, {
    foreignKey: 'school_id',
    as: 'branches',
    onDelete: 'CASCADE',
  });

  School.hasMany(RolePermission, {
    foreignKey: 'school_id',
    as: 'role_permissions',
    onDelete: 'CASCADE',
  });
};
