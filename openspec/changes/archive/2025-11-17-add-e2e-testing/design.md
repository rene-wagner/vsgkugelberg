# Design: End-to-End Testing Infrastructure

## Overview

This design document outlines the architecture and technical decisions for implementing comprehensive E2E testing in the NestJS API using Jest, Supertest, and @nestjs/testing.

## Architecture

### Test Environment Isolation

```
Production Environment          Test Environment
┌──────────────────┐           ┌──────────────────┐
│  vsgkugelberg    │           │ vsgkugelberg_test│
│  (PostgreSQL DB) │           │  (PostgreSQL DB) │
└──────────────────┘           └──────────────────┘
         ↑                              ↑
         │                              │
┌──────────────────┐           ┌──────────────────┐
│  API Application │           │  Test Application│
│  (NestJS)        │           │  (NestJS Testing)│
└──────────────────┘           └──────────────────┘
```

**Key Principles:**
- Separate test database prevents data pollution
- Each test suite manages its own database state
- Tests can run independently and idempotently

### Test Structure

```
apps/api/
├── test/
│   ├── e2e/                    # E2E test suites
│   │   ├── auth.e2e-spec.ts
│   │   ├── users.e2e-spec.ts
│   │   └── ...
│   ├── fixtures/               # Test data
│   │   └── test-data.ts
│   ├── helpers/                # Test utilities
│   │   ├── setup-test-db.ts
│   │   ├── auth-helper.ts
│   │   ├── test-app.ts
│   │   └── cleanup.ts
│   └── setup.ts                # Global test setup
├── jest-e2e.config.js          # Jest E2E configuration
└── .env.test                   # Test environment variables
```

## Key Technical Decisions

### 1. Test Database Strategy

**Decision**: Use a dedicated `vsgkugelberg_test` PostgreSQL database with full cleanup between test suites.

**Alternatives Considered:**
- **Transaction Rollback**: Wrap each test in a transaction and rollback
  - ❌ Complex with Prisma
  - ❌ Doesn't test commit behavior
  - ❌ Issues with nested transactions
- **In-Memory Database**: Use SQLite in-memory
  - ❌ Different SQL dialect from production (PostgreSQL)
  - ❌ Missing PostgreSQL-specific features
  - ❌ Doesn't catch PostgreSQL-specific issues

**Rationale:**
- ✅ Matches production environment exactly
- ✅ Simple and predictable state management
- ✅ No hidden transaction side effects
- ✅ Works well with Prisma migrations
- ⚠️ Slower than transactions (acceptable trade-off)

**Implementation:**
```typescript
// Before each test suite
await prisma.$executeRawUnsafe('DROP SCHEMA public CASCADE');
await prisma.$executeRawUnsafe('CREATE SCHEMA public');
await prisma.$executeRawUnsafe('GRANT ALL ON SCHEMA public TO user');
await exec('npx prisma migrate deploy');
```

### 2. Jest Configuration

**Decision**: Use separate `jest-e2e.config.js` with specific E2E settings.

**Configuration Highlights:**
```javascript
{
  testRegex: '.e2e-spec.ts$',        // Only E2E test files
  testEnvironment: 'node',            // Node environment
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',      // TypeScript support
  },
  testTimeout: 30000,                 // 30s timeout
  maxWorkers: 1,                      // Sequential execution
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
}
```

**Rationale:**
- Separate config prevents conflicts with unit tests
- Sequential execution avoids database conflicts
- Longer timeout accommodates real database operations
- Setup file loads environment and initializes globals

### 3. Application Initialization

**Decision**: Create one test app instance per test suite, reusing it across tests within that suite.

**Pattern:**
```typescript
describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    // Create test module
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Apply same middleware as production
    app.use(cookieParser());
    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    // Clean database before each test
    await cleanDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  // Tests...
});
```

**Rationale:**
- ✅ Faster than creating app for each test
- ✅ Realistic - matches production app lifecycle
- ✅ Database cleanup between tests ensures isolation
- ✅ Easy to debug with consistent app state

### 4. Authentication Testing

**Decision**: Create helper functions to authenticate and extract JWT cookies.

**Pattern:**
```typescript
// test/helpers/auth-helper.ts
export async function createAuthenticatedUser(
  app: INestApplication,
  userData?: Partial<User>,
): Promise<{ user: User; cookie: string }> {
  const prisma = app.get(PrismaService);
  
  // Create user in database
  const user = await prisma.user.create({
    data: {
      username: userData?.username ?? 'testuser',
      email: userData?.email ?? 'test@example.com',
      password: await bcrypt.hash('password123', 10),
    },
  });

  // Login to get cookie
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ username: user.username, password: 'password123' })
    .expect(200);

  const cookie = response.headers['set-cookie'][0];
  
  return { user, cookie };
}
```

**Usage in tests:**
```typescript
it('should create a post when authenticated', async () => {
  const { cookie } = await createAuthenticatedUser(app);
  
  return request(app.getHttpServer())
    .post('/posts')
    .set('Cookie', cookie)
    .send(createPostDto)
    .expect(201);
});
```

**Rationale:**
- ✅ DRY - reusable across all protected endpoint tests
- ✅ Realistic - uses actual login flow
- ✅ Easy to test different user scenarios
- ✅ Type-safe with TypeScript

### 5. Test Data Management

**Decision**: Use typed fixtures with factory functions for generating test data.

**Pattern:**
```typescript
// test/fixtures/test-data.ts
export const testUsers = {
  john: {
    username: 'john.doe',
    email: 'john@example.com',
    password: 'password123',
  },
  jane: {
    username: 'jane.smith',
    email: 'jane@example.com',
    password: 'password123',
  },
};

export const testPosts = {
  published: {
    title: 'Published Post',
    slug: 'published-post',
    content: 'This is published',
    published: true,
  },
  draft: {
    title: 'Draft Post',
    slug: 'draft-post',
    content: 'This is a draft',
    published: false,
  },
};

export async function seedDatabase(prisma: PrismaService) {
  // Create users with hashed passwords
  const john = await prisma.user.create({
    data: {
      ...testUsers.john,
      password: await bcrypt.hash(testUsers.john.password, 10),
    },
  });

  // Create posts
  await prisma.post.createMany({
    data: [
      { ...testPosts.published, authorId: john.id },
      { ...testPosts.draft, authorId: john.id },
    ],
  });
}
```

**Rationale:**
- ✅ Centralized test data
- ✅ Type-safe references
- ✅ Easy to extend
- ✅ Realistic data for testing edge cases

### 6. Error Testing

**Decision**: Test both success and error scenarios for every endpoint.

**Pattern:**
```typescript
describe('POST /users', () => {
  it('should create user with valid data', async () => {
    const { cookie } = await createAuthenticatedUser(app);
    
    return request(app.getHttpServer())
      .post('/users')
      .set('Cookie', cookie)
      .send(validUserDto)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.username).toBe(validUserDto.username);
      });
  });

  it('should return 400 for invalid email', async () => {
    const { cookie } = await createAuthenticatedUser(app);
    
    return request(app.getHttpServer())
      .post('/users')
      .set('Cookie', cookie)
      .send({ ...validUserDto, email: 'invalid' })
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toContain('email');
      });
  });

  it('should return 401 when not authenticated', async () => {
    return request(app.getHttpServer())
      .post('/users')
      .send(validUserDto)
      .expect(401);
  });
});
```

**Rationale:**
- ✅ Validates error handling paths
- ✅ Ensures proper HTTP status codes
- ✅ Tests validation logic
- ✅ Verifies authentication guards

### 7. Assertion Strategy

**Decision**: Use Supertest's built-in assertions plus Jest matchers for complex validations.

**Patterns:**
```typescript
// Simple assertions
.expect(200)
.expect('Content-Type', /json/)

// Complex assertions
.expect((res) => {
  expect(res.body).toHaveProperty('id');
  expect(res.body.password).toBeUndefined();
  expect(res.body.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}/);
})

// Cookie assertions
.expect((res) => {
  const cookie = res.headers['set-cookie'][0];
  expect(cookie).toContain('access_token');
  expect(cookie).toContain('HttpOnly');
  expect(cookie).toContain('SameSite=Strict');
})
```

**Rationale:**
- ✅ Readable and expressive
- ✅ Combines Supertest and Jest strengths
- ✅ Easy to debug failures
- ✅ Type-safe with TypeScript

## Environment Configuration

### .env.test File
```bash
DATABASE_URL="postgresql://user:secret@localhost:5432/vsgkugelberg_test"
JWT_SECRET="test-secret-do-not-use-in-production"
NODE_ENV="test"
```

### Loading Strategy
```typescript
// test/setup.ts
import { config } from 'dotenv';
import { join } from 'path';

// Load test environment variables
config({ path: join(__dirname, '..', '.env.test') });
```

**Rationale:**
- ✅ Isolated from development/production config
- ✅ Explicit test configuration
- ✅ Easy to override in CI

## Performance Considerations

### Test Execution Time

**Target**: < 30 seconds for full E2E suite

**Optimizations:**
1. **App Reuse**: One app instance per test suite (not per test)
2. **Database Cleanup**: Fast SQL commands instead of ORM operations
3. **Sequential Execution**: Prevent database conflicts (acceptable trade-off)
4. **Minimal Seeding**: Only seed data needed for specific tests

### Debugging Strategy

```json
{
  "test:e2e:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand --config ./jest-e2e.config.js"
}
```

**Features:**
- Chrome DevTools debugging
- Breakpoint support
- Step-through test execution

## CI/CD Integration

### GitHub Actions Workflow
```yaml
- name: Create test database
  run: psql -U postgres -c 'CREATE DATABASE vsgkugelberg_test;'
  
- name: Run E2E tests
  run: pnpm test:e2e
  env:
    DATABASE_URL: postgresql://postgres:postgres@localhost:5432/vsgkugelberg_test
    JWT_SECRET: test-secret
```

**Rationale:**
- ✅ Automated test execution
- ✅ Fail fast on breaking changes
- ✅ Consistent test environment

## Testing Principles

1. **Isolation**: Each test should be independent
2. **Clarity**: Test names describe what is being tested
3. **Coverage**: Test happy paths and error cases
4. **Realism**: Use real database, real HTTP requests
5. **Maintainability**: DRY with helpers and fixtures
6. **Speed**: Optimize without sacrificing reliability

## Future Enhancements

1. **Parallel Execution**: Investigate multiple test databases for parallel runs
2. **Seed Caching**: Cache common seed data between tests
3. **Visual Reports**: Add test result visualization
4. **API Contract Testing**: Consider OpenAPI/Swagger validation
5. **Load Testing**: Add performance benchmarks

## References

- [NestJS Testing Documentation](https://docs.nestjs.com/fundamentals/testing)
- [Jest Best Practices](https://jestjs.io/docs/api)
- [Supertest Documentation](https://github.com/ladjs/supertest)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
- [Test Isolation Patterns](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html)
