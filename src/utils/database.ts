import { Sequelize } from 'sequelize';
import { config } from '../config';

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: config.dbHost,
  port: Number(config.dbPort),
  database: config.dbName,
  username: config.dbUser,
  password: config.dbPassword,
  logging: false
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}; 