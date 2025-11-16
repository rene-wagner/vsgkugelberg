# Protect Mutating Routes with Authentication

## Why

Currently, all API endpoints are publicly accessible without authentication. This creates security risks as anyone can create, modify, or delete resources. To secure the API, we need to enforce authentication for all mutating operations (POST, PATCH, DELETE) while keeping read operations (GET) and the login endpoint public.

## What Changes

This change protects all POST, PATCH, and DELETE routes across the API by requiring JWT authentication. Only authenticated users will be able to perform create, update, and delete operations. The login endpoint and GET routes remain publicly accessible.

### Affected Capabilities

- `authentication-api` - Adds global guard configuration and public route decorator

### Implementation Details

Following NestJS best practices documented at https://docs.nestjs.com/security/authentication:

1. Register `JwtAuthGuard` as a global guard using `APP_GUARD` provider
2. Create a `@Public()` decorator using `SetMetadata` to mark public routes
3. Modify `JwtAuthGuard` to check for public metadata using `Reflector`
4. Apply `@Public()` decorator to public endpoints (login and all GET routes)
5. All POST, PATCH, DELETE routes require authentication automatically

### Files Changed

- `apps/api/src/auth/decorators/public.decorator.ts` (new)
- `apps/api/src/auth/decorators/index.ts` (new)
- `apps/api/src/auth/guards/jwt-auth.guard.ts` (modified)
- `apps/api/src/auth/auth.module.ts` (modified)
- `apps/api/src/auth/auth.controller.ts` (modified)
- `apps/api/src/departments/departments.controller.ts` (modified)
- `apps/api/src/posts/posts.controller.ts` (modified)
- `apps/api/src/categories/categories.controller.ts` (modified)
- `apps/api/src/tags/tags.controller.ts` (modified)
- `apps/api/src/users/users.controller.ts` (modified)
- `apps/api/src/app.controller.ts` (modified)
- `apps/api/src/health/health.controller.ts` (modified)

### Benefits

- **Security by Default**: All mutating operations require authentication
- **Clean Code**: Decorator-based approach for marking public routes
- **Easy Exemptions**: Simple `@Public()` decorator for public endpoints
- **Follows Best Practices**: Aligns with official NestJS documentation patterns

### Risks & Considerations

- **Breaking Change**: Existing API consumers performing mutating operations will need to authenticate
- **Testing**: All integration tests for mutating routes will need authentication setup
- **GET Routes**: Remain public by design; future changes may require separate consideration
