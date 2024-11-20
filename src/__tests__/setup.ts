import { sequelize, syncDatabase } from '../config/database';

beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Test database connection established.');
    
    // Sync database with force true to reset tables
    await syncDatabase(true);
    console.log('Test database synced.');
  } catch (error) {
    console.error('Unable to connect to the test database:', error);
    throw error;
  }
});

beforeEach(async () => {
  // Clear all tables before each test
  const models = Object.values(sequelize.models);
  for (const model of models) {
    await model.destroy({ where: {}, force: true });
  }
});

afterAll(async () => {
  // Close database connection
  await sequelize.close();
  console.log('Test database connection closed.');
});
