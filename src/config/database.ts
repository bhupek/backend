import { Sequelize } from 'sequelize';
import config from '../config';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  logging: false,
});

export default sequelize; 