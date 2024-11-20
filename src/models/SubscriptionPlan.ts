import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface SubscriptionPlanAttributes {
  id: string;
  name: string;
  description?: string;
  price: number;
  billingCycle: string;
  features: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class SubscriptionPlan extends Model<SubscriptionPlanAttributes> implements SubscriptionPlanAttributes {
  public id!: string;
  public name!: string;
  public description!: string;
  public price!: number;
  public billingCycle!: string;
  public features!: any;
  public isActive!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

SubscriptionPlan.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    billingCycle: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    features: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    modelName: 'SubscriptionPlan',
    tableName: 'subscription_plans',
    timestamps: true,
  }
);

export default SubscriptionPlan;
