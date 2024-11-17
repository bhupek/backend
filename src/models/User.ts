import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcrypt';

class User extends Model {
  public id!: string;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: string;
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
    type: DataTypes.ENUM('admin', 'teacher', 'student'),
    defaultValue: 'student',
  },
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  hooks: {
    beforeCreate: async (user: User) => {
      // Only hash the password if it hasn't been hashed already
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