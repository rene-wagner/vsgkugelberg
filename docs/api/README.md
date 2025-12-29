# VSG Kugelberg API

## Overview

The VSG Kugelberg API is a RESTful backend service designed to power the VSG Kugelberg web application. It provides a comprehensive content management system with authentication, user management, and multi-faceted content organization through posts, categories, tags, and departments.

## Purpose

This API serves as the backend infrastructure for managing organizational content, enabling:

- Secure user authentication and authorization
- Content creation, publication, and management
- Hierarchical content organization through categories and tags
- Department-based content structuring
- Multi-author support with proper attribution

## Key Features

### Authentication & Authorization
- JWT-based authentication with secure token management
- Passport.js integration with local strategy
- Cookie-based session handling
- Protected routes with authentication guards
- Support for username or email-based login
- Password reset via email with secure time-limited tokens

### Content Management
- **Posts**: Create, read, update, and delete blog posts or articles
  - Automatic slug generation from titles
  - Draft and published states
  - Author attribution
  - Content categorization and tagging
  
- **Categories**: Organize content into hierarchical categories
  - Unique slugs for SEO-friendly URLs
  - Description support
  - Many-to-many relationship with posts

- **Tags**: Flexible content labeling system
  - Lightweight content classification
  - Many-to-many relationship with posts

- **Departments**: Organizational structure representation
  - Short and long descriptions
  - Unique identification through slugs

### User Management
- User registration and profile management
- Secure password hashing with bcrypt
- User-to-posts relationship tracking
- Email and username uniqueness enforcement

### Data Validation
- Request validation using express-validator
- Type-safe data handling
- Comprehensive error messages

### Error Handling
- Custom HTTP error classes
- Centralized error handling middleware
- Consistent error response format
- 404 handling for undefined routes

## API Endpoints

### Authentication (`/api/auth`)
- `POST /login` - Authenticate user and receive JWT token
- `POST /logout` - Invalidate user session
- `POST /forgot-password` - Request a password reset email
- `POST /reset-password` - Reset password using a valid token

### Users (`/api/users`)
- `GET /users` - List all users (protected)
- `GET /users/:id` - Get user by ID (protected)
- `POST /users` - Create new user
- `PUT /users/:id` - Update user (protected)
- `DELETE /users/:id` - Delete user (protected)

### Posts (`/api/posts`)
- `GET /posts` - List all posts
- `GET /posts/:id` - Get post by ID
- `POST /posts` - Create new post (protected)
- `PUT /posts/:id` - Update post (protected)
- `DELETE /posts/:id` - Delete post (protected)

### Categories (`/api/categories`)
- `GET /categories` - List all categories
- `GET /categories/:id` - Get category by ID
- `POST /categories` - Create new category (protected)
- `PUT /categories/:id` - Update category (protected)
- `DELETE /categories/:id` - Delete category (protected)

### Tags (`/api/tags`)
- `GET /tags` - List all tags
- `GET /tags/:id` - Get tag by ID
- `POST /tags` - Create new tag (protected)
- `PUT /tags/:id` - Update tag (protected)
- `DELETE /tags/:id` - Delete tag (protected)

### Departments (`/api/departments`)
- `GET /departments` - List all departments
- `GET /departments/:id` - Get department by ID
- `POST /departments` - Create new department (protected)
- `PUT /departments/:id` - Update department (protected)
- `DELETE /departments/:id` - Delete department (protected)

### Health Check (`/api/health`)
- `GET /health` - API health status check

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- pnpm package manager

### Installation

1. Install dependencies:
```bash
cd apps/api
pnpm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `JWT_EXPIRATION` - Token expiration time (e.g., "1h")
- `NODE_ENV` - Environment (development/production)
- `APP_URL` - Base URL for the application (used in password reset emails)
- `EMAIL_PROVIDER` - Email provider: "console" (default, logs to console) or "smtp"
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` - SMTP configuration (required when EMAIL_PROVIDER=smtp)

3. Set up the database:
```bash
pnpm prisma:migrate
pnpm prisma:seed
```

4. Start the development server:
```bash
pnpm dev
```

The API will be available at `http://localhost:3000`

## Testing

The API includes a comprehensive test suite covering all endpoints and functionality.

### Run Tests
```bash
# Run tests in watch mode
pnpm test

# Run tests once (CI mode)
pnpm test:ci

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

### Test Coverage
Tests are located in `tests/` directory with the following structure:
- `integration/` - Integration tests for all API endpoints
- `helpers.ts` - Test utilities and helper functions
- `setup.ts` - Test environment configuration

## Database Management

### Prisma Commands
```bash
# Generate Prisma Client
pnpm prisma:generate

# Create a new migration
pnpm prisma:migrate

# Apply migrations (production)
pnpm prisma:deploy

# Open Prisma Studio (GUI)
pnpm prisma:studio

# Seed the database
pnpm prisma:seed
```

## Security Considerations

- Passwords are hashed using bcrypt before storage
- JWT tokens are signed with a secret key
- Sensitive routes are protected with authentication middleware
- SQL injection prevention through Prisma ORM
- Input validation on all endpoints
- CORS configuration is controlled via the `CORS_ORIGINS` environment variable (with `http://localhost:5173` allowed by default in development)
- Password reset tokens are 256-bit cryptographically random, SHA-256 hashed before storage, and expire after 60 minutes
- Password reset responses are generic to prevent user enumeration attacks

## Author

René Wagner

## License

ISC
