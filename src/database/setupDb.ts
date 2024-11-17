import sequelize from '../config/database';
import '../models/User'; // Import models to ensure they are registered

async function setupDatabase() {
  try {
    // Sync all models with the database
    await sequelize.sync({ force: true });
    console.log('Database schema created successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  } 
  
}

// Run if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default setupDatabase;