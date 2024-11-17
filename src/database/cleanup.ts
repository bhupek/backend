import sequelize from '../config/database';

async function cleanupDatabase() {
  try {
    // Drop all tables
    await sequelize.drop();
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