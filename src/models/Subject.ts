import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { School } from './index';

interface SubjectAttributes {
  id: string;
  name: string;
  description?: string;
  credits?: number;
  school_id: string;
  created_at: Date;
  updated_at: Date;
}

class Subject extends Model<SubjectAttributes> implements SubjectAttributes {
  public id!: string;
  public name!: string;
  public description?: string;
  public credits?: number;
  public school_id!: string;
  public created_at!: Date;
  public updated_at!: Date;

  // Add association accessors
  public readonly School?: any;
  public readonly classes?: any[];
  public readonly teachers?: any[];
}

Subject.init(
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
    credits: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    school_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'schools',
        key: 'id',
      },
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
    modelName: 'Subject',
    tableName: 'subjects',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['school_id'],
        name: 'subject_school_index',
      },
      {
        fields: ['name', 'school_id'],
        unique: true,
        name: 'subject_name_school_unique',
      },
    ],
  }
);

export const initSubjectAssociations = () => {
  const { School, Class, Teacher } = sequelize.models;

  Subject.belongsTo(School, {
    foreignKey: 'school_id',
    as: 'School',
  });

  Subject.belongsToMany(Class, {
    through: 'class_subjects',
    foreignKey: 'subject_id',
    otherKey: 'class_id',
    as: 'classes',
  });

  Subject.belongsToMany(Teacher, {
    through: 'teacher_subjects',
    foreignKey: 'subject_id',
    otherKey: 'teacher_id',
    as: 'teachers',
  });
};

export default Subject;
