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
