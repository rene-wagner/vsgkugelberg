# Implementation Tasks

This document outlines the implementation tasks for adding Prisma ORM to the API application. Tasks should be completed in order as some have dependencies on previous steps.

## Phase 1: Dependencies and Setup

- [x] Install Prisma dependencies
  - Add `@prisma/client` to production dependencies
  - Add `prisma` to dev dependencies
  - Add `nestjs-prisma` to production dependencies
  - Add `bcrypt` to production dependencies
  - Add `@types/bcrypt` to dev dependencies
  - Run `pnpm install` to install all dependencies

- [x] Initialize Prisma in API application
  - Run `npx prisma init` in `apps/api` directory
  - Verify `prisma/schema.prisma` file is created
  - Verify `.env` file is created with `DATABASE_URL` placeholder

- [x] Configure environment variables
  - Create `.env.example` with `DATABASE_URL=postgresql://user:password@localhost:5432/vsgkugelberg`
  - Add `.env` to `.gitignore` if not already present
  - Document database setup requirements in API README or main README

## Phase 2: Schema Definition

- [x] Define User model in Prisma schema
  - Add `User` model with id (Int, autoincrement, @id)
  - Add username field (String, @unique)
  - Add email field (String, @unique)
  - Add password field (String)
  - Add createdAt field (DateTime, @default(now()))
  - Add updatedAt field (DateTime, @updatedAt)
  - Add posts relation field (Post[])

- [x] Define Post model in Prisma schema
  - Add `Post` model with id (Int, autoincrement, @id)
  - Add title field (String)
  - Add slug field (String, @unique)
  - Add content field (String, nullable for drafts)
  - Add published field (Boolean, @default(false))
  - Add createdAt field (DateTime, @default(now()))
  - Add updatedAt field (DateTime, @updatedAt)
  - Add authorId field (Int)
  - Add author relation field (User, @relation with fields and references)
  - Add @@index([slug]) for slug lookups

- [x] Configure Prisma schema settings
  - Ensure datasource uses "postgresql" provider
  - Ensure DATABASE_URL environment variable is referenced
  - Ensure generator client is configured
  - Add onDelete: Cascade to author relation for cascading deletes

## Phase 3: Migrations

- [x] Create initial migration
  - Run `npx prisma migrate dev --name init` in `apps/api` directory
  - Review generated migration SQL in `prisma/migrations/`
  - Verify User table creation with constraints
  - Verify Post table creation with foreign key and indexes
  - Commit migration files to version control

- [x] Generate Prisma Client
  - Verify Prisma Client is generated in `node_modules/@prisma/client`
  - Check that TypeScript types are available for User and Post models
  - Verify IDE auto-completion works for Prisma Client methods

## Phase 4: NestJS Integration

- [x] Create PrismaModule configuration
  - Import `PrismaModule` from `nestjs-prisma` in `app.module.ts`
  - Configure with `PrismaModule.forRoot({ isGlobal: true })`
  - Verify module is imported into AppModule's imports array

- [x] Test PrismaService injection
  - Inject PrismaService in AppService or a test service
  - Verify PrismaService is injectable without errors
  - Test basic query (e.g., `prisma.user.findMany()`) to verify connection
  - Handle connection errors gracefully with try-catch

## Phase 5: Password Hashing Service

- [x] Create PasswordService utility
  - Create `src/common/services/password.service.ts` or similar structure
  - Add `@Injectable()` decorator for NestJS DI
  - Implement `hash(password: string): Promise<string>` method using bcrypt
  - Implement `compare(password: string, hash: string): Promise<boolean>` method using bcrypt
  - Set salt rounds to 10 (configurable via environment variable)

- [x] Add PasswordService to module
  - Export PasswordService from a shared/common module if created
  - Or add to providers in AppModule for now
  - Verify service is injectable in other services

- [x] Test password operations
  - Test hashing produces different hashes for same password (due to salt)
  - Test compare returns true for correct password
  - Test compare returns false for incorrect password
  - Test error handling for invalid inputs

## Phase 6: Slug Generation Utility

- [x] Create slugify utility function
  - Create `src/common/utils/slugify.util.ts` or similar
  - Implement `slugify(text: string): string` function
  - Convert text to lowercase
  - Replace spaces with hyphens
  - Remove special characters except hyphens
  - Trim leading/trailing hyphens
  - Handle Unicode characters appropriately

- [x] Test slugify function
  - Test "Hello World" → "hello-world"
  - Test "My First Post!" → "my-first-post"
  - Test with special characters
  - Test with Unicode characters
  - Test edge cases (empty string, only special chars)

- [x] Document slug usage
  - Add JSDoc comments to slugify function
  - Document usage in code comments or README
  - Note that slug uniqueness must be enforced at service layer

## Phase 7: Database Scripts and Documentation

- [x] Add database scripts to package.json
  - Add `"prisma:generate": "prisma generate"` script
  - Add `"prisma:migrate": "prisma migrate dev"` script
  - Add `"prisma:deploy": "prisma migrate deploy"` script
  - Add `"prisma:studio": "prisma studio"` script for GUI
  - Add `"prisma:seed": "ts-node prisma/seed.ts"` for future seeding

- [x] Update build and dev scripts
  - Ensure `prisma generate` runs after install (postinstall script)
  - Update build script to include Prisma Client generation
  - Document migration workflow in README

- [x] Create development setup documentation
  - Document PostgreSQL installation requirements
  - Document DATABASE_URL configuration
  - Document migration commands for team members
  - Add instructions for seeding data (future)
  - Document Prisma Studio usage for database inspection

## Phase 8: Validation and Testing

- [x] Validate schema in running application
  - Start PostgreSQL database locally or via Docker
  - Set DATABASE_URL in .env file
  - Run migrations with `pnpm prisma:migrate`
  - Start API dev server and verify no Prisma errors
  - Check logs for successful database connection

- [x] Test unique constraints
  - Attempt to create two users with same username (should fail)
  - Attempt to create two users with same email (should fail)
  - Attempt to create two posts with same slug (should fail)
  - Verify error messages are appropriate

- [x] Test relationships
  - Create a User via Prisma Studio or seed script
  - Create Posts related to that User
  - Query User with included posts
  - Verify cascade delete (delete User, check Posts are deleted)

- [x] Run OpenSpec validation
  - Run `openspec validate add-prisma-orm --strict`
  - Resolve any validation errors
  - Ensure all requirements have scenarios
  - Verify proposal structure is complete

## Dependencies Between Tasks

- Phase 2 depends on Phase 1 (need Prisma installed)
- Phase 3 depends on Phase 2 (need schema defined)
- Phase 4 depends on Phase 3 (need migrations run)
- Phase 5, 6, 7 can be done in parallel after Phase 4
- Phase 8 depends on all previous phases

## Notes

- PostgreSQL must be running locally or accessible remotely before running migrations
- Consider using Docker Compose for local PostgreSQL during development
- All migration files must be committed to version control
- Never edit a migration that has been applied to production
- Use `prisma migrate dev` for development, `prisma migrate deploy` for production
