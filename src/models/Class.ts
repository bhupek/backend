import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class Class extends Model {
  public id!: number;
  public name!: string;
  public grade!: string;
  public section!: string;
}

Class.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  section: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'Class',
  tableName: 'classes',
  timestamps: true,
});

export default Class;