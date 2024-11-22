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
  photo_url?: string;
}

interface Parents {
  father: ParentInfo;
  mother: ParentInfo;
}

class Student extends Model {
  public id!: string;
  public user_id!: string;
  public first_name!: string;
  public last_name!: string;
  public roll_number!: string;
  public class_name!: string;
  public photo_url?: string;
  public blood_group!: string;
  public medical_info!: MedicalInfo;
  public parents!: Parents;
  public created_at!: Date;
  public updated_at!: Date;

  // Add association accessors
  public readonly user?: User;
}

Student.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: UUIDV4,
    primaryKey: true,
  },
  user_id: {
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
  first_name: {
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
  last_name: {
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
  roll_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      name: 'students_roll_number_unique',
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
  class_name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: "Class name is required" },
      notEmpty: { msg: "Class name cannot be empty" }
    }
  },
  photo_url: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: {
        msg: "Photo URL must be a valid URL"
      }
    }
  },
  blood_group: {
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
  medical_info: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      allergies: [],
      medications: []
    },
    validate: {
      isValidMedicalInfo(value: MedicalInfo) {
        if (!value || typeof value !== 'object') {
          throw new Error('Medical info must be an object');
        }
        if (!Array.isArray(value.allergies)) {
          throw new Error('Allergies must be an array');
        }
        if (!Array.isArray(value.medications)) {
          throw new Error('Medications must be an array');
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
          throw new Error('Parents info must be an object');
        }
        
        const validateParentInfo = (info: ParentInfo, type: string) => {
          if (!info || typeof info !== 'object') {
            throw new Error(`${type} info must be an object`);
          }
          if (!info.name || typeof info.name !== 'string') {
            throw new Error(`${type}'s name is required and must be a string`);
          }
          if (!info.phone || typeof info.phone !== 'string') {
            throw new Error(`${type}'s phone is required and must be a string`);
          }
          if (!info.email || typeof info.email !== 'string') {
            throw new Error(`${type}'s email is required and must be a string`);
          }
          if (info.photo_url && typeof info.photo_url !== 'string') {
            throw new Error(`${type}'s photo URL must be a string`);
          }
        };

        validateParentInfo(value.father, 'Father');
        validateParentInfo(value.mother, 'Mother');
      }
    }
  }
}, {
  sequelize,
  modelName: 'Student',
  tableName: 'students',
  underscored: true,
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['roll_number'],
      name: 'students_roll_number_unique'
    },
    {
      fields: ['user_id'],
      name: 'students_user_id_index'
    }
  ]
});

// Export the association initialization function
export function initStudentAssociations() {
  Student.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE'
  });
}

export default Student;