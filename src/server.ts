import express from 'express';
import cors from 'cors';
import { config } from './config';
import routes from './routes';
import { sequelize, syncDatabase } from './config/database';
import { initAssociations } from './models/associations';
import { handleError, notFound } from './utils/errorHandler';

const app = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001', process.env.FRONTEND_URL].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['set-cookie'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Enable pre-flight requests for all routes
app.options('*', cors(corsOptions));

// API routes
app.use('/api', routes);

// Handle 404 errors
app.use(notFound);

// Global error handler
app.use(handleError);

const PORT = process.env.PORT || 3001;

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Initialize model associations
    initAssociations();

    // Sync database (set force to true only in development)
    const isDev = process.env.NODE_ENV === 'development';
    await syncDatabase(isDev); // This will recreate all tables in development

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();

export default app;