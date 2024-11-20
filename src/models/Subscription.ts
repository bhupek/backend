import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface SubscriptionAttributes {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration_months: number;
  features?: string[];
  max_users?: number;
  max_storage_gb?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

class Subscription extends Model<SubscriptionAttributes> implements SubscriptionAttributes {
  public id!: string;
  public name!: string;
  public description?: string;
  public price!: number;
  public duration_months!: number;
  public features?: string[];
  public max_users?: number;
  public max_storage_gb?: number;
  public is_active!: boolean;
  public created_at!: Date;
  public updated_at!: Date;

  // Associations
  public readonly schools?: any[];
}

Subscription.init(
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
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    duration_months: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    features: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    max_users: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    max_storage_gb: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    modelName: 'Subscription',
    tableName: 'subscriptions',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['name'],
        name: 'subscriptions_name_unique',
      },
    ],
  }
);

export default Subscription;

// Define associations after all models are initialized
export const initSubscriptionAssociations = () => {
  const School = require('./School').default;

  Subscription.hasMany(School, {
    foreignKey: 'subscription_id',
    as: 'schools',
    onDelete: 'SET NULL',
  });
};
