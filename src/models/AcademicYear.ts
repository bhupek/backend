import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import School from './School';

interface AcademicYearAttributes {
  id: string;
  schoolId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class AcademicYear extends Model<AcademicYearAttributes> implements AcademicYearAttributes {
  public id!: string;
  public schoolId!: string;
  public name!: string;
  public startDate!: Date;
  public endDate!: Date;
  public isCurrent!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;

  // Associations
  public readonly school?: School;
}

AcademicYear.init(
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
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isCurrent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    modelName: 'AcademicYear',
    tableName: 'academic_years',
    timestamps: true,
    hooks: {
      beforeCreate: async (academicYear: AcademicYear) => {
        // If this academic year is set as current, unset other current academic years
        if (academicYear.isCurrent) {
          await AcademicYear.update(
            { isCurrent: false },
            {
              where: {
                schoolId: academicYear.schoolId,
                isCurrent: true,
              },
            }
          );
        }
      },
      beforeUpdate: async (academicYear: AcademicYear) => {
        // If this academic year is being set as current, unset other current academic years
        if (academicYear.isCurrent) {
          await AcademicYear.update(
            { isCurrent: false },
            {
              where: {
                schoolId: academicYear.schoolId,
                isCurrent: true,
                id: { [DataTypes.Op.ne]: academicYear.id },
              },
            }
          );
        }
      },
    },
  }
);

// Define associations
AcademicYear.belongsTo(School, {
  foreignKey: 'schoolId',
  as: 'school',
});

export default AcademicYear;
