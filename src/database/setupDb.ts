import { Sequelize, ModelIndexesOptions, IndexesOptions } from 'sequelize';
import { runMigrations } from './migrations';
import sequelize from '../config/database';

// Import all models
import '../models/User';
import '../models/School';
import '../models/Class';
import '../models/Student';
import '../models/Subscription';
import '../models/RolePermission';

// Initialize model associations
import { initSubscriptionAssociations } from '../models/Subscription';
import { initSchoolAssociations } from '../models/School';

// Convert camelCase to snake_case
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

// Helper function to safely handle index fields
function processIndexField(field: string | { name: string } | any): string {
  if (typeof field === 'string') {
    return field.includes('_') ? `"${field}"` : `"${toSnakeCase(field)}"`;
  }
  if (field && typeof field === 'object' && 'name' in field) {
    return field.name.includes('_') ? `"${field.name}"` : `"${toSnakeCase(field.name)}"`;
  }
  throw new Error(`Unsupported index field type: ${field}`);
}

// Helper function to get field name for index
function getFieldName(field: string | { name: string } | any): string {
  if (typeof field === 'string') {
    return field;
  }
  if (field && typeof field === 'object' && 'name' in field) {
    return field.name;
  }
  // Default to empty string if field type is not supported
  console.warn(`Warning: Unsupported field type for index name generation: ${field}`);
  return '';
}

export async function setupDatabase() {
  try {
    // Run migrations first
    await runMigrations();
    console.log('Migrations completed successfully');

    // Initialize associations
    initSubscriptionAssociations();
    initSchoolAssociations();

    // Sync database with force: true to recreate tables
    await sequelize.sync({ 
      force: true,
      // Create tables first without indexes
      hooks: false
    });

    // Now create indexes separately for each model
    const models = sequelize.models;
    for (const modelName in models) {
      const model = models[modelName];
      if (model.options.indexes && model.options.indexes.length > 0) {
        try {
          for (const index of model.options.indexes) {
            try {
              if (!index.fields) {
                console.warn(`Warning: Index in model ${modelName} has no fields defined`);
                continue;
              }

              // Process each field safely
              const fields = index.fields.map(processIndexField).join(', ');
              
              // Generate a safe index name
              const safeIndexName = index.name || 
                `${modelName.toLowerCase()}_${index.fields
                  .map(field => toSnakeCase(getFieldName(field)))
                  .filter(name => name) // Remove empty strings
                  .join('_')}_idx`;

              const uniqueClause = index.unique ? 'UNIQUE' : '';
              const sql = `CREATE ${uniqueClause} INDEX IF NOT EXISTS "${safeIndexName}" ON "${model.tableName}" (${fields})`;
              
              await sequelize.query(sql);
              console.log(`Created index: ${safeIndexName} for model ${modelName}`);
            } catch (error: any) {
              console.warn(`Warning: Could not create index ${index.name} for model ${modelName}: ${error.message}`);
            }
          }
        } catch (error: any) {
          console.warn(`Warning: Error creating indexes for ${modelName}: ${error.message}`);
        }
      }
    }

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  }
}

// Run if this file is being run directly
if (require.main === module) {
  setupDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default setupDatabase;