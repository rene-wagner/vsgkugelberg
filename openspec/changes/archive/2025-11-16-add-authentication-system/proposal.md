# Change: Add Authentication System

## Why

The application currently has no authentication mechanism. To secure user-specific operations (posts, profile management) and enable protected endpoints, we need a robust authentication system with JWT tokens in secure HTTP-only cookies.

## What Changes

- Add JWT-based authentication with username/email + password login
- Return secure HTTP-only cookies containing JWT tokens to prevent XSS attacks
- Create login endpoint (`POST /auth/login`)
- Implement LocalStrategy for password validation and JwtStrategy for token validation
- Add Prisma seed script to create test users with hashed passwords
- Install dependencies: `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-local`, `passport-jwt`, `cookie-parser`
- Reuse existing `PasswordService` for password verification
- Configure CORS to support credentials (cookies)

## Impact

- **New specs:** `authentication-api` (defines login endpoint and JWT requirements)
- **Modified specs:** `data-model` (add seeding requirements for test users)
- **New code:** 
  - `apps/api/src/auth/` - AuthModule with strategies, guards, service, controller
  - `apps/api/prisma/seed.ts` - Database seeding script
- **Environment variables:** Requires `JWT_SECRET` configuration
- **Dependencies:** 8 new npm packages (JWT, Passport, cookie-parser)

## Scope

### In Scope
- Username/email + password authentication using NestJS Passport Local Strategy
- JWT token generation and validation
- Secure HTTP-only cookies with proper security flags
- Login endpoint with request validation
- JwtAuthGuard for protecting routes
- Prisma seed script with 3 test users (admin, john.doe, test.user)
- CORS configuration for cookie support
- Environment variable configuration

### Out of Scope
- OAuth/social login integration (future enhancement)
- Refresh token mechanism (future enhancement)
- Logout endpoint (can be handled client-side by clearing cookie)
- Password reset/forgot password functionality
- Email verification
- Rate limiting on login attempts
- Two-factor authentication (2FA)
- Role-based access control implementation (guard exists, roles not yet implemented)

