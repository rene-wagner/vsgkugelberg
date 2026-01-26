# VSG Kugelberg Monorepo - Agent Guide

This document provides LLMs and AI agents with a comprehensive overview of the VSG Kugelberg monorepo project structure, architecture, and key conventions.

## Project Overview

**VSG Kugelberg** is a modern web application for a German sports club (VSG Kugelberg e.V.). The project is structured as a **pnpm/Turborepo monorepo** containing a Vue 3 frontend, Express.js backend API, and migration tools.

**Author**: René Wagner  
**Package Manager**: pnpm@10.28.0  
**Build System**: Turborepo

## Monorepo Structure

```
vsgkugelberg/
├── apps/
│   ├── web/          # Vue 3 frontend application
│   └── api/          # Express.js backend API
├── tools/
│   └── migrate-mysql-to-postgres/  # Database migration utility
├── data/             # Data files
├── .github/          # GitHub workflows and CI/CD
├── .husky/           # Git hooks
├── docker-compose.yml
├── Makefile
├── turbo.json
└── pnpm-workspace.yaml
```

## Architecture Overview

### Frontend (apps/web)

**Technology Stack**:
- **Framework**: Vue 3 with Composition API
- **Build Tool**: Vite 6
- **Type Safety**: TypeScript 5.9
- **State Management**: Pinia 2
- **Routing**: Vue Router 4
- **Styling**: Tailwind CSS 4
- **Icons**: FontAwesome
- **Testing**: Vitest
- **Linting**: oxlint (Oxc-based linter)
- **Formatting**: oxfmt (Oxc-based formatter)

**Module Structure**:
The frontend follows a modular architecture with three main modules:

1. **default** (`apps/web/src/modules/default/`): Public-facing pages
   - Homepage, about, departments, contact, events, blog posts
   - Components, views, stores, types, and routes

2. **admin** (`apps/web/src/modules/admin/`): Admin dashboard
   - Content management (posts, media, categories)
   - Department management (trainers, locations, training sessions)
   - Event management, user management
   - Components, views, stores, types, and routes

3. **auth** (`apps/web/src/modules/auth/`): Authentication
   - Login, password reset
   - Auth store with JWT-based authentication
   - Protected route guards

**Shared Resources** (`apps/web/src/shared/`):
- `components/`: Reusable UI components
- `composables/`: Vue composables (e.g., useApi, usePagination)
- `layouts/`: Layout components (DefaultLayout, AdminLayout)
- `types/`: Shared TypeScript types
- `utils/`: Utility functions

**Key Features**:
- Markdown editor (EasyMDE) for content creation
- Calendar view (v-calendar) for events
- Charts (Chart.js) for statistics
- Drag-and-drop (vue-draggable-plus) for ordering
- Image galleries and media management

### Backend (apps/api)

**Technology Stack**:
- **Runtime**: Node.js
- **Framework**: Express.js 5
- **Type Safety**: TypeScript 5.9
- **Database**: PostgreSQL (via Prisma)
- **ORM**: Prisma 7 with PostgreSQL adapter
- **Authentication**: Passport.js (local strategy) + JWT
- **Caching**: Redis (ioredis)
- **Email**: Nodemailer (MailHog for development)
- **File Upload**: Multer with Sharp for image processing
- **Validation**: express-validator
- **Testing**: Vitest with Supertest
- **Linting**: oxlint
- **Formatting**: oxfmt

**Architecture Pattern**: Layered Architecture

```
src/
├── app.ts              # Express app setup
├── index.ts            # Server entry point
├── config/             # Configuration (CORS, upload, database)
├── routes/             # API endpoint definitions
├── middleware/         # Request processing (auth, validation, errors)
├── services/           # Business logic layer
├── validators/         # Input validation schemas
├── strategies/         # Passport authentication strategies
├── lib/                # Library code and utilities
├── types/              # TypeScript type definitions
└── errors/             # Custom error classes
```

**API Routes** (`apps/api/src/routes/`):
- `auth.routes.ts`: Authentication (login, logout, password reset)
- `posts.routes.ts`: Blog post CRUD
- `categories.routes.ts`: Category management
- `departments.routes.ts`: Sports department management
- `department-stats.routes.ts`: Department statistics
- `department-training.routes.ts`: Training groups and sessions
- `department-locations.routes.ts`: Training locations
- `department-trainers.routes.ts`: Trainer management
- `events.routes.ts`: Event calendar
- `media.routes.ts`: Media file management
- `media-folders.routes.ts`: Media folder organization
- `contact-persons.routes.ts`: Contact person management
- `contact.routes.ts`: Contact form submission
- `users.routes.ts`: User management
- `settings.routes.ts`: Club settings
- `history.routes.ts`: Club history entries
- `health.routes.ts`: Health check endpoint
- `me.routes.ts`: Current user info

**Services** (`apps/api/src/services/`):
Each service contains business logic for its domain:
- `auth.service.ts`: Authentication logic
- `posts.service.ts`: Post management
- `categories.service.ts`: Category tree operations
- `departments.service.ts`: Department operations
- `events.service.ts`: Event with recurrence (rrule)
- `media.service.ts`: File upload and image processing
- `email.service.ts`: Email sending
- `password-reset.service.ts`: Password reset tokens
- `slugify.service.ts`: URL slug generation
- And more...

### Database Schema (apps/api/prisma/schema.prisma)

**Database**: PostgreSQL  
**Schema Location**: `apps/api/prisma/schema.prisma` (379 lines)  
**Migrations**: `apps/api/prisma/migrations/`  
**Generated Client**: `apps/api/generated/prisma/`

**Key Models**:

1. **Users & Authentication**:
   - `User`: Username, email, password (bcrypt hashed)
   - `PasswordResetToken`: Token-based password reset

2. **Content Management**:
   - `Post`: Blog posts with slug, content (Markdown), thumbnails, categories
   - `Category`: Hierarchical categories (self-referencing)
   - `Media`: Uploaded files with metadata
   - `MediaFolder`: Folder organization for media

3. **Sports Departments**:
   - `Department`: Sports departments (e.g., football, gymnastics)
   - `DepartmentStat`: Key statistics per department
   - `DepartmentTrainingGroup`: Training groups with age ranges
   - `DepartmentTrainingSession`: Training schedule (day, time, location)
   - `DepartmentLocation`: Training venues with amenities
   - `DepartmentTrainer`: Trainers with roles and licenses

4. **Events & Calendar**:
   - `Event`: Events with recurrence rules (rrule), categories

5. **Club Information**:
   - `ClubSettings`: Global club settings (singleton with id=1)
   - `ContactPerson`: Key contact persons
   - `ClubHistory`: Historical milestones
   - `ClubHistoryImage`: Images for history entries

**Relationships**:
- Many-to-many: Post ↔ Category
- One-to-many: User → Post, Department → (Stats, Locations, Trainers, TrainingGroups)
- Hierarchical: Category tree structure
- Foreign keys with cascade deletes for data integrity

## Development Workflow

### Setup Commands

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm --filter api prisma:generate

# Run database migrations
pnpm --filter api prisma:migrate
```

### Development Commands

```bash
# Start all apps in development mode
pnpm dev

# Start specific app
pnpm --filter web dev
pnpm --filter api dev

# Type checking
pnpm type-check

# Linting
pnpm lint          # Check
pnpm lint:fix      # Fix

# Formatting
pnpm format        # Check
pnpm format:fix    # Fix

# Testing
pnpm test
pnpm test:ci
pnpm test:coverage
```

### Build Commands

```bash
# Build all apps
pnpm build

# Build specific app
pnpm --filter web build
pnpm --filter api build
```

### Database Commands

```bash
# Prisma commands (run in api workspace)
pnpm --filter api prisma:generate      # Generate client
pnpm --filter api prisma:migrate       # Run migrations
pnpm --filter api prisma:deploy        # Deploy migrations (production)
pnpm --filter api prisma:studio        # Open Prisma Studio
```

### Maintenance Commands (Makefile)

```bash
# Clean build artifacts and node_modules
make clean

# Reset migrations (dangerous!)
make clean-migrations
```

## Docker Services

**Docker Compose Services** (`docker-compose.yml`):

- **postgres**: PostgreSQL 18 (port 5432)
- **redis**: Redis 7 (port 6379)
- **mysql**: MySQL 9.5 (port 3306) - for migration purposes
- **mailhog**: MailHog (SMTP: 1025, UI: 8025) - email testing

## Environment Configuration

### Root `.env.example`

```
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
POSTGRES_PORT=

MYSQL_ROOT_PASSWORD=
MYSQL_DATABASE=
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_PORT=

REDIS_PORT=6379
```

### API `.env` (apps/api/.env.example)

Includes additional variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret
- `REDIS_URL`: Redis connection string
- `EMAIL_*`: Email configuration
- Upload and CORS settings

### Web `.env` (apps/web/.env.example)

```
VITE_API_BASE_URL=  # API base URL (e.g., http://localhost:3000/api)
```

## Code Style & Conventions

### TypeScript

- **Strict mode enabled** in all projects
- Use explicit types for function parameters and returns
- Prefer interfaces over types for object shapes
- Use type guards for runtime type checking

### Vue 3

- **Composition API** with `<script setup>` syntax
- **Single File Components** (SFC) with TypeScript
- Props: Use `defineProps<T>()` with TypeScript
- Emits: Use `defineEmits<T>()` with TypeScript
- Composables: Prefix with `use` (e.g., `useApi`, `useAuthStore`)

### Express.js

- **Async/await** for asynchronous operations
- **Middleware chain**: validation → authentication → authorization → handler
- **Error handling**: Use custom error classes, centralized error handler
- **Service layer**: Business logic in services, routes only for routing

### Naming Conventions

- **Files**: kebab-case (e.g., `auth.service.ts`, `media-folders.routes.ts`)
- **Components**: PascalCase (e.g., `MediaGallery.vue`)
- **Functions/Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase

### Code Quality Tools

- **Linting**: oxlint (Oxc-based, replaces ESLint)
- **Formatting**: oxfmt (Oxc-based, replaces Prettier)
- Configuration files: `.oxlintrc.json`, `.oxfmtrc.json`

## Testing

### Frontend (apps/web)

- **Framework**: Vitest
- **Location**: Inline tests or `__tests__/` directories
- **Coverage**: Vitest coverage with v8

### Backend (apps/api)

- **Framework**: Vitest
- **HTTP Testing**: Supertest
- **Test Environment**: Separate test database (`.env.test`)
- **Coverage**: Vitest coverage with v8
- **Location**: `tests/` directory

**Running API Tests**:
```bash
# Uses .env.test for test database
pnpm --filter api test
pnpm --filter api test:ci
pnpm --filter api test:coverage
```

## Key Architectural Patterns

### Frontend Patterns

1. **Module-based Organization**: Each feature is a module with its own routes, stores, components, and views
2. **Composition API**: Reusable logic in composables
3. **Pinia Stores**: Centralized state management
4. **Route Guards**: Authentication and permission checks in router
5. **API Layer**: Centralized API calls via `useApi` composable

### Backend Patterns

1. **Layered Architecture**: Routes → Middleware → Services → Database
2. **Service Layer**: Business logic isolated from HTTP concerns
3. **Validation Layer**: Input validation with express-validator
4. **Authentication**: JWT-based auth with Passport.js local strategy
5. **Error Handling**: Custom error classes with centralized handler
6. **Rate Limiting**: Redis-backed rate limiting
7. **File Upload**: Multer + Sharp for image processing

## Authentication Flow

1. **Login**: POST `/api/auth/login` with username/password
   - Returns JWT in HTTP-only cookie + user data
2. **Auth Check**: GET `/api/auth/check`
   - Validates JWT from cookie
3. **Logout**: POST `/api/auth/logout`
   - Clears JWT cookie
4. **Password Reset**: 
   - Request: POST `/api/auth/forgot-password` (sends email)
   - Verify: POST `/api/auth/verify-reset-token`
   - Reset: POST `/api/auth/reset-password`

**Frontend**: Auth state stored in Pinia (`useAuthStore`), persisted across refreshes

## Media Management

- **Upload Endpoint**: POST `/api/media/upload`
- **Storage**: Local filesystem (`apps/api/uploads/`)
- **Processing**: Sharp for image optimization (JPEG, WebP, PNG)
- **Organization**: Media folders for categorization
- **Serving**: Static file serving via Express

## Notable Features

1. **Markdown Content**: Blog posts and content use Markdown (EasyMDE editor)
2. **Event Recurrence**: Events support recurring schedules via rrule library
3. **Category Hierarchy**: Nested categories with parent-child relationships
4. **Image Processing**: Automatic thumbnail generation and format conversion
5. **Slug Generation**: Automatic URL-friendly slugs for posts and categories
6. **Drag-and-Drop Ordering**: Visual sorting for training groups, locations, etc.
7. **Contact Form**: Public contact form with email notifications

## Migration Tool (tools/migrate-mysql-to-postgres)

A utility for migrating data from MySQL to PostgreSQL. Used during the database migration phase.

**Purpose**: Historical data import from old MySQL database to new PostgreSQL schema

## Git Workflow

- **Hooks**: Husky for pre-commit and pre-push hooks
- **Conventional Commits**: Recommended (not enforced)
- **Recent Changes**: Check `git log` for recent activity

## Common Tasks for LLMs

### Adding a New API Endpoint

1. Create route in `apps/api/src/routes/[feature].routes.ts`
2. Add validation in `apps/api/src/validators/[feature].validator.ts`
3. Implement business logic in `apps/api/src/services/[feature].service.ts`
4. Register route in `apps/api/src/routes/index.ts`
5. Add TypeScript types in `apps/api/src/types/[feature].types.ts`

### Adding a New Frontend Page

1. Create view in `apps/web/src/modules/[module]/views/[Page].vue`
2. Add route in `apps/web/src/modules/[module]/router/routes.ts`
3. Create components in `apps/web/src/modules/[module]/components/`
4. Add types in `apps/web/src/modules/[module]/types/`
5. Create store if needed in `apps/web/src/modules/[module]/stores/`

### Modifying Database Schema

1. Edit `apps/api/prisma/schema.prisma`
2. Run `pnpm --filter api prisma:generate`
3. Create migration: `pnpm --filter api prisma:migrate`
4. Update TypeScript types if needed
5. Update services and routes to use new schema

## Important Notes for LLMs

1. **Monorepo Context**: Always specify workspace when running commands (e.g., `pnpm --filter api <command>`)
2. **TypeScript**: All code is TypeScript. Do not suggest JavaScript.
3. **Code Style**: Use oxlint and oxfmt, not ESLint/Prettier
4. **Testing**: Tests use Vitest, not Jest
5. **Database**: Always use Prisma Client, not raw SQL
6. **Authentication**: JWT in HTTP-only cookies, not localStorage
7. **File Paths**: Use absolute paths with `@` alias in Vue (e.g., `@/components/Button.vue`)
8. **Environment Variables**: Respect `.env.example` structure
9. **Turbo Cache**: Turbo caches build outputs; use `--force` to bypass
10. **Prisma Client**: Regenerate after schema changes

## Project Maturity

This is an **active, mature project** with:
- Established architecture and patterns
- Comprehensive feature set
- Production-ready code quality
- Ongoing development and maintenance

When making changes, prefer **consistency with existing patterns** over introducing new approaches.

## Resources

- **Turborepo**: https://turbo.build/repo/docs
- **Prisma**: https://www.prisma.io/docs
- **Vue 3**: https://vuejs.org/guide
- **Pinia**: https://pinia.vuejs.org
- **Express**: https://expressjs.com
- **Vitest**: https://vitest.dev
- **Oxc**: https://oxc-project.github.io (oxlint, oxfmt)

---

**Last Updated**: 2026-01-26  
**Maintainer**: René Wagner
