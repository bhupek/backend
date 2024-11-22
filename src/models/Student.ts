import { Model, DataTypes, UUIDV4 } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface MedicalInfo {
  allergies: string[];
  medications: string[];
}

interface ParentInfo {
  name: string;
  phone: string;
  email: string;
  photoUrl?: string;
}

interface Parents {
  father: ParentInfo;
  mother: ParentInfo;
}

class Student extends Model {
  public id!: string;
  public userId!: string;
  public firstName!: string;
  public lastName!: string;
  public rollNo!: string;
  public className!: string;
  public photoUrl?: string;
  public bloodGroup!: string;
  public medicalInfo!: MedicalInfo;
  public parents!: Parents;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Student.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    validate: {
      notNull: { msg: "User ID is required" },
      notEmpty: { msg: "User ID cannot be empty" }
    }
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: "First name is required" },
      notEmpty: { msg: "First name cannot be empty" },
      len: {
        args: [2, 50],
        msg: "First name must be between 2 and 50 characters"
      }
    }
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: "Last name is required" },
      notEmpty: { msg: "Last name cannot be empty" },
      len: {
        args: [2, 50],
        msg: "Last name must be between 2 and 50 characters"
      }
    }
  },
  rollNo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      name: 'unique_roll_number',
      msg: 'Roll number already exists'
    },
    validate: {
      notNull: { msg: "Roll number is required" },
      notEmpty: { msg: "Roll number cannot be empty" },
      len: {
        args: [2, 20],
        msg: "Roll number must be between 2 and 20 characters"
      }
    }
  },
  className: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: "Class name is required" },
      notEmpty: { msg: "Class name cannot be empty" }
    }
  },
  photoUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: {
        msg: "Invalid photo URL format"
      }
    }
  },
  bloodGroup: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: "Blood group is required" },
      notEmpty: { msg: "Blood group cannot be empty" },
      isIn: {
        args: [['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']],
        msg: "Invalid blood group"
      }
    }
  },
  medicalInfo: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      allergies: [],
      medications: []
    },
    validate: {
      isValidMedicalInfo(value: MedicalInfo) {
        if (!value || typeof value !== 'object') {
          throw new Error('Invalid medical info format');
        }
        if (!Array.isArray(value.allergies) || !Array.isArray(value.medications)) {
          throw new Error('Allergies and medications must be arrays');
        }
      }
    }
  },
  parents: {
    type: DataTypes.JSONB,
    allowNull: false,
    validate: {
      isValidParents(value: Parents) {
        if (!value || typeof value !== 'object') {
          throw new Error('Invalid parents info format');
        }
        if (!value.father || !value.mother) {
          throw new Error('Both father and mother information are required');
        }
        ['father', 'mother'].forEach(parent => {
          const info = value[parent as keyof Parents] as ParentInfo;
          if (!info.name || !info.phone || !info.email) {
            throw new Error(`${parent} information is incomplete`);
          }
          if (info.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email)) {
            throw new Error(`Invalid ${parent} email format`);
          }
          if (info.phone && !/^\+?[\d\s-]{10,}$/.test(info.phone)) {
            throw new Error(`Invalid ${parent} phone format`);
          }
          if (info.photoUrl && !/^https?:\/\/.+/.test(info.photoUrl)) {
            throw new Error(`Invalid ${parent} photo URL format`);
          }
        });
      }
    }
  }
}, {
  sequelize,
  modelName: 'Student',
  tableName: 'students',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId']
    },
    {
      unique: true,
      fields: ['rollNo']
    }
  ]
});

// Set up associations
Student.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE'
});

export default Student;