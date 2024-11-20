import fs from 'fs';
import path from 'path';
import sequelize from '../../config/database';

export async function runMigrations() {
  const migrationsDir = path.join(__dirname);
  
  // Create migrations directory if it doesn't exist
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }
  
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  for (const file of files) {
    if (file.endsWith('.sql')) {
      const migration = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      try {
        await sequelize.query(migration);
        console.log(`Executed migration: ${file}`);
      } catch (error) {
        console.error(`Error executing migration ${file}:`, error);
        throw error;
      }
    }
  }
}
