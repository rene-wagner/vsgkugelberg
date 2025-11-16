# Implementation Tasks: Add Authentication System

**Change ID:** `add-authentication-system`

## Task Checklist

### Phase 1: Dependencies and Setup

- [x] **Task 1.1:** Install authentication dependencies
  - Install `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-local`, `passport-jwt`
  - Install dev dependencies: `@types/passport-local`, `@types/passport-jwt`
  - Install `cookie-parser` for parsing cookies
  - Verify installations with `pnpm list`

- [x] **Task 1.2:** Add cookie-parser middleware to main.ts
  - Import `cookieParser` from `cookie-parser`
  - Add `app.use(cookieParser())` before CORS configuration
  - Verify cookie parsing works

- [x] **Task 1.3:** Configure environment variables
  - Add `JWT_SECRET` to `.env.example` with placeholder value
  - Add `JWT_SECRET` to `.env` with secure random string (min 32 chars)
  - Add `FRONTEND_URL` for CORS configuration
  - Document environment variables in README

### Phase 2: Auth Module Structure

- [x] **Task 2.1:** Generate AuthModule
  - Create `apps/api/src/auth/` directory
  - Generate module: `nest g module auth`
  - Generate service: `nest g service auth`
  - Generate controller: `nest g controller auth`
  - Verify module is registered in `app.module.ts`

- [x] **Task 2.2:** Create DTOs
  - Create `apps/api/src/auth/dto/login.dto.ts`
  - Add `username` field (accepts username or email)
  - Add `password` field
  - Add validation decorators (`@IsString`, `@IsNotEmpty`)
  - Export DTO from index

- [x] **Task 2.3:** Create Guards directory
  - Create `apps/api/src/auth/guards/` directory
  - Create `local-auth.guard.ts` extending `AuthGuard('local')`
  - Create `jwt-auth.guard.ts` extending `AuthGuard('jwt')`
  - Export guards from index

- [x] **Task 2.4:** Create Strategies directory
  - Create `apps/api/src/auth/strategies/` directory
  - Prepare for LocalStrategy and JwtStrategy implementation
  - Export strategies from index

### Phase 3: Local Strategy (Username/Password)

- [x] **Task 3.1:** Implement LocalStrategy
  - Create `apps/api/src/auth/strategies/local.strategy.ts`
  - Extend `PassportStrategy(Strategy)` from `passport-local`
  - Inject `AuthService` in constructor
  - Configure `usernameField: 'username'` in super()
  - Implement `validate(username, password)` method
  - Call `authService.validateUser()` and throw `UnauthorizedException` if null
  - Add `@Injectable()` decorator

- [x] **Task 3.2:** Implement AuthService.validateUser()
  - In `apps/api/src/auth/auth.service.ts`, inject `PrismaService` and `PasswordService`
  - Implement `validateUser(usernameOrEmail: string, password: string)`
  - Query user with `prisma.user.findFirst({ where: { OR: [{ username }, { email }] } })`
  - Use `passwordService.compare()` to verify password
  - Return user without password if valid, null otherwise
  - Handle errors gracefully

- [x] **Task 3.3:** Register LocalStrategy in AuthModule
  - Import `PassportModule` from `@nestjs/passport`
  - Import `LocalStrategy`
  - Add `LocalStrategy` to providers array
  - Add `PassportModule` to imports array
  - Import `UsersModule` to access PrismaService
  - Import and provide `PasswordService`

### Phase 4: JWT Strategy (Token Validation)

- [x] **Task 4.1:** Configure JwtModule
  - Import `JwtModule` from `@nestjs/jwt`
  - Add `JwtModule.register({ secret, signOptions: { expiresIn: '1h' } })` to imports
  - Use `process.env.JWT_SECRET` for secret
  - Provide fallback for development: `'dev-secret-change-in-production'`

- [x] **Task 4.2:** Implement JwtStrategy
  - Create `apps/api/src/auth/strategies/jwt.strategy.ts`
  - Extend `PassportStrategy(Strategy, 'jwt')` from `passport-jwt`
  - Configure `jwtFromRequest: ExtractJwt.fromExtractors([(req) => req?.cookies?.access_token])`
  - Configure `secretOrKey: process.env.JWT_SECRET`
  - Implement `validate(payload)` method returning `{ id: payload.sub, username: payload.username }`
  - Add `@Injectable()` decorator

- [x] **Task 4.3:** Register JwtStrategy in AuthModule
  - Import `JwtStrategy`
  - Add `JwtStrategy` to providers array
  - Verify JWT module and strategy are configured

### Phase 5: Login Endpoint

- [x] **Task 5.1:** Implement AuthService.login()
  - In `auth.service.ts`, inject `JwtService`
  - Implement `login(user: any)` method
  - Create JWT payload: `{ username: user.username, sub: user.id }`
  - Sign token: `this.jwtService.sign(payload)`
  - Return `{ access_token, user }`

- [x] **Task 5.2:** Implement AuthController.login()
  - In `auth.controller.ts`, inject `AuthService`
  - Import `@Res`, `@Request`, `Response` from NestJS
  - Create `@Post('login')` endpoint
  - Add `@UseGuards(LocalAuthGuard)` decorator
  - Extract user from `req.user` (populated by LocalStrategy)
  - Call `authService.login(req.user)`
  - Set cookie: `res.cookie('access_token', access_token, { httpOnly, secure, sameSite, maxAge })`
  - Use `@Res({ passthrough: true })` to allow response object access
  - Return `{ user }` (without password)

- [x] **Task 5.3:** Configure CORS for cookies
  - In `apps/api/src/main.ts`, update `app.enableCors()`
  - Set `origin: process.env.FRONTEND_URL || 'http://localhost:5173'`
  - Set `credentials: true`
  - Test CORS with frontend

### Phase 6: Prisma Seeding

- [x] **Task 6.1:** Create seed script
  - Create `apps/api/prisma/seed.ts`
  - Import `PrismaClient` and `PasswordService`
  - Instantiate both clients
  - Create `main()` async function

- [x] **Task 6.2:** Define seed users
  - Create array of 3 users: admin, john.doe, test.user
  - Hash passwords using `passwordService.hash()`
  - Use `upsert` to avoid duplicates (where: { email })
  - Log created usernames

- [x] **Task 6.3:** Add error handling to seed script
  - Wrap main() in try-catch
  - Log errors to console
  - Exit with code 1 on error
  - Add finally block with `prisma.$disconnect()`

- [x] **Task 6.4:** Configure package.json
  - Add `"prisma": { "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts" }` to `apps/api/package.json`
  - Install `ts-node` if not present
  - Test seed with `npx prisma db seed`

### Phase 7: Testing and Validation

- [x] **Task 7.1:** Manual testing - Login with username
  - POST `/auth/login` with `{ username: "admin", password: "Admin123!" }`
  - Verify 200 OK response
  - Verify `access_token` cookie is set with httpOnly, secure, sameSite
  - Verify response body contains user without password

- [x] **Task 7.2:** Manual testing - Login with email
  - POST `/auth/login` with `{ username: "john.doe@example.com", password: "password123" }`
  - Verify 200 OK response
  - Verify cookie is set correctly

- [x] **Task 7.3:** Manual testing - Invalid credentials
  - POST `/auth/login` with wrong password
  - Verify 401 Unauthorized response
  - Verify no cookie is set

- [x] **Task 7.4:** Manual testing - Missing fields
  - POST `/auth/login` without username
  - POST `/auth/login` without password
  - Verify 400 Bad Request with validation errors

- [x] **Task 7.5:** Manual testing - JWT validation
  - Create a test endpoint protected with `@UseGuards(JwtAuthGuard)`
  - Make request with cookie from login
  - Verify `req.user` contains user data
  - Make request without cookie
  - Verify 401 Unauthorized

- [x] **Task 7.6:** Manual testing - Seeded users
  - Run `npx prisma db seed`
  - Verify 3 users created in database
  - Test login for each seeded user
  - Run seed again and verify no duplicates

- [x] **Task 7.7:** OpenSpec validation
  - Run `openspec validate --strict`
  - Fix any validation errors
  - Ensure all specs pass

### Phase 8: Documentation and Cleanup

- [x] **Task 8.1:** Document authentication usage
  - Update API README with login endpoint example
  - Document required environment variables
  - Add examples of protecting routes with `JwtAuthGuard`
  - Document seeded user credentials (with security warning)

- [x] **Task 8.2:** Review security configuration
  - Verify JWT_SECRET is not hardcoded
  - Verify secure flag works in production
  - Verify CORS credentials are configured
  - Verify passwords are never exposed in responses

- [x] **Task 8.3:** Code review
  - Check all files follow NestJS conventions
  - Ensure proper error handling
  - Verify TypeScript types are correct
  - Check for code duplication

## Task Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Structure)
    ↓
Phase 3 (Local Strategy) ←→ Phase 4 (JWT Strategy)
    ↓                              ↓
Phase 5 (Login Endpoint) ←────────┘
    ↓
Phase 6 (Seeding)
    ↓
Phase 7 (Testing)
    ↓
Phase 8 (Documentation)
```

## Estimated Completion

- **Phase 1-2:** ~30 minutes (setup and scaffolding)
- **Phase 3-4:** ~45 minutes (strategies implementation)
- **Phase 5:** ~30 minutes (login endpoint)
- **Phase 6:** ~20 minutes (seeding)
- **Phase 7:** ~45 minutes (comprehensive testing)
- **Phase 8:** ~15 minutes (documentation)

**Total:** ~3 hours

## Success Criteria

✓ All 8 dependencies installed  
✓ AuthModule with LocalStrategy, JwtStrategy, AuthService, AuthController  
✓ Login endpoint returns JWT in HTTP-only cookie  
✓ Login accepts both username and email  
✓ Invalid credentials return 401  
✓ 3 test users seeded successfully  
✓ All manual tests pass  
✓ OpenSpec validation passes  
✓ CORS configured for credentials  
✓ Documentation updated
