import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface TeacherAttributes {
  id: string;
  user_id: string;
  school_id: string;
  specialization?: string;
  qualifications?: string[];
  status: 'ACTIVE' | 'INACTIVE';
  created_at: Date;
  updated_at: Date;
}

class Teacher extends Model<TeacherAttributes> implements TeacherAttributes {
  public id!: string;
  public user_id!: string;
  public school_id!: string;
  public specialization?: string;
  public qualifications?: string[];
  public status!: 'ACTIVE' | 'INACTIVE';
  public created_at!: Date;
  public updated_at!: Date;

  // Associations will be defined after model initialization
  public readonly user?: any;
  public readonly school?: any;
  public readonly classes?: any[];
  public readonly subjects?: any[];
}

Teacher.init(
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
      references: {
        model: 'users',
        key: 'id',
      },
    },
    school_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'schools',
        key: 'id',
      },
    },
    specialization: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    qualifications: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
      allowNull: false,
      defaultValue: 'ACTIVE',
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
    modelName: 'Teacher',
    tableName: 'teachers',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id'],
        name: 'teacher_user_index',
      },
      {
        fields: ['school_id'],
        name: 'teacher_school_index',
      },
      {
        fields: ['status'],
        name: 'teacher_status_index',
      },
    ],
  }
);

export function initTeacherAssociations() {
  const { User, School, Class, Subject } = sequelize.models;

  Teacher.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE',
  });

  Teacher.belongsTo(School, {
    foreignKey: 'school_id',
    as: 'school',
    onDelete: 'CASCADE',
  });

  Teacher.belongsToMany(Class, {
    through: 'class_teachers',
    foreignKey: 'teacher_id',
    otherKey: 'class_id',
    as: 'classes',
  });

  Teacher.belongsToMany(Subject, {
    through: 'teacher_subjects',
    foreignKey: 'teacher_id',
    otherKey: 'subject_id',
    as: 'subjects',
  });
}

export default Teacher;
