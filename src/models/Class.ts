import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface ClassAttributes {
  id: string;
  name: string;
  grade: string;
  section: string;
  school_id: string;
  class_teacher_id?: string;
  academic_year: string;
  status: 'ACTIVE' | 'INACTIVE';
  capacity?: number;
  created_at: Date;
  updated_at: Date;
}

class Class extends Model<ClassAttributes> implements ClassAttributes {
  public id!: string;
  public name!: string;
  public grade!: string;
  public section!: string;
  public school_id!: string;
  public class_teacher_id?: string;
  public academic_year!: string;
  public status!: 'ACTIVE' | 'INACTIVE';
  public capacity?: number;
  public created_at!: Date;
  public updated_at!: Date;

  // Associations will be defined after model initialization
  public readonly school?: any;
  public readonly classTeacher?: any;
  public readonly students?: any[];
  public readonly teachers?: any[];
  public readonly subjects?: any[];
}

Class.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    grade: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    section: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    school_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'schools',
        key: 'id',
      },
    },
    class_teacher_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'teachers',
        key: 'id',
      },
    },
    academic_year: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
      defaultValue: 'ACTIVE',
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
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
    modelName: 'Class',
    tableName: 'classes',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['school_id', 'grade', 'section', 'academic_year'],
        name: 'class_unique_constraint',
      },
      {
        fields: ['status'],
        name: 'class_status_index',
      },
    ],
  }
);

// Define associations after all models are initialized
export function initClassAssociations() {
  const { School, Student, Teacher, Subject } = sequelize.models;
  
  Class.belongsTo(School, {
    foreignKey: 'school_id',
    as: 'school',
  });

  Class.belongsTo(Teacher, {
    foreignKey: 'class_teacher_id',
    as: 'classTeacher',
  });

  Class.hasMany(Student, {
    foreignKey: 'class_id',
    as: 'students',
  });

  Class.belongsToMany(Teacher, {
    through: 'class_teachers',
    foreignKey: 'class_id',
    otherKey: 'teacher_id',
    as: 'teachers',
  });

  Class.belongsToMany(Subject, {
    through: 'class_subjects',
    foreignKey: 'class_id',
    otherKey: 'subject_id',
    as: 'subjects',
  });
}

export default Class;