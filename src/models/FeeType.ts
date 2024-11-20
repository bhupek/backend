import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import School from './School';

class FeeType extends Model {
  public id!: number;
  public name!: string;
  public description?: string;
  public amount!: number;
  public currency!: string;
  public frequency!: 'MONTHLY' | 'YEARLY' | 'ONE_TIME';
  public schoolId!: number;
  public isActive!: boolean;
}

FeeType.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'INR',
  },
  frequency: {
    type: DataTypes.ENUM('MONTHLY', 'YEARLY', 'ONE_TIME'),
    allowNull: false,
  },
  schoolId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'schools',
      key: 'id',
    },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  sequelize,
  modelName: 'FeeType',
  tableName: 'fee_types',
  timestamps: true,
});

// Define associations
FeeType.belongsTo(School, { foreignKey: 'schoolId' });

export default FeeType;
