import sequelize from '../config/database';

async function cleanupDatabase() {
  try {
    // Drop all tables and types
    await sequelize.query('DROP SCHEMA IF EXISTS public CASCADE;');
    await sequelize.query('CREATE SCHEMA public;');
    await sequelize.query('GRANT ALL ON SCHEMA public TO public;');
    console.log('Database cleaned successfully');
  } catch (error) {
    console.error('Error cleaning database:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  cleanupDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default cleanupDatabase;