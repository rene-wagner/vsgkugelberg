# App: API Service

This directory contains the backend API service for the VSG Kugelberg application.

## Overview

The API is built as a RESTful service using **Node.js**, **Express**, and **TypeScript**. It handles authentication, data management, and business logic for the platform.

## Key Technologies

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Passport.js, JWT
- **Testing**: Vitest
- **Validation**: express-validator

## Architecture

The application follows a layered architecture:

1.  **Routes** (`src/routes`): Define API endpoints.
2.  **Middleware** (`src/middleware`): Handle request processing (auth, validation, error handling).
3.  **Services** (`src/services`): Contain business logic.
4.  **Data Access**: Handled via Prisma Client.

## Key Scripts

- `pnpm dev`: Start the development server.
- `pnpm test`: Run tests with Vitest.
- `pnpm prisma:migrate`: Run database migrations.
- `pnpm prisma:generate`: Generate Prisma Client.
- `pnpm prisma:seed`: Seed the database.

## Database

The project uses **PostgreSQL** with **Prisma**.

- Schema location: `prisma/schema.prisma`
- Migrations: `prisma/migrations/`
