import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Class from './Class';

interface TestAttributes {
  id: string;
  title: string;
  description: string;
  classId: string;
  createdBy: string;
  duration: number; // in minutes
  startTime: Date;
  endTime: Date;
  totalMarks: number;
  passingMarks: number;
  isPublished: boolean;
  testType: 'MCQ' | 'DESCRIPTIVE' | 'MIXED';
}

class Test extends Model<TestAttributes> implements TestAttributes {
  public id!: string;
  public title!: string;
  public description!: string;
  public classId!: string;
  public createdBy!: string;
  public duration!: number;
  public startTime!: Date;
  public endTime!: Date;
  public totalMarks!: number;
  public passingMarks!: number;
  public isPublished!: boolean;
  public testType!: 'MCQ' | 'DESCRIPTIVE' | 'MIXED';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Test.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    classId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'classes',
        key: 'id',
      },
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    totalMarks: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    passingMarks: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    testType: {
      type: DataTypes.ENUM('MCQ', 'DESCRIPTIVE', 'MIXED'),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'tests',
    timestamps: true,
  }
);

Test.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Test.belongsTo(Class, { foreignKey: 'classId', as: 'class' });

export default Test;
