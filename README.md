# School Management System Backend

A robust backend system for managing school operations including student management, class management, fee collection, and more.

## Features

- 👥 User Management (Admin, Teachers, Students)
- 📚 Class Management
- 🎓 Student Management
- 💰 Fee Management
- 📄 Document Management
- 📱 Notification System
- 🔐 Authentication & Authorization
- 📊 Database Integration (PostgreSQL)

## Tech Stack

- Node.js & Express.js
- TypeScript
- PostgreSQL with Sequelize ORM
- JWT Authentication
- Redis for Caching
- Docker (optional)

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Local Setup (Without Docker)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd school-management-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL**
   - Install PostgreSQL if not already installed
   - Create a new database:
     ```sql
     CREATE DATABASE school_management;
     ```

4. **Configure environment variables**
   - Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```
   - Update the values in `.env`:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_NAME=school_management

   # JWT Configuration
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRES_IN=1h
   ```

5. **Run database migrations and seed data**
   ```bash
   npm run seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start at `http://localhost:3000`

## API Documentation

### Authentication Endpoints 

## Development with Docker

For development with hot-reloading:

1. **Start the development environment**
   ```bash
   docker-compose up --build
   ```

2. **View logs**
   ```bash
   # View all logs
   docker-compose logs -f

   # View app logs only
   docker-compose logs -f app
   ```

3. **Access services**
   - Backend API: http://localhost:3000
   - pgAdmin: http://localhost:5050
     - Login: admin@admin.com
     - Password: admin

4. **Run commands inside containers**
   ```bash
   # Run database migrations
   docker-compose exec app npm run seed

   # Open shell in app container
   docker-compose exec app sh

   # Open psql in postgres container
   docker-compose exec postgres psql -U postgres -d school_management
   ```

5. **Stop the development environment**
   ```bash
   docker-compose down
   ```

### Development Features

- Hot-reloading: Changes to your TypeScript code will automatically restart the server
- Volume mounting: Local files are mounted into the container
- PostgreSQL persistence: Database data persists between container restarts
- pgAdmin included: Manage your database through a web interface
- Redis for caching: Available for session storage or caching

### Debugging

1. **View logs in real-time**
   ```bash
   docker-compose logs -f app
   ```

2. **Check container status**
   ```bash
   docker-compose ps
   ```

3. **Inspect container**
   ```bash
   docker-compose exec app sh
   ```

4. **Reset everything**
   ```bash
   # Stop containers and remove volumes
   docker-compose down -v

   # Rebuild and start
   docker-compose up --build
   ```

## Database Setup

1. **Create the database**
   ```sql
   CREATE DATABASE school_management;
   ```

2. **Set up database schema**
   ```bash
   npm run setup-db
   ```

3. **Seed initial data**
   ```bash
   npm run seed
   ```#   b a c k e n d  
 