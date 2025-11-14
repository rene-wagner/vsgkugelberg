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

### Running Migrations

To apply database migrations:

```bash
pnpm prisma:migrate
```

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
