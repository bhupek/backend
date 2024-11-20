import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import School from './School';
import User from './User';

interface DepartmentAttributes {
  id: string;
  schoolId: string;
  name: string;
  headId?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

class Department extends Model<DepartmentAttributes> implements DepartmentAttributes {
  public id!: string;
  public schoolId!: string;
  public name!: string;
  public headId?: string;
  public description?: string;
  public createdAt!: Date;
  public updatedAt!: Date;

  // Associations
  public readonly school?: School;
  public readonly head?: User;
  public readonly staff?: User[];
}

Department.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    schoolId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'schools',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    headId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    description: {
      type: DataTypes.TEXT,
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
    modelName: 'Department',
    tableName: 'departments',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['schoolId', 'name'],
        name: 'departments_school_name_unique',
      },
    ],
  }
);

// Define associations
Department.belongsTo(School, {
  foreignKey: 'schoolId',
  as: 'school',
});

Department.belongsTo(User, {
  foreignKey: 'headId',
  as: 'head',
});

// Note: Staff association will be defined in the Staff model
// to avoid circular dependencies

export default Department;
