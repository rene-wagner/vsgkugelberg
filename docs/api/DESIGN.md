# API Design & Architecture

This document outlines the architectural decisions, design patterns, and structural organization of the VSG Kugelberg API.

## Architecture Overview

The API follows a **layered architecture** pattern with clear separation of concerns:

```
┌─────────────────────────────────────┐
│         HTTP Layer (Routes)         │
├─────────────────────────────────────┤
│   Middleware Layer (Validation,     │
│   Authentication, Error Handling)   │
├─────────────────────────────────────┤
│    Business Logic Layer (Services)  │
├─────────────────────────────────────┤
│    Data Access Layer (Prisma ORM)   │
├─────────────────────────────────────┤
│         Database (PostgreSQL)       │
└─────────────────────────────────────┘
```

## Project Structure

```
apps/api/
├── prisma/
│   ├── migrations/          # Database migration files
│   ├── schema.prisma        # Database schema definition
│   └── seed.ts              # Database seeding script
├── src/
│   ├── config/              # Configuration files
│   │   └── jwt.config.ts    # JWT configuration
│   ├── errors/              # Custom error classes
│   │   └── http-errors.ts   # HTTP error definitions
│   ├── middleware/          # Express middleware
│   │   ├── async-handler.middleware.ts
│   │   ├── auth-guard.middleware.ts
│   │   ├── error-handler.middleware.ts
│   │   ├── jwt.middleware.ts
│   │   └── validation.middleware.ts
│   ├── routes/              # API route definitions
│   │   ├── auth.routes.ts
│   │   ├── categories.routes.ts
│   │   ├── departments.routes.ts
│   │   ├── health.routes.ts
│   │   ├── index.ts         # Route aggregation
│   │   ├── posts.routes.ts
│   │   ├── tags.routes.ts
│   │   └── users.routes.ts
│   ├── services/            # Business logic services
│   │   ├── auth.service.ts
│   │   ├── categories.service.ts
│   │   ├── departments.service.ts
│   │   ├── password.service.ts
│   │   ├── posts.service.ts
│   │   ├── slugify.service.ts
│   │   ├── tags.service.ts
│   │   └── users.service.ts
│   ├── strategies/          # Passport authentication strategies
│   │   └── local.strategy.ts
│   ├── types/               # TypeScript type definitions
│   │   ├── category.types.ts
│   │   ├── department.types.ts
│   │   ├── express.d.ts     # Express type augmentation
│   │   ├── post.types.ts
│   │   ├── tag.types.ts
│   │   └── user.types.ts
│   ├── validators/          # Request validation schemas
│   │   ├── category.validators.ts
│   │   ├── department.validators.ts
│   │   ├── post.validators.ts
│   │   ├── tag.validators.ts
│   │   └── user.validators.ts
│   ├── app.ts               # Express app configuration
│   └── index.ts             # Application entry point
└── tests/
    ├── integration/         # Integration tests
    ├── helpers.ts           # Test utilities
    └── setup.ts             # Test configuration
```

## Design Patterns

### 1. Service Layer Pattern

All business logic is encapsulated in service classes, keeping routes thin and focused on HTTP concerns.

**Benefits:**
- Reusable business logic
- Easier testing through dependency injection
- Clear separation of concerns
- Single responsibility principle

**Example:**
```typescript
// Service handles business logic
class PostsService {
  constructor(private prisma: PrismaClient) {}
  
  async createPost(data: CreatePostInput) {
    // Business logic here
  }
}

// Route handles HTTP concerns
router.post('/', async (req, res) => {
  const post = await postsService.createPost(req.body)
  res.status(201).json(post)
})
```

### 2. Middleware Pipeline Pattern

Request processing flows through a series of middleware functions:

1. **Body Parsing** (`express.json()`)
2. **Cookie Parsing** (`cookie-parser`)
3. **Authentication** (Passport.js)
4. **Route Matching** (Express Router)
5. **Validation** (express-validator)
6. **Authorization** (auth guards)
7. **Business Logic** (services)
8. **Error Handling** (centralized)

### 3. Strategy Pattern (Authentication)

Passport.js uses the Strategy pattern for authentication, allowing multiple authentication methods:

- Currently implements: **Local Strategy** (username/password)
- Easily extensible to: JWT Strategy, OAuth, etc.

### 4. Dependency Injection

Services receive their dependencies through constructor parameters:

```typescript
class AuthService {
  constructor(
    private prisma: PrismaClient,
    private passwordService: PasswordService
  ) {}
}
```

**Benefits:**
- Testability (easy to mock dependencies)
- Flexibility (swap implementations)
- Explicit dependencies

### 5. Factory Pattern (Error Handling)

Custom error classes extend a base `HttpException` class:

```typescript
class HttpException extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

class BadRequestException extends HttpException {
  constructor(message: string) {
    super(400, message)
  }
}
```

## Data Model Design

### Entity Relationship Diagram

```
┌──────────────┐
│     User     │
│──────────────│
│ id (PK)      │
│ username     │
│ email        │
│ password     │
│ createdAt    │
│ updatedAt    │
└──────┬───────┘
       │
       │ 1:N (author)
       │
       ▼
┌──────────────┐       ┌──────────────┐
│     Post     │ N:M   │   Category   │
│──────────────│◄─────►│──────────────│
│ id (PK)      │       │ id (PK)      │
│ title        │       │ name         │
│ slug (UNIQ)  │       │ slug (UNIQ)  │
│ content      │       │ description  │
│ published    │       │ createdAt    │
│ authorId(FK) │       │ updatedAt    │
│ createdAt    │       └──────────────┘
│ updatedAt    │
└──────┬───────┘
       │
       │ N:M
       │
       ▼
┌──────────────┐
│     Tag      │
│──────────────│
│ id (PK)      │
│ name         │
│ slug (UNIQ)  │
│ createdAt    │
│ updatedAt    │
└──────────────┘

┌──────────────┐
│  Department  │ (Independent)
│──────────────│
│ id (PK)      │
│ name         │
│ slug (UNIQ)  │
│ shortDesc    │
│ longDesc     │
│ createdAt    │
│ updatedAt    │
└──────────────┘
```

### Design Decisions

#### 1. Slug-Based URLs
- All content types use slugs for SEO-friendly URLs
- Slugs are unique and indexed for performance
- Automatic slug generation from names/titles

#### 2. Many-to-Many Relationships
- Posts can have multiple categories and tags
- Categories and tags can be associated with multiple posts
- Prisma handles join tables implicitly

#### 3. Cascade Deletes
- Deleting a user deletes all their posts
- Maintains referential integrity
- Prevents orphaned records

#### 4. Timestamps
- All entities track `createdAt` and `updatedAt`
- Automatic timestamp management by Prisma
- Useful for auditing and sorting

#### 5. Published State
- Posts have a `published` boolean flag
- Allows draft management
- Default: false (draft state)

## Authentication & Authorization Flow

### Authentication Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ 1. POST /api/auth/login
     │    {username, password}
     ▼
┌─────────────────┐
│  Local Strategy │
└────┬────────────┘
     │
     │ 2. Validate credentials
     ▼
┌─────────────────┐
│  Auth Service   │
└────┬────────────┘
     │
     │ 3. Generate JWT
     ▼
┌─────────────────┐
│     Client      │
│  (stores token) │
└─────────────────┘
```

### Authorization Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ 1. Request with JWT in cookie
     ▼
┌─────────────────┐
│ JWT Middleware  │ Verifies token
└────┬────────────┘
     │
     │ 2. Attach user to req.user
     ▼
┌─────────────────┐
│  Auth Guard     │ Checks req.user exists
└────┬────────────┘
     │
     │ 3. Allow/Deny access
     ▼
┌─────────────────┐
│ Route Handler   │
└─────────────────┘
```

### JWT Token Structure

```json
{
  "username": "user123",
  "sub": 1,
  "iat": 1234567890,
  "exp": 1234571490
}
```

- `sub`: Subject (user ID)
- `username`: For quick reference
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp

## Request/Response Flow

### Typical Request Flow

1. **Request arrives** → Express receives HTTP request
2. **Body parsing** → JSON payload parsed
3. **Cookie parsing** → JWT extracted from cookies
4. **Authentication** → JWT validated (if present)
5. **Route matching** → Express router finds handler
6. **Validation** → Request data validated
7. **Authorization** → Auth guard checks permissions (if required)
8. **Business logic** → Service layer processes request
9. **Database operation** → Prisma executes query
10. **Response** → JSON response sent to client

### Error Handling Flow

```
┌─────────────────┐
│  Any Layer      │
└────┬────────────┘
     │
     │ Throw HttpException
     ▼
┌─────────────────────────┐
│ Async Handler Middleware │ Catches async errors
└────┬────────────────────┘
     │
     ▼
┌─────────────────────────┐
│ Error Handler Middleware │ Formats error response
└────┬────────────────────┘
     │
     │ Returns JSON
     ▼
┌─────────────────┐
│     Client      │
└─────────────────┘
```

## Validation Strategy

### Three-Layer Validation

1. **Type Safety** (TypeScript)
   - Compile-time type checking
   - Interface/type definitions
   - Prevents type errors

2. **Schema Validation** (express-validator)
   - Runtime validation of request data
   - Sanitization of inputs
   - Custom validation rules

3. **Database Constraints** (Prisma/PostgreSQL)
   - Unique constraints
   - Foreign key constraints
   - Not-null constraints

### Validation Chain Example

```typescript
export const createPostValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be 1-255 characters'),
  body('content')
    .optional()
    .isString()
    .withMessage('Content must be a string'),
  body('published')
    .optional()
    .isBoolean()
    .withMessage('Published must be a boolean'),
]
```

## Error Handling Design

### Custom Error Classes

```
HttpException (base)
├── BadRequestException (400)
├── UnauthorizedException (401)
├── ForbiddenException (403)
├── NotFoundException (404)
└── InternalServerErrorException (500)
```

### Error Response Format

```json
{
  "status": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Security Design

### Password Security
- Passwords hashed with bcrypt
- Cost factor: 10 (configurable)
- Passwords never returned in responses
- Password validation before storage

### JWT Security
- Tokens signed with secret key
- Configurable expiration time
- Stored in HTTP-only cookies (recommended for production)
- Token verification on protected routes

### Input Sanitization
- XSS prevention through validation
- SQL injection prevention via Prisma
- Request body size limits
- Type validation on all inputs

### Authentication Best Practices
- No password in responses
- Token-based stateless authentication
- Protected route middleware
- Username or email login support

## API Design Principles

### RESTful Design
- Resource-based URLs (`/api/posts`, `/api/users`)
- HTTP methods indicate operations
- Proper HTTP status codes
- JSON request/response format

### Consistent Response Structure

**Success Response:**
```json
{
  "id": 1,
  "title": "My Post",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

**List Response:**
```json
[
  { "id": 1, "title": "Post 1" },
  { "id": 2, "title": "Post 2" }
]
```

**Error Response:**
```json
{
  "status": 400,
  "message": "Error description"
}
```

### URL Structure
- `/api` - Base path for all API endpoints
- `/api/{resource}` - Resource collection
- `/api/{resource}/{id}` - Specific resource
- Slugs used where appropriate for SEO

## Performance Considerations

### Database Optimization
- Indexed slug fields for fast lookups
- Efficient join queries through Prisma
- Connection pooling handled by Prisma
- Cascade deletes for cleanup

### Code Optimization
- Async/await for non-blocking I/O
- Middleware pipeline optimization
- Lazy loading where appropriate
- Type safety reduces runtime checks

## Testing Strategy

### Test Structure
```
tests/
├── integration/         # End-to-end API tests
│   ├── auth.test.ts
│   ├── posts.test.ts
│   └── ...
├── helpers.ts           # Test utilities
└── setup.ts             # Test environment
```

### Testing Approach
1. **Integration Tests**: Test entire request/response cycle
2. **Test Database**: Separate test database
3. **Test Isolation**: Each test is independent
4. **Comprehensive Coverage**: All endpoints tested

### Test Categories
- Authentication flows
- CRUD operations
- Validation rules
- Error handling
- Authorization checks

## Scalability Considerations

### Current Architecture
- Stateless API (horizontal scaling ready)
- Database-agnostic through Prisma
- Modular service architecture

### Future Scalability
- Add Redis for caching
- Implement rate limiting
- Add load balancing
- Database read replicas
- Message queue for background jobs
- Microservices separation if needed

## Code Quality Standards

### TypeScript Usage
- Strict mode enabled
- No implicit any
- Type definitions for all functions
- Interface segregation

### Code Organization
- Single responsibility principle
- DRY (Don't Repeat Yourself)
- Clear naming conventions
- Separation of concerns

### Documentation
- JSDoc comments for complex logic
- Type definitions as documentation
- Comprehensive README
- Architecture documentation (this file)

## Development Workflow

### Local Development
1. Install dependencies
2. Set up environment variables
3. Run database migrations
4. Seed database
5. Start development server
6. Run tests

### CI/CD Considerations
- Automated testing on push
- Database migrations in deployment
- Environment-specific configuration
- Health check endpoint for monitoring

## Future Enhancements

### Planned Improvements
1. **API Documentation**: OpenAPI/Swagger specification
2. **Rate Limiting**: Request throttling
3. **Caching**: Redis integration
4. **Logging**: Winston or Pino
5. **Monitoring**: APM integration
6. **File Upload**: Image/document handling
7. **Email**: Transactional email service
8. **Pagination**: Cursor-based pagination
9. **Filtering**: Advanced query parameters
10. **Versioning**: API version management

### Security Enhancements
- CORS configuration
- Helmet for security headers
- Rate limiting per IP
- API key authentication option
- OAuth integration
- Two-factor authentication

## Conclusion

The VSG Kugelberg API is built with scalability, maintainability, and security in mind. The layered architecture, clear separation of concerns, and comprehensive testing ensure a robust foundation for future growth. The modular design allows for easy extension and modification as requirements evolve.
