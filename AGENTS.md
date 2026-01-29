# AGENTS.md

AI Agent Guide for VSG Kugelberg e.V. Project

## Project Overview

This is a monorepo for the sports club VSG Kugelberg e.V. website, consisting of a Vue 3 frontend, Express.js backend API with PostgreSQL database, and migration tools. The project enables club management with features for posts, departments, training schedules, events, contact management, and club history.

**Author:** René Wagner  
**Package Manager:** pnpm@10.28.0  
**Build System:** Turborepo  
**License:** ISC

## Tech Stack

### Backend (`apps/api`)

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js 5.1.0
- **Database:** PostgreSQL via Prisma ORM 7.1.0
- **Authentication:** Passport.js with JWT and bcrypt
- **Session Store:** Redis (via ioredis)
- **Rate Limiting:** express-rate-limit with Redis
- **Validation:** express-validator
- **Image Processing:** sharp
- **Email:** nodemailer
- **File Uploads:** multer
- **Testing:** Vitest with supertest
- **Linting:** oxlint
- **Formatting:** oxfmt

### Frontend (`apps/web`)

- **Framework:** Vue 3.5.13 with TypeScript
- **Router:** Vue Router 4.5.0
- **State Management:** Pinia 2.3.1
- **Build Tool:** Vite 6.3.5
- **Styling:** TailwindCSS 4.1.18
- **Icons:** FontAwesome 7.1.0
- **Charts:** Chart.js 4.5.1
- **Calendar:** v-calendar 3.1.2
- **Markdown:** marked 17.0.1, easymde 2.20.0
- **Drag & Drop:** vue-draggable-plus
- **Testing:** Vitest
- **Type Checking:** vue-tsc
- **Linting:** oxlint
- **Formatting:** oxfmt

### Tools

- **Migration Tool:** TypeScript utility for migrating from Joomla/MySQL to PostgreSQL
- **Version Control:** Git with Husky pre-commit hooks
- **Containerization:** Docker with docker-compose

## Architecture

### Monorepo Structure

```
vsgkugelberg/
├── apps/
│   ├── api/          # Express.js backend
│   └── web/          # Vue 3 frontend
├── tools/
│   └── migrate/      # Database migration utilities
├── docs/
│   └── plans/        # Technical design documents
└── [config files]
```

### Backend Architecture

- **Service Layer Pattern:** Business logic in `services/`, routes in `routes/`, validators in `validators/`
- **Middleware Chain:** CORS → JSON parsing → Cookie parser → Passport → Rate limiting → Route handling → Error handling
- **Database:** Prisma Client with PostgreSQL adapter, connection pooling via pg
- **Authentication Flow:** Local strategy + JWT tokens stored in HTTP-only cookies
- **Error Handling:** Centralized error handler middleware with custom HTTP error classes

### Frontend Architecture

- **Module-Based Structure:** Organized by feature modules (`admin`, `auth`, `default`)
- **Each Module Contains:**
  - `components/` - Vue components
  - `views/` - Page-level components
  - `stores/` - Pinia state management
  - `router/` - Route definitions
  - `types/` - TypeScript interfaces
- **Shared Resources:** Common components, utilities, and types in `src/shared/`

## Project Structure

### Backend Structure (`apps/api/src/`)

```
src/
├── app.ts                    # Express app setup
├── index.ts                  # Server entry point
├── config/                   # Configuration files
│   ├── cors.config.ts
│   ├── jwt.config.ts
│   ├── redis.config.ts
│   └── upload.config.ts
├── errors/                   # Custom error classes
│   └── http-errors.ts
├── lib/                      # Third-party library wrappers
│   └── prisma.lib.ts
├── middleware/               # Express middleware
│   ├── async-handler.middleware.ts
│   ├── auth-guard.middleware.ts
│   ├── error-handler.middleware.ts
│   ├── honeypot.middleware.ts
│   ├── jwt.middleware.ts
│   ├── rate-limit.middleware.ts
│   └── validation.middleware.ts
├── routes/                   # API route definitions
│   ├── index.ts              # Main router
│   ├── auth.routes.ts
│   ├── categories.routes.ts
│   ├── contact.routes.ts
│   ├── departments.routes.ts
│   ├── events.routes.ts
│   ├── health.routes.ts
│   ├── history.routes.ts
│   ├── homepage-content.routes.ts
│   ├── media.routes.ts
│   ├── posts.routes.ts
│   ├── settings.routes.ts
│   └── users.routes.ts
├── services/                 # Business logic layer
│   ├── auth.service.ts
│   ├── categories.service.ts
│   ├── contact-form.service.ts
│   ├── departments.service.ts
│   ├── email.service.ts
│   ├── events.service.ts
│   ├── history.service.ts
│   ├── homepage-content.service.ts
│   ├── media.service.ts
│   ├── password.service.ts
│   ├── posts.service.ts
│   ├── settings.service.ts
│   ├── slugify.service.ts
│   └── users.service.ts
├── strategies/               # Passport authentication strategies
│   └── local.strategy.ts
├── types/                    # TypeScript type definitions
│   ├── express.d.ts          # Express augmentations
│   └── [feature].types.ts
└── validators/               # express-validator schemas
    └── [feature].validators.ts
```

### Frontend Structure (`apps/web/src/`)

```
src/
├── main.ts                   # App entry point
├── App.vue                   # Root component
├── style.css                 # Global styles
├── assets/                   # Static assets
├── router/                   # Global router config
│   ├── index.ts
│   └── types.ts
├── modules/                  # Feature modules
│   ├── admin/                # Admin dashboard
│   │   ├── components/
│   │   ├── views/
│   │   ├── stores/
│   │   ├── router/
│   │   └── types/
│   ├── auth/                 # Authentication
│   │   ├── components/
│   │   ├── views/
│   │   ├── stores/
│   │   └── router/
│   └── default/              # Public-facing site
│       ├── components/
│       ├── views/
│       ├── stores/
│       ├── router/
│       └── types/
└── shared/                   # Shared resources
    ├── components/           # Reusable UI components
    ├── composables/          # Vue composables
    ├── constants/            # App-wide constants
    ├── layouts/              # Layout components
    ├── services/             # API service layer
    ├── types/                # Shared TypeScript types
    └── utils/                # Utility functions
```

### Database Models (Prisma Schema)

**Core Content:**
- `Post` - Blog posts with categories, thumbnails, and hit tracking
- `Category` - Hierarchical category system
- `Media` - File management with folders and thumbnails
- `MediaFolder` - Folder hierarchy for organizing media

**Department Management:**
- `Department` - Sports departments with icons and slugs
- `DepartmentStat` - Department statistics (ordered)
- `DepartmentTrainingGroup` - Training groups with age ranges
- `DepartmentTrainingSession` - Training schedule
- `DepartmentLocation` - Venue information with amenities
- `DepartmentTrainer` - Trainer associations with roles

**Club Information:**
- `ClubSettings` - Singleton club-wide settings
- `Event` - Calendar events with recurrence support
- `ContactPerson` - Contact information with profile images
- `HistoryContent` - Singleton club history with nested data
- `HomepageContent` - Singleton homepage configuration

**Authentication:**
- `User` - Admin users with authentication
- `PasswordResetToken` - Password reset functionality

**Key Patterns:**
- **Singleton Models:** Use `@id @default(1)` for single-record tables (`ClubSettings`, `HistoryContent`, `HomepageContent`)
- **Ordered Relations:** Many models use `sort` field for ordering (`DepartmentStat`, `HomepageStat`, etc.)
- **Soft Relations:** Optional foreign keys with `onDelete: SetNull` for media
- **Cascade Deletes:** Child records cascade on parent deletion

## Development Workflow

### Getting Started

```bash
# Install dependencies
pnpm install

# Start development servers (all apps)
pnpm dev

# Start specific app
cd apps/api && pnpm dev
cd apps/web && pnpm dev

# Run tests
pnpm test

# Run linter
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format:fix

# Build for production
pnpm build
```

### Database Management

```bash
cd apps/api

# Generate Prisma Client
pnpm prisma:generate

# Create migration
pnpm prisma:migrate

# Deploy migrations
pnpm prisma:deploy

# Open Prisma Studio
pnpm prisma:studio
```

### Docker

```bash
# Start services (PostgreSQL, Redis, MailHog)
docker-compose up -d

# Stop services
docker-compose down
```

### Git Workflow

- **Pre-commit hooks:** Husky runs linting/formatting before commits
- **Branch strategy:** Feature branches with descriptive names
- **Commit messages:** Clear, concise descriptions of changes

## Key Patterns and Conventions

### Backend Patterns

#### Service Layer Pattern

Services contain all business logic. Routes are thin and delegate to services.

```typescript
// ✅ GOOD - Logic in service
export const createPost = async (data: CreatePostDTO): Promise<Post> => {
  const slug = slugify(data.title);
  return await prisma.post.create({ data: { ...data, slug } });
};

// Route just calls service
router.post('/', asyncHandler(async (req, res) => {
  const post = await postService.createPost(req.body);
  res.status(201).json(post);
}));
```

#### Validation Pattern

Use express-validator for input validation. Validators are in separate files.

```typescript
// validators/post.validators.ts
export const createPostValidator = [
  body('title').trim().notEmpty().isLength({ max: 200 }),
  body('content').optional().isString(),
  validationMiddleware
];

// routes/posts.routes.ts
router.post('/', createPostValidator, asyncHandler(handler));
```

#### Error Handling

Use custom HTTP error classes and async handler middleware.

```typescript
// ✅ GOOD - Throw custom errors
import { NotFoundError, BadRequestError } from '@/errors/http-errors';

if (!user) throw new NotFoundError('User not found');
if (invalid) throw new BadRequestError('Invalid input');

// ✅ GOOD - Use asyncHandler to catch async errors
router.get('/:id', asyncHandler(async (req, res) => {
  const post = await postService.getPost(req.params.id);
  res.json(post);
}));
```

#### Authentication Pattern

Routes requiring authentication use `authGuard` middleware.

```typescript
import { authGuard } from '@/middleware/auth-guard.middleware';

// Public route
router.get('/', asyncHandler(handler));

// Protected route
router.post('/', authGuard, asyncHandler(handler));

// User available via req.user (added by Passport)
```

#### Singleton Content Pattern

For single-record tables, use upsert with `id: 1`.

```typescript
// ✅ GOOD - Upsert singleton
export const updateSettings = async (data: UpdateSettingsDTO) => {
  return await prisma.clubSettings.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data }
  });
};
```

#### Pagination Pattern

Consistent pagination for list endpoints.

```typescript
interface PaginationParams {
  page?: number;
  limit?: number;
}

export const getPosts = async ({ page = 1, limit = 10 }: PaginationParams) => {
  const skip = (page - 1) * limit;
  const [posts, total] = await Promise.all([
    prisma.post.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.post.count()
  ]);
  return { posts, total, page, limit };
};
```

### Frontend Patterns

#### Pinia Store Pattern

Stores follow a consistent structure with state, getters, and actions.

```typescript
// ✅ GOOD - Pinia store structure
export const usePostsStore = defineStore('posts', () => {
  // State
  const posts = ref<Post[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const publishedPosts = computed(() => posts.value.filter(p => p.published));

  // Actions
  const fetchPosts = async () => {
    loading.value = true;
    try {
      posts.value = await api.getPosts();
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  };

  return { posts, loading, error, publishedPosts, fetchPosts };
});
```

#### API Service Layer

API calls are centralized in service files, not in components.

```typescript
// ✅ GOOD - API in service
// services/posts.service.ts
export const getPosts = async (): Promise<Post[]> => {
  const response = await fetch(`${API_BASE}/posts`);
  if (!response.ok) throw new Error('Failed to fetch posts');
  return response.json();
};

// Component uses store, store uses service
const postsStore = usePostsStore();
await postsStore.fetchPosts(); // Calls service internally
```

#### Component Composition

Components are modular and focused. Use composables for reusable logic.

```typescript
// ✅ GOOD - Extract reusable logic to composables
// composables/useApi.ts
export const useApi = <T>(fetcher: () => Promise<T>) => {
  const data = ref<T | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const execute = async () => {
    loading.value = true;
    try {
      data.value = await fetcher();
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  };

  return { data, loading, error, execute };
};
```

#### Module Organization

Each feature module is self-contained with its own components, views, stores, routes, and types.

```
modules/admin/
├── components/          # Admin-specific components
├── views/              # Admin page views
├── stores/             # Admin state management
├── router/             # Admin routes
├── types/              # Admin TypeScript types
└── index.ts            # Module exports
```

### Code Style Conventions

#### TypeScript

- Use explicit types for function parameters and return values
- Prefer interfaces over type aliases for object shapes
- Use enums for fixed sets of values
- Avoid `any` - use `unknown` if type is truly unknown

#### Naming Conventions

- **Files:** kebab-case (`user.service.ts`, `post-card.component.vue`)
- **Variables/Functions:** camelCase (`getUserById`, `isLoading`)
- **Classes/Interfaces:** PascalCase (`UserService`, `PostDTO`)
- **Constants:** UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_FILE_SIZE`)
- **Components:** PascalCase (`PostCard.vue`, `HeroSection.vue`)

#### Vue Components

- Use Composition API with `<script setup>`
- Props with TypeScript interfaces
- Emit events with `defineEmits`
- Use `v-bind` shorthand (`:prop`) and `v-on` shorthand (`@event`)

```vue
<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  title: string;
  count?: number;
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
});

const emit = defineEmits<{
  update: [value: number];
}>();

const localCount = ref(props.count);
</script>

<template>
  <div>
    <h1>{{ title }}</h1>
    <button @click="emit('update', localCount++)">
      {{ localCount }}
    </button>
  </div>
</template>
```

#### Error Handling

- Always handle errors in async operations
- Show user-friendly error messages
- Log errors for debugging
- Use try-catch for expected errors, let unexpected errors bubble up

## Testing

### Backend Testing

- **Framework:** Vitest with supertest
- **Test Files:** `tests/integration/*.test.ts`
- **Pattern:** Integration tests for API endpoints
- **Setup:** `tests/setup.ts` configures test environment
- **Helpers:** Shared test utilities in `tests/helpers/`

```bash
# Run tests
cd apps/api && pnpm test

# Run tests in CI mode
pnpm test:ci

# Run with coverage
pnpm test:coverage

# Run with UI
pnpm test:ui
```

**Testing Pattern:**

```typescript
import request from 'supertest';
import { app } from '@/app';

describe('POST /api/posts', () => {
  it('creates a post', async () => {
    const response = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Post', content: 'Content' });
    
    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Test Post');
  });
});
```

### Frontend Testing

- **Framework:** Vitest
- **Pattern:** Unit tests for components and utilities

```bash
# Run tests
cd apps/web && pnpm test

# Run in CI mode
pnpm test:ci

# Run with coverage
pnpm test:coverage
```

## Common Tasks

### Adding a New API Endpoint

1. **Define types** in `src/types/[feature].types.ts`
2. **Create validators** in `src/validators/[feature].validators.ts`
3. **Implement service** in `src/services/[feature].service.ts`
4. **Create routes** in `src/routes/[feature].routes.ts`
5. **Register routes** in `src/routes/index.ts`
6. **Write tests** in `tests/integration/[feature].test.ts`

### Adding a New Frontend Feature

1. **Create types** in module's `types/` folder
2. **Create store** in module's `stores/` folder
3. **Create service** for API calls in `shared/services/`
4. **Create components** in module's `components/` folder
5. **Create views** in module's `views/` folder
6. **Add routes** in module's `router/` folder

### Adding a New Database Model

1. **Update schema** in `apps/api/prisma/schema.prisma`
2. **Create migration**: `cd apps/api && pnpm prisma:migrate`
3. **Generate client**: `pnpm prisma:generate`
4. **Create types** for the model
5. **Create service** for business logic
6. **Create validators** for input validation
7. **Create routes** for API endpoints

### Modifying Singleton Content

For singleton models like `HomepageContent`, `HistoryContent`, `ClubSettings`:

1. **Update schema** with new fields
2. **Create migration**
3. **Update seed data** if applicable
4. **Update service** to handle new fields
5. **Update validators** for new fields
6. **Update frontend types** and UI

## Important Files

### Configuration Files

- `.editorconfig` - Editor formatting rules (2 space indent, LF line endings)
- `pnpm-workspace.yaml` - Workspace package configuration
- `turbo.json` - Turborepo task configuration
- `docker-compose.yml` - Development services (PostgreSQL, Redis, MailHog)
- `.husky/pre-commit` - Git pre-commit hooks

### Environment Files

Backend `.env` variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `REDIS_HOST`, `REDIS_PORT` - Redis configuration
- `EMAIL_*` - Email service configuration
- `CORS_ORIGIN` - Allowed CORS origins

Frontend `.env` variables:
- `VITE_API_BASE_URL` - API endpoint URL

### Entry Points

- Backend: `apps/api/src/index.ts`
- Frontend: `apps/web/src/main.ts`
- Migration tool: `tools/migrate/src/index.ts`

## Migration Tool

Located in `tools/migrate/`, this utility migrates data from a legacy Joomla/MySQL database to the new PostgreSQL schema.

**Features:**
- Migrates posts and categories
- Seeds departments, contact persons, history, and media
- Handles data transformation and validation
- Supports dry-run mode

**Usage:**
```bash
cd tools/migrate
cp .env.example .env
# Configure source and target databases
pnpm install
pnpm start
```

## API Endpoints Overview

### Public Endpoints

- `GET /api/health` - Health check
- `GET /api/posts` - List posts
- `GET /api/posts/:slug` - Get post by slug
- `GET /api/departments` - List departments
- `GET /api/departments/:slug` - Get department details
- `GET /api/events` - List events
- `GET /api/history` - Get club history
- `GET /api/homepage-content` - Get homepage configuration
- `GET /api/settings` - Get club settings
- `POST /api/contact` - Submit contact form

### Protected Endpoints (Authentication Required)

**Authentication:**
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/password-reset/request` - Request password reset
- `POST /api/auth/password-reset/reset` - Reset password

**User Management:**
- `GET /api/me` - Get current user
- `PATCH /api/me` - Update current user
- `GET /api/users` - List users (admin)
- `POST /api/users` - Create user (admin)
- `PATCH /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)

**Content Management:**
- `POST /api/posts` - Create post
- `PATCH /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/categories` - Create category
- `PATCH /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

**Department Management:**
- Full CRUD for departments, stats, training groups, sessions, locations, trainers

**Media Management:**
- `POST /api/media` - Upload media
- `GET /api/media` - List media
- `DELETE /api/media/:id` - Delete media
- Full CRUD for media folders

**System Management:**
- `PATCH /api/settings` - Update club settings
- `PATCH /api/history` - Update history content
- `PATCH /api/homepage-content` - Update homepage content

## Best Practices

### Do's ✅

- **Use the service layer** - Keep routes thin, logic in services
- **Validate all inputs** - Use express-validator on backend, validate on frontend
- **Handle errors gracefully** - Use try-catch, provide user-friendly messages
- **Use TypeScript properly** - Explicit types, no `any`
- **Write tests** - Integration tests for API, unit tests for utilities
- **Follow conventions** - File naming, folder structure, code style
- **Use async/await** - Cleaner than promises or callbacks
- **Leverage Prisma** - Use relations, `include`, `select` for efficient queries
- **Keep components focused** - Single responsibility, extract reusable logic
- **Use composables** - Share logic between components
- **Optimize queries** - Use pagination, limit fields, add indexes
- **Secure endpoints** - Authentication, authorization, rate limiting
- **Document complex logic** - Comments for "why", not "what"

### Don'ts ❌

- **Don't put logic in routes** - Use services
- **Don't trust user input** - Always validate and sanitize
- **Don't use `any`** - Use proper types or `unknown`
- **Don't hardcode values** - Use constants or environment variables
- **Don't mix concerns** - Separate UI, logic, data access
- **Don't ignore errors** - Always handle or log them
- **Don't skip migrations** - Database changes must be migrated
- **Don't commit sensitive data** - Use `.env` files, never commit them
- **Don't fetch in loops** - Use batch operations or `include`
- **Don't expose internal errors** - Return user-friendly messages
- **Don't skip type checking** - Run `pnpm type-check` before committing

## Additional Resources

- **Prisma Docs:** https://www.prisma.io/docs
- **Vue 3 Docs:** https://vuejs.org/guide/introduction.html
- **Pinia Docs:** https://pinia.vuejs.org/
- **Express Docs:** https://expressjs.com/
- **Vitest Docs:** https://vitest.dev/

## Quick Reference Commands

```bash
# Development
pnpm dev                    # Start all apps
pnpm build                  # Build all apps
pnpm test                   # Run all tests
pnpm lint                   # Lint all apps
pnpm format:fix             # Format all code

# Database
cd apps/api
pnpm prisma:generate        # Generate Prisma Client
pnpm prisma:migrate         # Create migration
pnpm prisma:studio          # Open DB GUI

# Docker
docker-compose up -d        # Start services
docker-compose down         # Stop services
docker-compose logs -f      # View logs

# Git
git status                  # Check changes
git add .                   # Stage changes
git commit -m "message"     # Commit changes
git push                    # Push to remote
```

---

**Last Updated:** 2026-01-29
