# Tasks: Add End-to-End Testing Infrastructure

## Phase 1: Setup and Configuration

### 1. Install Dependencies
- [x] Install `jest` as a dev dependency
- [x] Install `@types/jest` for TypeScript support
- [x] Install `ts-jest` for TypeScript transformation
- [x] Install `supertest` for HTTP assertions
- [x] Install `@types/supertest` for TypeScript support
- [x] Verify `@nestjs/testing` is already installed (it should be from initial setup)

**Validation**: Run `pnpm list jest supertest @nestjs/testing` to confirm installations ✅

### 2. Configure Jest for E2E Tests
- [x] Create `apps/api/jest-e2e.config.js` with E2E-specific Jest configuration
- [x] Configure `testRegex` to match `*.e2e-spec.ts` files
- [x] Set `testEnvironment` to `node`
- [x] Configure `transform` to use `ts-jest`
- [x] Set `moduleNameMapper` for path aliases (`@/` → `src/`)
- [x] Configure `setupFilesAfterEnv` for test setup
- [x] Set `testTimeout` to 30000ms (30 seconds)
- [x] Configure `collectCoverageFrom` patterns

**Validation**: Run `npx jest --config jest-e2e.config.js --listTests` to verify configuration ✅

### 3. Add Test Scripts to package.json
- [x] Add `"test:e2e"` script: `"jest --config ./jest-e2e.config.js --runInBand"`
- [x] Add `"test:e2e:watch"` script: `"jest --config ./jest-e2e.config.js --watch --runInBand"`
- [x] Add `"test:e2e:cov"` script: `"jest --config ./jest-e2e.config.js --coverage --runInBand"`
- [x] Add `"test:e2e:debug"` script for debugging

**Validation**: Run `pnpm test:e2e` (should find 0 tests initially) ✅

## Phase 2: Test Infrastructure

### 4. Create Test Database Configuration
- [x] Create `.env.test` file with `DATABASE_URL` pointing to `vsgkugelberg_test`
- [x] Document test database setup in README
- [x] Create database setup helper script

**Validation**: Manually verify `.env.test` exists and has correct connection string ✅

### 5. Create Test Helpers
- [x] Create `test/helpers/setup-test-db.ts` for database initialization
- [x] Implement function to run migrations on test database
- [x] Implement function to seed test data
- [x] Implement function to clear all database tables
- [x] Create `test/helpers/auth-helper.ts` for authentication utilities
- [x] Implement function to create test user
- [x] Implement function to get authentication cookie
- [x] Create `test/helpers/test-app.ts` for app initialization
- [x] Implement function to create and initialize NestJS test app

**Validation**: Run TypeScript type checking with `pnpm type-check` ✅

### 6. Create Test Fixtures
- [x] Create `test/fixtures/test-data.ts` with sample data
- [x] Define sample users (with hashed passwords)
- [x] Define sample posts
- [x] Define sample categories
- [x] Define sample tags
- [x] Define sample departments

**Validation**: Import fixtures in a test file to verify no import errors ✅

### 7. Create Global Test Setup
- [x] Create `test/setup.ts` for global test configuration
- [x] Set up test database before all tests
- [x] Configure global test timeout
- [x] Set up environment variables loading

**Validation**: Reference in Jest config and verify it loads ✅

## Phase 3: Controller E2E Tests

### 8. Health Controller E2E Tests
- [x] Create `test/e2e/health.e2e-spec.ts`
- [x] Test GET `/health` returns 200 with `{ status: 'ok' }`
- [x] Verify public access (no authentication required)

**Validation**: Run `pnpm test:e2e health.e2e-spec.ts` - should pass ✅

### 9. Auth Controller E2E Tests
- [x] Create `test/e2e/auth.e2e-spec.ts`
- [x] Test POST `/auth/login` with valid username and password
- [x] Test POST `/auth/login` with valid email and password
- [x] Test POST `/auth/login` with invalid password (expect 401)
- [x] Test POST `/auth/login` with non-existent user (expect 401)
- [x] Test POST `/auth/login` with missing username (expect 401)
- [x] Test POST `/auth/login` with missing password (expect 401)
- [x] Verify JWT cookie is set with correct attributes
- [x] Verify user object is returned without password field

**Validation**: Run `pnpm test:e2e auth.e2e-spec.ts` - all scenarios pass ✅

### 10. Users Controller E2E Tests
- [x] Create `test/e2e/users.e2e-spec.ts`
- [x] Test GET `/users` (public, no auth required)
- [x] Test GET `/users/:id` (public, no auth required)
- [x] Test POST `/users` (protected, requires auth)
- [x] Test PATCH `/users/:id` (protected, requires auth)
- [x] Test DELETE `/users/:id` (protected, requires auth)
- [x] Test validation errors for invalid DTOs
- [x] Test 404 for non-existent user ID

**Validation**: Run `pnpm test:e2e users.e2e-spec.ts` - all scenarios pass ✅

### 11. Posts Controller E2E Tests
- [x] Create `test/e2e/posts.e2e-spec.ts`
- [x] Test GET `/posts` (public, no auth required)
- [x] Test GET `/posts?published=true` (filter by published)
- [x] Test GET `/posts?category=slug` (filter by category)
- [x] Test GET `/posts?tag=slug` (filter by tag)
- [x] Test GET `/posts/:slug` (public, get by slug)
- [x] Test POST `/posts` (protected, requires auth)
- [x] Test PATCH `/posts/:slug` (protected, requires auth)
- [x] Test DELETE `/posts/:slug` (protected, requires auth)
- [x] Test validation errors for invalid DTOs
- [x] Test 404 for non-existent slug

**Validation**: Run `pnpm test:e2e posts.e2e-spec.ts` - all scenarios pass ✅

### 12. Categories Controller E2E Tests
- [x] Create `test/e2e/categories.e2e-spec.ts`
- [x] Test GET `/categories` (public, no auth required)
- [x] Test GET `/categories/:slug` (public, get by slug)
- [x] Test POST `/categories` (protected, requires auth)
- [x] Test PATCH `/categories/:slug` (protected, requires auth)
- [x] Test DELETE `/categories/:slug` (protected, requires auth)
- [x] Test validation errors for invalid DTOs
- [x] Test 404 for non-existent slug
- [x] Test unique constraint for name and slug

**Validation**: Run `pnpm test:e2e categories.e2e-spec.ts` - all scenarios pass ✅

### 13. Tags Controller E2E Tests
- [x] Create `test/e2e/tags.e2e-spec.ts`
- [x] Test GET `/tags` (public, no auth required)
- [x] Test GET `/tags/:slug` (public, get by slug)
- [x] Test POST `/tags` (protected, requires auth)
- [x] Test PATCH `/tags/:slug` (protected, requires auth)
- [x] Test DELETE `/tags/:slug` (protected, requires auth)
- [x] Test validation errors for invalid DTOs
- [x] Test 404 for non-existent slug
- [x] Test unique constraint for name and slug

**Validation**: Run `pnpm test:e2e tags.e2e-spec.ts` - all scenarios pass ✅

### 14. Departments Controller E2E Tests
- [x] Create `test/e2e/departments.e2e-spec.ts`
- [x] Test GET `/departments` (public, no auth required)
- [x] Test GET `/departments/:slug` (public, get by slug)
- [x] Test POST `/departments` (protected, requires auth)
- [x] Test PATCH `/departments/:slug` (protected, requires auth)
- [x] Test DELETE `/departments/:slug` (protected, requires auth)
- [x] Test validation errors for invalid DTOs
- [x] Test 404 for non-existent slug
- [x] Test unique constraint for name and slug

**Validation**: Run `pnpm test:e2e departments.e2e-spec.ts` - all scenarios pass ✅

## Phase 4: Integration and Documentation

### 15. Full Test Suite Validation
- [x] Run `pnpm test:e2e` to execute all E2E tests
- [x] Verify all tests pass
- [x] Check test execution time (should be under 30 seconds)
- [x] Run `pnpm test:e2e:cov` to generate coverage report
- [x] Verify coverage meets minimum thresholds

**Validation**: All tests pass (55/55), coverage report generated successfully ✅

### 16. CI/CD Integration
- [ ] Update `.github/workflows/ci.yml` to create test database
- [ ] Add E2E test execution step in CI pipeline
- [ ] Configure environment variables for test database
- [ ] Verify tests pass in GitHub Actions

**Validation**: CI pipeline runs successfully with E2E tests

### 17. Documentation
- [x] Update `apps/api/README.md` with E2E testing section
- [x] Document test database setup instructions
- [x] Document how to run E2E tests locally
- [x] Document how to debug E2E tests
- [x] Document test structure and conventions
- [x] Add troubleshooting section

**Validation**: Documentation is clear and follows existing README structure ✅

### 18. Final Validation
- [ ] Run `openspec validate add-e2e-testing --strict`
- [ ] Fix any validation errors
- [ ] Verify all spec requirements are met
- [ ] Verify all tasks are complete

**Validation**: `openspec validate` passes with no errors

## Dependencies and Parallelization

**Sequential Dependencies:**
- Phase 1 must complete before Phase 2
- Phase 2 must complete before Phase 3
- Phase 3 tests can be developed in parallel after Phase 2
- Phase 4 requires all previous phases

**Parallelizable Work:**
- Within Phase 3, all controller test files (tasks 8-14) can be developed in parallel
- Test fixture creation can happen alongside helper creation in Phase 2

## Estimated Effort

- Phase 1: 1-2 hours (setup)
- Phase 2: 2-3 hours (infrastructure)
- Phase 3: 4-6 hours (controller tests)
- Phase 4: 1-2 hours (integration and docs)

**Total: 8-13 hours**
