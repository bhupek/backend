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
import analyticsRoutes from './routes/analyticsRoutes';
import adminRoutes from './routes/admin.routes';

const app = express();

// CORS configuration - Allow frontend requests
app.use(cors({
  origin: 'http://localhost:3001', // Specific origin instead of wildcard
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 hours
}));

// Add CORS headers to all responses
app.use((req, res, next) => {  
  const origin = req.headers.origin; 
  if (origin === 'http://localhost:3001') {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, Accept, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use(requestLogger);

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

// Mount all routes under /api
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/students', studentRoutes);
apiRouter.use('/classes', classRoutes);
apiRouter.use('/assignments', assignmentRoutes);
apiRouter.use('/attendance', attendanceRoutes);
apiRouter.use('/schools', schoolRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/admin', adminRoutes);

// Mount the API router under /api
app.use('/api', apiRouter);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

// Handle 404 errors for unmatched routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
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