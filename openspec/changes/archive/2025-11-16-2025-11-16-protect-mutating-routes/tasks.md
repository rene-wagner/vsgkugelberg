# Tasks for Protecting Mutating Routes

This is an ordered checklist of implementation tasks. Complete each task sequentially and mark as done with `[x]`.

## Implementation Tasks

- [x] Create `@Public()` decorator using `SetMetadata` in `apps/api/src/auth/decorators/public.decorator.ts`
- [x] Export public decorator and metadata key from `apps/api/src/auth/decorators/index.ts`
- [x] Update `JwtAuthGuard` to check for public metadata using `Reflector` before enforcing authentication
- [x] Register `JwtAuthGuard` as global guard in `AuthModule` using `APP_GUARD` provider
- [x] Apply `@Public()` decorator to login endpoint in `AuthController`
- [x] Verify all POST, PATCH, DELETE routes in `PostsController` are protected (no changes needed)
- [x] Verify all POST, PATCH, DELETE routes in `CategoriesController` are protected (no changes needed)
- [x] Verify all POST, PATCH, DELETE routes in `TagsController` are protected (no changes needed)
- [x] Verify all POST, PATCH, DELETE routes in `DepartmentsController` are protected (no changes needed)
- [x] Verify all POST, PATCH, DELETE routes in `UsersController` are protected (no changes needed)
- [x] Verify all GET routes remain publicly accessible (no changes needed)
- [x] Test login endpoint works without authentication (using curl or Postman)
- [x] Test POST routes require authentication (return 401 without token)
- [x] Test POST routes work with valid JWT token (return expected response)
- [x] Test GET routes work without authentication
- [ ] Update existing integration tests to handle authentication where needed

## Validation Tasks

- [x] Run `pnpm --filter=api lint` to check code style
- [x] Run `pnpm --filter=api type-check` to verify TypeScript types
- [ ] Run `pnpm --filter=api test` to ensure all tests pass
- [x] Manual testing of protected and public endpoints
- [x] Verify error messages for unauthorized requests are appropriate

## Documentation Tasks

- [ ] Update API documentation to reflect authentication requirements
- [ ] Document which routes require authentication and which are public
