import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Student from './Student';
import FeeType from './FeeType';
import School from './School';
import User from './User';

class FeePayment extends Model {
  public id!: number;
  public studentId!: number;
  public feeTypeId!: number;
  public schoolId!: number;
  public amount!: number;
  public currency!: string;
  public paymentDate!: Date;
  public paymentMethod!: 'CASH' | 'ONLINE' | 'CHEQUE';
  public transactionId?: string;
  public status!: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  public dueDate?: Date;
  public paidBy!: string; // UUID of user who made the payment
  public remarks?: string;
  public month?: number; // 1-12 for monthly fees
  public year!: number;
}

FeePayment.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id',
    },
  },
  feeTypeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'fee_types',
      key: 'id',
    },
  },
  schoolId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'schools',
      key: 'id',
    },
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
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  paymentMethod: {
    type: DataTypes.ENUM('CASH', 'ONLINE', 'CHEQUE'),
    allowNull: false,
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED'),
    allowNull: false,
    defaultValue: 'PENDING',
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  paidBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 12,
    },
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'FeePayment',
  tableName: 'fee_payments',
  timestamps: true,
  indexes: [
    {
      fields: ['studentId', 'feeTypeId', 'month', 'year'],
      unique: true,
      where: {
        status: 'PAID',
      },
      name: 'unique_paid_fee_per_month',
    },
    {
      fields: ['schoolId'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['paymentDate'],
    },
  ],
});

// Define associations
FeePayment.belongsTo(Student, { foreignKey: 'studentId' });
FeePayment.belongsTo(FeeType, { foreignKey: 'feeTypeId' });
FeePayment.belongsTo(School, { foreignKey: 'schoolId' });
FeePayment.belongsTo(User, { foreignKey: 'paidBy', as: 'payer' });

export default FeePayment;
