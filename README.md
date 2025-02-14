# School Management System - SaaS Platform

A comprehensive Software-as-a-Service (SaaS) school management system built with Next.js 13, Tailwind CSS, TypeScript, Express, and PostgreSQL. Designed to serve multiple schools with isolated data and customizable features.

## Tech Stack

### Frontend
- **Framework**: Next.js 13 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **UI Components**: 
  - Shadcn/ui
  - Radix UI
  - Lucide Icons
- **Forms**: React Hook Form with Zod
- **Authentication**: Next-Auth.js
- **Charts**: Recharts
- **Data Tables**: TanStack Table
- **Animations**: Framer Motion

### Backend
- **Backend Framework**: Express.js with TypeScript
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **API Documentation**: Swagger/OpenAPI
- **Validation**: Zod
- **Authentication**: JWT with role-based access control
- **Error Handling**: Global error handler with custom AppError class

## Database Models

### Core Models
- **School**
  - UUID-based primary key
  - Basic school information (name, address, contact)
  - Customization settings (theme, features)
  - Subscription and billing details
  - Role configuration

- **SchoolBranch**
  - UUID-based primary key
  - Branch-specific details
  - Main branch designation
  - Capacity and facilities
  - Status management

- **Class**
  - UUID-based primary key
  - Grade and section information
  - Academic year tracking
  - Capacity management
  - School branch association

- **Teacher**
  - UUID-based primary key
  - Professional details
  - Subject specializations
  - Class assignments
  - Schedule management

- **Student**
  - UUID-based primary key
  - Academic information
  - Class enrollment
  - Attendance tracking
  - Performance records

- **Attendance**
  - UUID-based primary key
  - Daily attendance tracking
  - Multiple status options
  - Teacher marking system
  - Remarks and notes

- **Address**
  - UUID-based primary key
  - Detailed location information
  - Geocoding support
  - Address validation
  - Multiple address types

### Database Design
- **Naming Convention**: Consistent snake_case for all database columns
- **Primary Keys**: UUID v4 for all tables
- **Foreign Keys**: Explicit references with appropriate constraints
- **Timestamps**: created_at and updated_at for all tables
- **Indexes**: Optimized for common queries and unique constraints

## API Endpoints

### Authentication
- **POST /api/auth/login**
  - Login user with email and password
  - Returns JWT token and user details
  
- **POST /api/auth/register**
  - Register new user
  - Validates email uniqueness
  - Handles password hashing

### School Management
- **POST /api/schools**
  - Create new school
  - Initialize school settings
  - Set up role configuration

- **GET /api/schools/:id**
  - Retrieve school details
  - Include branch information
  - Load customization settings

### Class Management
- **POST /api/classes**
  - Create new class
  - Associate with school branch
  - Set capacity and status

- **GET /api/classes**
  - List classes with filters
  - Include teacher assignments
  - Show capacity status

### Student Management
- **POST /api/students**
  - Create student profile
  - Assign to class
  - Generate student ID

- **GET /api/students**
  - List students with filters
  - Include class information
  - Show attendance status

### Attendance Management
- **POST /api/attendance**
  - Mark daily attendance
  - Multiple status options
  - Bulk attendance marking

- **GET /api/attendance/report**
  - Generate attendance reports
  - Filter by date range
  - Export capabilities

## Development Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- TypeScript knowledge
- Basic understanding of ORMs

### Installation
```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Update database configuration
# Edit .env file with your PostgreSQL credentials

# Run database migrations
npm run migration:up

# Start development server
npm run dev
```

### Database Commands
```bash
# Create new migration
npm run migration:create

# Run migrations
npm run migration:up

# Rollback migrations
npm run migration:down

# Reset database
npm run reset-db
```

### Code Style
- TypeScript strict mode enabled
- ESLint for code linting
- Prettier for code formatting
- Consistent naming conventions
  - snake_case for database columns
  - camelCase for JavaScript/TypeScript variables
  - PascalCase for class names

## Recent Updates

### Database Improvements
- Converted all models to use snake_case naming
- Added explicit foreign key references
- Optimized index configurations
- Improved model validations

### Model Enhancements
- **Address**: Added postal code indexing
- **Class**: Refined string lengths and validations
- **SchoolBranch**: Improved main branch handling
- **Attendance**: Enhanced status tracking

### Seeding Process
- Added comprehensive error handling
- Improved data consistency
- Fixed variable scoping issues
- Added transaction support

### Security Updates
- Enhanced role-based access control
- Improved data validation
- Added audit logging capability
- Enhanced error handling

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.
