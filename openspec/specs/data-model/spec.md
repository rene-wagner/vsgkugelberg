# data-model Specification

## Purpose
TBD - created by archiving change add-prisma-orm. Update Purpose after archive.
## Requirements
### Requirement: Prisma ORM Setup

The API application SHALL use Prisma ORM for database access and schema management.

#### Scenario: Install Prisma dependencies

**Given** the API application project structure  
**When** dependencies are installed  
**Then** `@prisma/client` must be present in production dependencies  
**And** `prisma` CLI must be present in dev dependencies  
**And** `nestjs-prisma` must be present for NestJS integration

#### Scenario: Initialize Prisma schema

**Given** the API application  
**When** Prisma is initialized  
**Then** a `prisma/schema.prisma` file must exist in the API app directory  
**And** the schema must specify `postgresql` as the database provider  
**And** the schema must reference `DATABASE_URL` environment variable  
**And** the schema must include a Prisma Client generator configuration

#### Scenario: Environment configuration

**Given** database connection requirements  
**When** setting up the application  
**Then** a `.env.example` file must exist with `DATABASE_URL` placeholder  
**And** the actual `.env` file must be gitignored  
**And** the `DATABASE_URL` format must be `postgresql://user:password@host:port/database`

---

### Requirement: User Model

The system SHALL define a User model for storing user account information.

#### Scenario: User model fields

**Given** the User model definition  
**When** the schema is defined  
**Then** the User model must have an auto-incrementing `id` field as primary key  
**And** must have a `username` field of type String  
**And** must have an `email` field of type String  
**And** must have a `password` field of type String  
**And** must have a `createdAt` field of type DateTime with default value `now()`  
**And** must have a `updatedAt` field of type DateTime with `@updatedAt` directive

#### Scenario: User uniqueness constraints

**Given** the User model  
**When** unique constraints are applied  
**Then** the `username` field must have a `@unique` constraint  
**And** the `email` field must have a `@unique` constraint  
**And** duplicate usernames must be rejected by the database  
**And** duplicate emails must be rejected by the database

#### Scenario: User-Post relationship

**Given** the User and Post models  
**When** relationships are defined  
**Then** User must have a `posts` field as one-to-many relation to Post  
**And** one User can have zero or many Posts  
**And** deleting a User should cascade delete their Posts

---

### Requirement: Post Model

The system SHALL extend the Post model to support taxonomic classification via categories and tags.

#### Scenario: Post taxonomy relations

**Given** the Post model with Category and Tag models  
**When** establishing relationships  
**Then** Post must have a `categories` field of type Category[] for many-to-many relation  
**And** Post must have a `tags` field of type Tag[] for many-to-many relation  
**And** both relations must be optional (posts can exist without categories/tags)

### Requirement: Prisma Migrations

The system SHALL use Prisma Migrate for database schema versioning.

#### Scenario: Create initial migration

**Given** the Prisma schema is defined  
**When** running migration command  
**Then** a migration must be created in `prisma/migrations/` directory  
**And** the migration must be named descriptively (e.g., "init" or "add_user_and_post")  
**And** the migration must include SQL statements for creating tables  
**And** the migration must include SQL for indexes and constraints

#### Scenario: Apply migrations

**Given** migration files exist  
**When** deploying the application  
**Then** migrations must be applied using `prisma migrate deploy`  
**And** the migration status must be tracked in `_prisma_migrations` table  
**And** failed migrations must prevent application startup

#### Scenario: Generate Prisma Client

**Given** the Prisma schema is updated  
**When** generating the client  
**Then** TypeScript types must be generated for all models  
**And** the generated client must be located in `node_modules/@prisma/client`  
**And** the client must provide type-safe query methods for User and Post  
**And** client generation must occur automatically after `prisma migrate dev`

---

### Requirement: NestJS Integration

The system SHALL integrate Prisma Client with NestJS dependency injection.

#### Scenario: PrismaService setup

**Given** the NestJS application  
**When** setting up Prisma integration  
**Then** `PrismaModule` from `nestjs-prisma` must be imported globally in AppModule  
**And** the module must be configured using `PrismaModule.forRoot({ isGlobal: true })`  
**And** PrismaService must be injectable in any NestJS service

#### Scenario: Inject PrismaService

**Given** a NestJS service or controller  
**When** needing database access  
**Then** PrismaService must be injected via constructor  
**And** the service must provide access to all Prisma Client methods  
**And** the service must handle database connection lifecycle automatically

#### Scenario: Database connection health

**Given** the application startup  
**When** connecting to the database  
**Then** PrismaService must connect to the database on application initialization  
**And** connection errors must be logged and prevent startup  
**And** the connection must be closed on application shutdown

### Requirement: Category Model

The system SHALL define a Category model for organizing posts into broad content classifications.

#### Scenario: Category model fields

**Given** the Category model definition  
**When** the schema is defined  
**Then** the Category model must have an auto-incrementing `id` field as primary key  
**And** must have a `name` field of type String with unique constraint  
**And** must have a `slug` field of type String with unique constraint  
**And** must have a `description` field of type String? (optional)  
**And** must have a `createdAt` field of type DateTime with default value `now()`  
**And** must have an `updatedAt` field of type DateTime with `@updatedAt` directive

#### Scenario: Category slug indexing

**Given** the Category model definition  
**When** querying categories by slug  
**Then** the `slug` field must have a database index for fast lookups  
**And** slug uniqueness must be enforced at database level

#### Scenario: Category to Post relation

**Given** the Category and Post models  
**When** establishing relationships  
**Then** Category must have a `posts` field of type Post[] for implicit many-to-many relation  
**And** Prisma must auto-generate a join table `_CategoryToPost`

---

### Requirement: Tag Model

The system SHALL define a Tag model for flexible cross-cutting labeling of posts.

#### Scenario: Tag model fields

**Given** the Tag model definition  
**When** the schema is defined  
**Then** the Tag model must have an auto-incrementing `id` field as primary key  
**And** must have a `name` field of type String with unique constraint  
**And** must have a `slug` field of type String with unique constraint  
**And** must have a `createdAt` field of type DateTime with default value `now()`  
**And** must have an `updatedAt` field of type DateTime with `@updatedAt` directive

#### Scenario: Tag slug indexing

**Given** the Tag model definition  
**When** querying tags by slug  
**Then** the `slug` field must have a database index for fast lookups  
**And** slug uniqueness must be enforced at database level

#### Scenario: Tag to Post relation

**Given** the Tag and Post models  
**When** establishing relationships  
**Then** Tag must have a `posts` field of type Post[] for implicit many-to-many relation  
**And** Prisma must auto-generate a join table `_PostToTag`

---

### Requirement: Department Model

The system SHALL define a Department model for representing the sport departments of VSG Kugelberg e.V.

#### Scenario: Department model fields

**Given** the Department model definition  
**When** the schema is defined  
**Then** the Department model must have an auto-incrementing `id` field as primary key  
**And** must have a `name` field of type String with unique constraint  
**And** must have a `slug` field of type String with unique constraint  
**And** must have a `shortDescription` field of type String  
**And** must have a `longDescription` field of type String  
**And** must have a `createdAt` field of type DateTime with default value `now()`  
**And** must have an `updatedAt` field of type DateTime with `@updatedAt` directive

#### Scenario: Department uniqueness constraints

**Given** the Department model  
**When** unique constraints are applied  
**Then** the `name` field must have a `@unique` constraint  
**And** the `slug` field must have a `@unique` constraint  
**And** duplicate department names must be rejected by the database  
**And** duplicate slugs must be rejected by the database

#### Scenario: Department slug indexing

**Given** the Department model definition  
**When** querying departments by slug  
**Then** the `slug` field must have a database index for fast lookups  
**And** slug uniqueness must be enforced at database level

#### Scenario: Department descriptions

**Given** a Department record  
**When** storing department information  
**Then** `shortDescription` must not be null (required field)  
**And** `longDescription` must not be null (required field)  
**And** both description fields must accept text strings for content

---

### Requirement: Prisma Database Seeding

The system SHALL provide a database seeding mechanism for creating test users with hashed passwords.

#### Scenario: Seed script setup

**Given** the Prisma configuration  
**When** setting up seeding  
**Then** a `prisma/seed.ts` file must exist in the API app directory  
**And** the seed script must use TypeScript with ts-node  
**And** `package.json` must include a `prisma.seed` configuration  
**And** the seed command must be `ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts`

#### Scenario: Seed test users

**Given** the seed script  
**When** the seed script is executed  
**Then** at least 3 test users must be created:
- Admin user with username `admin`, email `admin@vsgkugelberg.local`
- Regular user with username `john.doe`, email `john.doe@example.com`
- Test user with username `test.user`, email `test@example.com`

**And** all passwords must be hashed using `PasswordService.hash()`  
**And** seed data must be idempotent (using `upsert` to avoid duplicates)  
**And** seed script must log the usernames of created users  
**And** seed script must handle errors gracefully  
**And** seed script must disconnect from Prisma after completion

#### Scenario: Run seeding

**Given** the seed script is configured  
**When** running `prisma db seed`  
**Then** test users must be created in the database  
**And** seeding can be run multiple times without errors  
**And** existing users with same email are not duplicated (upsert behavior)

#### Scenario: Seed user credentials

**Given** seeded test users  
**When** users attempt to log in  
**Then** the following credentials must work:
- Username: `admin`, Password: `Admin123!`
- Username: `john.doe`, Password: `password123`
- Username: `test.user`, Password: `testpass`

**And** passwords must be stored as bcrypt hashes with salt rounds = 10  
**And** plaintext passwords must never be stored in the database

#### Scenario: Seed script dependencies

**Given** the seed script implementation  
**When** the script imports dependencies  
**Then** it must import `PrismaClient` from `@prisma/client`  
**And** it must import `PasswordService` from the common services  
**And** it must instantiate both services correctly  
**And** it must handle async password hashing

---

