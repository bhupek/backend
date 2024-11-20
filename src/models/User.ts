import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcrypt';
import { Role } from './RolePermission';

class User extends Model {
  public id!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: Role;
  public resetPasswordToken!: string | null;
  public resetPasswordExpires!: Date | null;
  public schoolId!: string | null;
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM(...Object.values(Role)),
    defaultValue: Role.STUDENT,
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  schoolId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'schools',
      key: 'id',
    },
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  hooks: {
    beforeCreate: async (user: User) => {
      if (!user.password.startsWith('$2b$')) {
        try {
          user.password = await bcrypt.hash(user.password, 10);
        } catch (error) {
          console.error('Error during password processing');
          throw error;
        }
      }
    },
  },
});

export default User;