import express from 'express';
import cors from 'cors';
import config from './config';
import sequelize from './config/database';
import seedDatabase from './seeders';
import { requestLogger, notFoundHandler } from './middleware/requestLogger';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// Import all models to ensure they are registered with Sequelize
import './models/User';
import './models/Student';
import './models/Class';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import studentRoutes from './routes/studentRoutes';
import classRoutes from './routes/classRoutes';

const app = express();

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'School Management System API',
      version: '1.0.0',
      description: 'API documentation for School Management System',
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [__dirname + '/routes/*.ts', __dirname + '/routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:65026'], // Add all your frontend origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use(requestLogger);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes - make sure both /api and non-api routes work
const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/students', studentRoutes);
apiRouter.use('/classes', classRoutes);

// Mount routes both with and without /api prefix
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Add OPTIONS handler for preflight requests
app.options('*', cors(corsOptions));

// 404 handler - add this after all routes
app.use(notFoundHandler);

async function startServer() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync database
    await sequelize.sync({ force: true });
    console.log('Database synced successfully.');

    // Seed database
    await seedDatabase();
    console.log('Database seeded successfully.');

    // Start server
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
      console.log(`Swagger documentation available at http://localhost:${config.port}/api-docs`);
      console.log('Available routes:');
      console.log('- POST /api/auth/login or POST /auth/login');
      console.log('- POST /api/auth/register or POST /auth/register');
      console.log('- GET /api/auth/me or GET /auth/me');
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

startServer();