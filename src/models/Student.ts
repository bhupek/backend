import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Class from './Class';

class Student extends Model {
  public id!: number;
  public userId!: string;
  public rollNumber!: string;
  public dateOfBirth?: Date;
  public address?: string;
}

Student.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  rollNumber: {
    type: DataTypes.STRING,
    unique: true,
  },
  dateOfBirth: DataTypes.DATE,
  address: DataTypes.STRING,
}, {
  sequelize,
  modelName: 'Student',
  tableName: 'students',
  timestamps: true,
});

export default Student;