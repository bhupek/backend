import { syncDatabase } from './src/config/database';
import seedDatabase from './src/seeders';

async function seed() {
  try {
    // Sync database (this will create tables)
    console.log('Syncing database...');
    await syncDatabase(true); // true means it will drop existing tables
    
    // Run the seeder
    console.log('Running seeders...');
    await seedDatabase();
    
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
