# Data Model

## Overview

Defines the database schema and models using Prisma ORM for the API application. This specification covers the User and Post models, their relationships, constraints, and indexing strategy.

## ADDED Requirements

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

The system SHALL define a Post model for storing blog posts and content.

#### Scenario: Post model fields

**Given** the Post model definition  
**When** the schema is defined  
**Then** the Post model must have an auto-incrementing `id` field as primary key  
**And** must have a `title` field of type String  
**And** must have a `slug` field of type String  
**And** must have a `content` field of type String (for markdown)  
**And** must have a `published` field of type Boolean with default value `false`  
**And** must have a `createdAt` field of type DateTime with default value `now()`  
**And** must have a `updatedAt` field of type DateTime with `@updatedAt` directive  
**And** must have an `authorId` field of type Int

#### Scenario: Post slug indexing

**Given** the Post model  
**When** indexing strategy is defined  
**Then** the `slug` field must have an index using `@@index([slug])`  
**And** slug queries must use the index for fast lookups  
**And** the slug field must be unique using `@unique` constraint

#### Scenario: Post-User relationship

**Given** the Post and User models  
**When** relationships are defined  
**Then** Post must have an `author` field as many-to-one relation to User  
**And** the relation must use `authorId` as the foreign key field  
**And** the relation must reference `id` field on User  
**And** one Post must have exactly one User as author  
**And** the `authorId` field must be required (not nullable)

---

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
