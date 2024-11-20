import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface StudentAttributes {
  id: string;
  user_id: string;
  roll_number: string;
  date_of_birth?: Date;
  address?: string;
  created_at: Date;
  updated_at: Date;
}

class Student extends Model<StudentAttributes> implements StudentAttributes {
  public id!: string;
  public user_id!: string;
  public roll_number!: string;
  public date_of_birth?: Date;
  public address?: string;
  public created_at!: Date;
  public updated_at!: Date;

  // Associations will be defined after model initialization
  public readonly user?: any;
  public readonly classes?: any[];
}

Student.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    roll_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    date_of_birth: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
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
    modelName: 'Student',
    tableName: 'students',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['roll_number'],
        name: 'student_roll_number_unique',
      },
      {
        fields: ['user_id'],
        name: 'student_user_index',
      },
    ],
  }
);

// Define associations after all models are initialized
export function initStudentAssociations() {
  const { User, Class } = sequelize.models;

  Student.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE',
  });

  Student.belongsToMany(Class, {
    through: 'student_classes',
    foreignKey: 'student_id',
    otherKey: 'class_id',
    as: 'classes',
  });
}

export default Student;