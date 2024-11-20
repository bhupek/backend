import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'School Management System API',
      version: '1.0.0',
      description: 'API documentation for School Management System',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>'
        },
      },
      schemas: {
        LoginResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'JWT token to be used for authentication'
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'integer' },
                name: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string' }
              }
            }
          }
        },
        Student: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            userId: { type: 'integer' },
            rollNumber: { type: 'string' },
            dateOfBirth: { type: 'string', format: 'date' },
            address: { type: 'string' }
          }
        },
        Class: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            grade: { type: 'string' },
            section: { type: 'string' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'teacher', 'student'] }
          }
        }
      }
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management endpoints' },
      { name: 'Students', description: 'Student management endpoints' },
      { name: 'Classes', description: 'Class management endpoints' },
      { name: 'Documents', description: 'Document management endpoints' },
      { name: 'Fees', description: 'Fee management endpoints' },
      { name: 'Notifications', description: 'Notification system endpoints' },
      { name: 'Assignments', description: 'Assignment management endpoints' },
      { name: 'Attendance', description: 'Attendance management endpoints' }
    ],
    security: [{
      bearerAuth: [],
    }],
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

export const specs = swaggerJsdoc(options);