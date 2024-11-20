import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

interface AttendanceAttributes {
  id: string;
  student_id: string;
  class_id: string;
  school_id: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
  marked_by: string;
  created_at: Date;
  updated_at: Date;
}

class Attendance extends Model<AttendanceAttributes> implements AttendanceAttributes {
  public id!: string;
  public student_id!: string;
  public class_id!: string;
  public school_id!: string;
  public date!: Date;
  public status!: 'present' | 'absent' | 'late' | 'excused';
  public remarks?: string;
  public marked_by!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Associations will be defined after model initialization
  public readonly student?: any;
  public readonly class?: any;
  public readonly school?: any;
  public readonly marker?: any;
}

Attendance.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    class_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    school_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('present', 'absent', 'late', 'excused'),
      allowNull: false,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    marked_by: {
      type: DataTypes.UUID,
      allowNull: false,
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
    modelName: 'Attendance',
    tableName: 'attendance',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['student_id', 'class_id', 'date'],
        name: 'attendance_unique_constraint',
      },
      {
        fields: ['school_id'],
        name: 'attendance_school_index',
      },
      {
        fields: ['date'],
        name: 'attendance_date_index',
      },
      {
        fields: ['marked_by'],
        name: 'attendance_marker_index',
      },
    ],
  }
);

export default Attendance;

export const initAttendanceAssociations = () => {
  const { Student, Class, School } = require('./index');

  Attendance.belongsTo(Student, {
    foreignKey: 'student_id',
    as: 'student',
    onDelete: 'CASCADE',
  });

  Attendance.belongsTo(Class, {
    foreignKey: 'class_id',
    as: 'class',
    onDelete: 'CASCADE',
  });

  Attendance.belongsTo(School, {
    foreignKey: 'school_id',
    as: 'school',
    onDelete: 'CASCADE',
  });

  // Assuming we have a User model for markedBy
  const User = require('./User').default;
  Attendance.belongsTo(User, {
    foreignKey: 'marked_by',
    as: 'marker',
    onDelete: 'RESTRICT',
  });
};
