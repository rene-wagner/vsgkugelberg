# api-testing Specification

## Purpose
TBD - created by archiving change add-e2e-testing. Update Purpose after archive.
## Requirements
### Requirement: Jest E2E Configuration

The API MUST provide comprehensive Jest configuration for end-to-end testing that uses ts-jest for TypeScript transformation and includes proper test patterns, timeouts, and environment settings.

#### Scenario: Jest E2E config file exists

**Given** the API project structure  
**When** checking for Jest E2E configuration  
**Then** a file `jest-e2e.config.js` must exist in `apps/api/`  
**And** the config must set `testRegex` to match `.e2e-spec.ts$` files  
**And** the config must set `testEnvironment` to `'node'`  
**And** the config must configure `transform` to use `ts-jest` for `.ts` files  
**And** the config must set `testTimeout` to at least 30000 milliseconds  
**And** the config must set `maxWorkers` to 1 for sequential execution  
**And** the config must configure `moduleNameMapper` for path aliases  
**And** the config must set `setupFilesAfterEnv` to load test setup file

#### Scenario: Jest dependencies are installed

**Given** the API project's package.json  
**When** checking devDependencies  
**Then** `jest` must be installed  
**And** `@types/jest` must be installed  
**And** `ts-jest` must be installed  
**And** `supertest` must be installed  
**And** `@types/supertest` must be installed  
**And** `@nestjs/testing` must be available

#### Scenario: Test scripts are available

**Given** the API project's package.json  
**When** checking scripts section  
**Then** a `test:e2e` script must exist that runs Jest with E2E config  
**And** the script must include `--runInBand` flag for sequential execution  
**And** a `test:e2e:watch` script must exist for watch mode  
**And** a `test:e2e:cov` script must exist for coverage reporting

---

### Requirement: Test Database Configuration

The API MUST use a dedicated test database separate from development and production databases, with proper environment configuration and migration support.

#### Scenario: Test environment file exists

**Given** the API project structure  
**When** checking for test environment configuration  
**Then** a file `.env.test` must exist in `apps/api/`  
**And** the file must define `DATABASE_URL` pointing to `vsgkugelberg_test` database  
**And** the file must define `JWT_SECRET` with a test-specific value  
**And** the file must set `NODE_ENV` to `"test"`

#### Scenario: Test database is isolated from development

**Given** the test environment configuration  
**When** tests are running  
**Then** the database name must be `vsgkugelberg_test`  
**And** the test database must be separate from `vsgkugelberg` development database  
**And** test data must not affect development data

#### Scenario: Test database can be reset

**Given** a test database with existing data  
**When** database cleanup is performed  
**Then** all tables must be dropped and recreated  
**And** migrations must be re-applied  
**And** the database must be in a clean initial state

---

### Requirement: Test Helper Utilities

The API MUST provide reusable helper functions for common testing operations including database management, authentication, and app initialization.

#### Scenario: Database cleanup helper exists

**Given** the test helper utilities  
**When** checking for database helpers  
**Then** a function `cleanDatabase` must exist in `test/helpers/`  
**And** the function must accept a `PrismaService` instance  
**And** the function must delete all data from all tables  
**And** the function must reset auto-increment sequences

#### Scenario: Authentication helper exists

**Given** the test helper utilities  
**When** checking for authentication helpers  
**Then** a function `createAuthenticatedUser` must exist in `test/helpers/auth-helper.ts`  
**And** the function must accept an `INestApplication` instance  
**And** the function must create a user in the database  
**And** the function must log in the user via `/auth/login` endpoint  
**And** the function must return both the user object and JWT cookie string  
**And** the function must support optional user data customization

#### Scenario: Test app initialization helper exists

**Given** the test helper utilities  
**When** checking for app initialization helpers  
**Then** a function to create test NestJS app must exist in `test/helpers/test-app.ts`  
**And** the function must compile a Test module with AppModule  
**And** the function must apply necessary middleware (e.g., cookie-parser)  
**And** the function must initialize the application  
**And** the function must return the initialized app instance

---

### Requirement: Test Fixtures

The API MUST provide predefined test data fixtures for seeding databases and creating consistent test scenarios across all test suites.

#### Scenario: Test fixtures are defined

**Given** the test fixture files  
**When** checking for test data definitions  
**Then** fixtures must exist in `test/fixtures/test-data.ts`  
**And** fixtures must define at least two sample users with different roles  
**And** fixtures must define sample posts (both published and draft)  
**And** fixtures must define sample categories  
**And** fixtures must define sample tags  
**And** fixtures must define sample departments  
**And** all fixtures must include required fields per data model

#### Scenario: Seed function is available

**Given** the test fixture files  
**When** checking for seeding capabilities  
**Then** a `seedDatabase` function must exist  
**And** the function must accept a `PrismaService` instance  
**And** the function must create users with properly hashed passwords  
**And** the function must create related entities (posts, categories, tags, departments)  
**And** the function must return created entities for test reference

---

### Requirement: Health Check E2E Tests

The API MUST provide E2E tests for the health check endpoint to verify basic application health status reporting.

#### Scenario: Health check test file exists

**Given** the E2E test structure  
**When** checking for health check tests  
**Then** a file `health.e2e-spec.ts` must exist in `test/e2e/`  
**And** the file must contain a test suite for `HealthController (e2e)`

#### Scenario: Health endpoint returns OK status

**Given** the test application is running  
**When** a GET request is made to `/health`  
**Then** the response status must be 200  
**And** the response body must contain `{ "status": "ok" }`  
**And** the endpoint must be publicly accessible (no authentication required)

---

### Requirement: Authentication E2E Tests

The API MUST provide comprehensive E2E tests for authentication endpoints covering login success, failures, validation, and cookie security.

#### Scenario: Authentication test file exists

**Given** the E2E test structure  
**When** checking for authentication tests  
**Then** a file `auth.e2e-spec.ts` must exist in `test/e2e/`  
**And** the file must contain a test suite for `AuthController (e2e)`

#### Scenario: Successful login with username

**Given** a user with username "testuser" and password "password123" exists in the test database  
**When** a POST request is made to `/auth/login` with valid username and password  
**Then** the response status must be 200  
**And** the response body must contain a user object without password field  
**And** the response must set a cookie named "access_token"  
**And** the cookie must have HttpOnly attribute  
**And** the cookie must have SameSite=Strict attribute

#### Scenario: Successful login with email

**Given** a user with email "test@example.com" and password "password123" exists  
**When** a POST request is made to `/auth/login` with valid email and password  
**Then** the response status must be 200  
**And** the response body must contain a user object  
**And** the response must set an access_token cookie

#### Scenario: Login fails with invalid password

**Given** a user with username "testuser" exists  
**When** a POST request is made to `/auth/login` with incorrect password  
**Then** the response status must be 401  
**And** the response body must contain `{ "statusCode": 401, "message": "Unauthorized" }`  
**And** no cookie must be set

#### Scenario: Login fails with non-existent user

**Given** no user with username "nonexistent" exists  
**When** a POST request is made to `/auth/login` with that username  
**Then** the response status must be 401  
**And** the response body must contain unauthorized error

#### Scenario: Login validation for missing fields

**Given** the API is running  
**When** a POST request is made to `/auth/login` without username field  
**Then** the response status must be 400  
**And** the response body must contain validation error  
**When** a POST request is made to `/auth/login` without password field  
**Then** the response status must be 400  
**And** the response body must contain validation error

---

### Requirement: Users E2E Tests

The API MUST provide comprehensive E2E tests for user CRUD operations covering public access, protected routes, validation, and error handling.

#### Scenario: Users test file exists

**Given** the E2E test structure  
**When** checking for user tests  
**Then** a file `users.e2e-spec.ts` must exist in `test/e2e/`  
**And** the file must contain a test suite for `UsersController (e2e)`

#### Scenario: Get all users is public

**Given** users exist in the database  
**When** a GET request is made to `/users` without authentication  
**Then** the response status must be 200  
**And** the response body must be an array of user objects  
**And** user objects must not include password fields

#### Scenario: Get user by ID is public

**Given** a user with ID 1 exists  
**When** a GET request is made to `/users/1` without authentication  
**Then** the response status must be 200  
**And** the response body must contain the user object without password

#### Scenario: Create user requires authentication

**Given** an unauthenticated request  
**When** a POST request is made to `/users`  
**Then** the response status must be 401  
**And** the response body must contain unauthorized error

#### Scenario: Create user with authentication

**Given** an authenticated user session  
**When** a POST request is made to `/users` with valid user data  
**Then** the response status must be 201  
**And** the response body must contain the created user object  
**And** the user must exist in the database

#### Scenario: Update user requires authentication

**Given** a user with ID 1 exists  
**When** an unauthenticated PATCH request is made to `/users/1`  
**Then** the response status must be 401

#### Scenario: Update user with authentication

**Given** an authenticated user session and a user with ID 1 exists  
**When** a PATCH request is made to `/users/1` with update data  
**Then** the response status must be 200  
**And** the response body must contain the updated user object

#### Scenario: Delete user requires authentication

**Given** a user with ID 1 exists  
**When** an unauthenticated DELETE request is made to `/users/1`  
**Then** the response status must be 401

#### Scenario: Delete user with authentication

**Given** an authenticated user session and a user with ID 1 exists  
**When** a DELETE request is made to `/users/1`  
**Then** the response status must be 200  
**And** the user must be removed from the database

#### Scenario: User validation errors

**Given** an authenticated user session  
**When** a POST request is made to `/users` with invalid email format  
**Then** the response status must be 400  
**And** the response body must contain validation error for email field

---

### Requirement: Posts E2E Tests

The API MUST provide comprehensive E2E tests for post CRUD operations including filtering, slug-based access, and relationship handling.

#### Scenario: Posts test file exists

**Given** the E2E test structure  
**When** checking for post tests  
**Then** a file `posts.e2e-spec.ts` must exist in `test/e2e/`  
**And** the file must contain a test suite for `PostsController (e2e)`

#### Scenario: Get all posts is public

**Given** posts exist in the database  
**When** a GET request is made to `/posts` without authentication  
**Then** the response status must be 200  
**And** the response body must be an array of post objects

#### Scenario: Filter posts by published status

**Given** both published and draft posts exist  
**When** a GET request is made to `/posts?published=true`  
**Then** the response status must be 200  
**And** all returned posts must have `published: true`

#### Scenario: Filter posts by category

**Given** posts with different categories exist  
**When** a GET request is made to `/posts?category=tech`  
**Then** the response status must be 200  
**And** all returned posts must be associated with the "tech" category

#### Scenario: Filter posts by tag

**Given** posts with different tags exist  
**When** a GET request is made to `/posts?tag=javascript`  
**Then** the response status must be 200  
**And** all returned posts must be associated with the "javascript" tag

#### Scenario: Get post by slug is public

**Given** a post with slug "test-post" exists  
**When** a GET request is made to `/posts/test-post` without authentication  
**Then** the response status must be 200  
**And** the response body must contain the post object

#### Scenario: Create post requires authentication

**Given** an unauthenticated request  
**When** a POST request is made to `/posts`  
**Then** the response status must be 401

#### Scenario: Create post with authentication

**Given** an authenticated user session  
**When** a POST request is made to `/posts` with valid post data  
**Then** the response status must be 201  
**And** the response body must contain the created post object  
**And** the post must exist in the database

#### Scenario: Update post requires authentication

**Given** a post with slug "test-post" exists  
**When** an unauthenticated PATCH request is made to `/posts/test-post`  
**Then** the response status must be 401

#### Scenario: Update post with authentication

**Given** an authenticated user session and a post exists  
**When** a PATCH request is made to `/posts/test-post` with update data  
**Then** the response status must be 200  
**And** the response body must contain the updated post object

#### Scenario: Delete post requires authentication

**Given** a post with slug "test-post" exists  
**When** an unauthenticated DELETE request is made to `/posts/test-post`  
**Then** the response status must be 401

#### Scenario: Delete post with authentication

**Given** an authenticated user session and a post exists  
**When** a DELETE request is made to `/posts/test-post`  
**Then** the response status must be 200  
**And** the post must be removed from the database

---

### Requirement: Categories E2E Tests

The API MUST provide comprehensive E2E tests for category CRUD operations including slug-based access and unique constraint validation.

#### Scenario: Categories test file exists

**Given** the E2E test structure  
**When** checking for category tests  
**Then** a file `categories.e2e-spec.ts` must exist in `test/e2e/`  
**And** the file must contain a test suite for `CategoriesController (e2e)`

#### Scenario: Get all categories is public

**Given** categories exist in the database  
**When** a GET request is made to `/categories` without authentication  
**Then** the response status must be 200  
**And** the response body must be an array of category objects

#### Scenario: Get category by slug is public

**Given** a category with slug "technology" exists  
**When** a GET request is made to `/categories/technology` without authentication  
**Then** the response status must be 200  
**And** the response body must contain the category object

#### Scenario: Create category requires authentication

**Given** an unauthenticated request  
**When** a POST request is made to `/categories`  
**Then** the response status must be 401

#### Scenario: Create category with authentication

**Given** an authenticated user session  
**When** a POST request is made to `/categories` with valid category data  
**Then** the response status must be 201  
**And** the response body must contain the created category object

#### Scenario: Update category requires authentication

**Given** a category with slug "technology" exists  
**When** an unauthenticated PATCH request is made to `/categories/technology`  
**Then** the response status must be 401

#### Scenario: Delete category requires authentication

**Given** a category with slug "technology" exists  
**When** an unauthenticated DELETE request is made to `/categories/technology`  
**Then** the response status must be 401

#### Scenario: Category unique constraint validation

**Given** an authenticated user session and a category with name "Technology" exists  
**When** a POST request is made to `/categories` with name "Technology"  
**Then** the response status must be 400 or 409  
**And** the response body must indicate a unique constraint violation

---

### Requirement: Tags E2E Tests

The API MUST provide comprehensive E2E tests for tag CRUD operations including slug-based access and unique constraint validation.

#### Scenario: Tags test file exists

**Given** the E2E test structure  
**When** checking for tag tests  
**Then** a file `tags.e2e-spec.ts` must exist in `test/e2e/`  
**And** the file must contain a test suite for `TagsController (e2e)`

#### Scenario: Get all tags is public

**Given** tags exist in the database  
**When** a GET request is made to `/tags` without authentication  
**Then** the response status must be 200  
**And** the response body must be an array of tag objects

#### Scenario: Get tag by slug is public

**Given** a tag with slug "javascript" exists  
**When** a GET request is made to `/tags/javascript` without authentication  
**Then** the response status must be 200  
**And** the response body must contain the tag object

#### Scenario: Create tag requires authentication

**Given** an unauthenticated request  
**When** a POST request is made to `/tags`  
**Then** the response status must be 401

#### Scenario: Create tag with authentication

**Given** an authenticated user session  
**When** a POST request is made to `/tags` with valid tag data  
**Then** the response status must be 201  
**And** the response body must contain the created tag object

#### Scenario: Update tag requires authentication

**Given** a tag with slug "javascript" exists  
**When** an unauthenticated PATCH request is made to `/tags/javascript`  
**Then** the response status must be 401

#### Scenario: Delete tag requires authentication

**Given** a tag with slug "javascript" exists  
**When** an unauthenticated DELETE request is made to `/tags/javascript`  
**Then** the response status must be 401

---

### Requirement: Departments E2E Tests

The API MUST provide comprehensive E2E tests for department CRUD operations including slug-based access and unique constraint validation.

#### Scenario: Departments test file exists

**Given** the E2E test structure  
**When** checking for department tests  
**Then** a file `departments.e2e-spec.ts` must exist in `test/e2e/`  
**And** the file must contain a test suite for `DepartmentsController (e2e)`

#### Scenario: Get all departments is public

**Given** departments exist in the database  
**When** a GET request is made to `/departments` without authentication  
**Then** the response status must be 200  
**And** the response body must be an array of department objects

#### Scenario: Get department by slug is public

**Given** a department with slug "football" exists  
**When** a GET request is made to `/departments/football` without authentication  
**Then** the response status must be 200  
**And** the response body must contain the department object

#### Scenario: Create department requires authentication

**Given** an unauthenticated request  
**When** a POST request is made to `/departments`  
**Then** the response status must be 401

#### Scenario: Create department with authentication

**Given** an authenticated user session  
**When** a POST request is made to `/departments` with valid department data  
**Then** the response status must be 201  
**And** the response body must contain the created department object

#### Scenario: Update department requires authentication

**Given** a department with slug "football" exists  
**When** an unauthenticated PATCH request is made to `/departments/football`  
**Then** the response status must be 401

#### Scenario: Delete department requires authentication

**Given** a department with slug "football" exists  
**When** an unauthenticated DELETE request is made to `/departments/football`  
**Then** the response status must be 401

---

### Requirement: Test Isolation and Cleanup

The API MUST ensure test isolation through proper database cleanup and independent test execution to prevent test interference.

#### Scenario: Database is cleaned between test suites

**Given** a test suite has completed execution  
**When** the next test suite begins  
**Then** the test database must be in a clean state  
**And** all previous test data must be removed  
**And** no data from previous tests must affect current tests

#### Scenario: Tests run sequentially

**Given** the Jest E2E configuration  
**When** tests are executed  
**Then** tests must run sequentially (not in parallel)  
**And** the `--runInBand` flag must be set  
**And** database conflicts must be prevented

#### Scenario: Test app is properly closed

**Given** a test suite with initialized NestJS app  
**When** the test suite completes (afterAll hook)  
**Then** the app must be closed with `app.close()`  
**And** database connections must be released  
**And** no hanging processes must remain

---

### Requirement: Documentation and Setup

The API MUST provide clear documentation for setting up and running E2E tests including database configuration and troubleshooting.

#### Scenario: E2E testing documentation exists

**Given** the API README file  
**When** checking for E2E testing documentation  
**Then** a section titled "E2E Testing" or similar must exist  
**And** the section must explain how to set up the test database  
**And** the section must explain how to run E2E tests  
**And** the section must explain the test structure and organization

#### Scenario: Test database setup instructions are clear

**Given** the E2E testing documentation  
**When** following setup instructions  
**Then** instructions must include creating the `vsgkugelberg_test` database  
**And** instructions must include setting up `.env.test` file  
**And** instructions must include running migrations on test database  
**And** instructions must be executable by a new developer

#### Scenario: Test execution commands are documented

**Given** the E2E testing documentation  
**When** checking for test execution commands  
**Then** the command `pnpm test:e2e` must be documented  
**And** the watch mode command must be documented  
**And** the coverage command must be documented  
**And** the debug command must be documented

---

