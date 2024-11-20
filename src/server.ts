import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import config from './config';
import sequelize from './config/database';
import seedDatabase from './seeders';
import { requestLogger, notFoundHandler } from './middleware/requestLogger';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// Import and initialize model associations
import { initializeAssociations } from './models';

// Import all models to ensure they are registered with Sequelize
import './models/User';
import './models/Student';
import './models/Class';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import studentRoutes from './routes/studentRoutes';
import classRoutes from './routes/classRoutes';
import assignmentRoutes from './routes/assignmentRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import schoolRoutes from './routes/schoolRoutes';

const app = express();

// CORS configuration - Allow all origins and headers
app.use(cors({
  origin: true, // Allow all origins
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: '*', // Allow all headers
  exposedHeaders: '*', // Expose all headers
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use(requestLogger);

// Add permissive CORS headers to all responses
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Expose-Headers', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.status(204).send();
  }
  next();
});

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'School Management API',
      version: '1.0.0',
      description: 'API Documentation for School Management System',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/routes/*.ts'], // path to your API routes
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes - make sure both /api and non-api routes work
const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/students', studentRoutes);
apiRouter.use('/classes', classRoutes);
apiRouter.use('/assignments', assignmentRoutes);
apiRouter.use('/attendance', attendanceRoutes);

// Add this where other routes are mounted
apiRouter.use('/schools', schoolRoutes);
// Mount routes both with and without /api prefix
app.use('/api', apiRouter);
app.use('/', apiRouter);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message
  });
});

const startServer = async () => {
  try {
    // Initialize model associations
    initializeAssociations();
    
    // Drop and recreate tables
    await sequelize.sync({ force: true });
    console.log('Database synced successfully');

    // Seed database if needed
    if (process.env.NODE_ENV === 'development') {
      await seedDatabase();
      console.log('Database seeded successfully');
    }

    const PORT = config.port || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();