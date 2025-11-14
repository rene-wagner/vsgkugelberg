# Proposal: Add User API Routes

## Summary
Implement RESTful API endpoints for user CRUD operations (Create, Read, Update, Delete) in the NestJS API application. This change introduces a dedicated users module with controller, service, and DTOs to manage user entities through the existing Prisma database connection.

## Motivation
With the database connection and User model already established via Prisma ORM, the API currently lacks endpoints to interact with user data. This change enables frontend applications and external clients to manage users through a well-structured REST API following NestJS best practices.

## Goals
- Implement GET /users (list all users)
- Implement GET /users/:id (get single user by ID)
- Implement POST /users (create new user)
- Implement PATCH /users/:id (update existing user)
- Implement DELETE /users/:id (delete user)
- Use DTOs for request validation
- Return appropriate HTTP status codes
- Exclude sensitive password data from responses
- Follow NestJS resource generator conventions

## Non-Goals
- Authentication/authorization (to be addressed separately)
- Post-related endpoints (explicitly out of scope)
- Advanced filtering or pagination (keep initial implementation simple)
- Email verification or user activation flows

## Affected Components
- `apps/api/src/` - New users module with controller, service, and DTOs
- `apps/api/src/app.module.ts` - Register UsersModule
- Prisma User model - Already exists, no schema changes needed

## Dependencies
- Existing Prisma setup (data-model spec)
- Existing password-security spec (PasswordService)
- NestJS common decorators and validation pipes

## Alternatives Considered
1. **Using @nestjsx/crud** - Provides automatic CRUD endpoints but adds another dependency and reduces control over implementation details. Decided against for a simpler, more explicit approach.
2. **Combining users and posts in one controller** - Would violate separation of concerns and make the codebase harder to maintain as features grow.
3. **Using PUT instead of PATCH** - PATCH is more appropriate for partial updates, which is the expected use case.

## Related Changes
- None (this is a new standalone feature)

## Migration Strategy
Not applicable - this is a new feature with no breaking changes to existing functionality.
