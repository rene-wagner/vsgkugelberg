# API Application

NestJS-based API for VSG Kugelberg project.

## Prerequisites

- Node.js (^20.19.0 || >=22.12.0)
- pnpm (10.22.0)
- PostgreSQL (14+)

## Database Setup

### Local Development

1. Ensure PostgreSQL is running on your machine
2. Create a database named `vsgkugelberg`:
   ```bash
   createdb vsgkugelberg
   ```

3. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

4. Update the `DATABASE_URL` in `.env` with your PostgreSQL credentials:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/vsgkugelberg"
   ```

5. Generate a secure JWT secret (min 32 characters):
   ```bash
   openssl rand -base64 32
   ```

6. Add the JWT secret and other environment variables to `.env`:
   ```
   JWT_SECRET="your-generated-secure-secret"
   FRONTEND_URL="http://localhost:5173"
   NODE_ENV="development"
   ```

### Running Migrations

To apply database migrations:

```bash
pnpm prisma:migrate
```

### Seeding the Database

To seed the database with test users:

```bash
npx prisma db seed
```

This creates three test users:
- **Username:** `admin` | **Email:** `admin@vsgkugelberg.local` | **Password:** `Admin123!`
- **Username:** `john.doe` | **Email:** `john.doe@example.com` | **Password:** `password123`
- **Username:** `test.user` | **Email:** `test@example.com` | **Password:** `testpass`

**⚠️ Security Note:** These are development/test credentials only. Never use these in production!

For production deployments:

```bash
pnpm prisma:deploy
```

### Prisma Studio

To explore and manage your database with a GUI:

```bash
pnpm prisma:studio
```

## Available Scripts

- `pnpm dev` - Start development server with watch mode
- `pnpm build` - Build the application
- `pnpm type-check` - Run TypeScript type checking
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Run ESLint with auto-fix
- `pnpm format` - Check code formatting with Prettier
- `pnpm format:fix` - Fix code formatting with Prettier
- `pnpm prisma:generate` - Generate Prisma Client
- `pnpm prisma:migrate` - Create and apply migrations (development)
- `pnpm prisma:deploy` - Apply migrations (production)
- `pnpm prisma:studio` - Open Prisma Studio

## Database Schema

### User Model

- `id` - Auto-incrementing primary key
- `username` - Unique username
- `email` - Unique email address
- `password` - Hashed password (bcrypt)
- `createdAt` - Timestamp of creation
- `updatedAt` - Timestamp of last update
- `posts` - Relation to Post model

### Post Model

- `id` - Auto-incrementing primary key
- `title` - Post title
- `slug` - URL-safe slug (unique, indexed)
- `content` - Markdown content (nullable)
- `published` - Publication status (default: false)
- `createdAt` - Timestamp of creation
- `updatedAt` - Timestamp of last update
- `authorId` - Foreign key to User
- `author` - Relation to User model

## Development

After installing dependencies, Prisma Client will be automatically generated via the `postinstall` script.

For local development:

```bash
pnpm dev
```

The API will be available at `http://localhost:3000`.

## Migration Workflow

1. Make changes to `prisma/schema.prisma`
2. Create a migration: `pnpm prisma:migrate`
3. Name the migration descriptively when prompted
4. Commit the migration files to version control
5. Apply migrations on other environments using `pnpm prisma:deploy`

**Important:** Never edit migration files that have been committed and applied to production.

## Authentication

The API uses JWT-based authentication with secure HTTP-only cookies.

### Login

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "username": "admin",  // Can be username or email
  "password": "Admin123!"
}
```

**Success Response (200 OK):**
```json
{
  "user": {
    "id": 4,
    "username": "admin",
    "email": "admin@vsgkugelberg.local",
    "createdAt": "2025-11-15T17:10:09.949Z",
    "updatedAt": "2025-11-15T17:10:09.949Z"
  }
}
```

The JWT token is automatically set in an HTTP-only cookie named `access_token` with:
- **httpOnly:** true (prevents JavaScript access)
- **secure:** true in production (HTTPS only)
- **sameSite:** strict (CSRF protection)
- **maxAge:** 1 hour

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `400 Bad Request` - Missing or invalid fields

### Protecting Routes

Use the `JwtAuthGuard` to protect routes that require authentication:

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Request() req) {
  return req.user; // { id: 4, username: 'admin' }
}
```

The authenticated user information is available in `req.user` with:
- `id` - User ID
- `username` - Username

### Environment Variables

Required environment variables:
- `JWT_SECRET` - Secret key for signing JWT tokens (min 32 characters in production)
- `NODE_ENV` - Environment mode (`development` or `production`)
- `FRONTEND_URL` - Frontend origin for CORS (default: `http://localhost:5173`)
- `DATABASE_URL` - PostgreSQL connection string

See `.env.example` for all required variables.

## End-to-End Testing

The API includes comprehensive end-to-end tests using Jest, Supertest, and @nestjs/testing to ensure all endpoints work correctly.

### Test Database Setup

E2E tests use a separate PostgreSQL database to isolate test data from development data.

1. **Create the test database:**
```bash
createdb vsgkugelberg_test
```

2. **Run migrations on test database:**
```bash
cd apps/api
DATABASE_URL="postgresql://user:secret@localhost:5432/vsgkugelberg_test" pnpm prisma migrate deploy
```

The test database connection string is configured in `apps/api/.env.test`.

### Running E2E Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run with coverage report
pnpm test:e2e:cov

# Run in watch mode
pnpm test:e2e:watch

# Run with debugger
pnpm test:e2e:debug
```

### Test Structure

E2E tests are located in `apps/api/test/e2e/` with one test file per controller:

- `health.e2e-spec.ts` - Health check endpoint (2 tests)
- `auth.e2e-spec.ts` - Authentication flows (6 tests)
- `users.e2e-spec.ts` - User CRUD operations (10 tests)
- `posts.e2e-spec.ts` - Post management and filtering (11 tests)
- `categories.e2e-spec.ts` - Category CRUD (9 tests)
- `tags.e2e-spec.ts` - Tag CRUD (9 tests)
- `departments.e2e-spec.ts` - Department CRUD (9 tests)

**Total: 56 tests covering all API endpoints**

### Test Helpers

The test suite includes reusable helpers in `apps/api/test/helpers/`:

- `test-app.ts` - Creates and configures NestJS test application
- `auth-helper.ts` - Authentication utilities for protected routes
- `setup-test-db.ts` - Database cleanup and reset functions
- `test/fixtures/test-data.ts` - Centralized test data fixtures

### Test Patterns

Each test suite follows this pattern:

```typescript
describe('Controller E2E Tests', () => {
  let app: INestApplication;
  let authCookie: string;

  beforeAll(async () => {
    app = await createTestApp(); // Initialize NestJS app
    await app.init();
  });

  beforeEach(async () => {
    await cleanDatabase(); // Clean DB before each test
    const result = await createAuthenticatedUser(app); // Create admin user
    authCookie = result.cookie;
  });

  afterAll(async () => {
    await app.close(); // Cleanup
  });

  it('should test endpoint', () => {
    return request(app.getHttpServer())
      .get('/endpoint')
      .set('Cookie', authCookie) // Use authenticated cookie
      .expect(200);
  });
});
```

### Troubleshooting

**Database connection errors:**
- Ensure PostgreSQL is running: `pg_isready`
- Verify test database exists: `psql -l | grep vsgkugelberg_test`
- Check `.env.test` has correct credentials

**Test failures after schema changes:**
```bash
# Reset test database
cd apps/api
DATABASE_URL="postgresql://user:secret@localhost:5432/vsgkugelberg_test" pnpm prisma migrate reset --force
```

**Port already in use:**
- Tests run sequentially with `--runInBand` to avoid port conflicts
- If issues persist, check for orphaned processes: `lsof -i :3000`

