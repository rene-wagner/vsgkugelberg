# Authentication System Design

## Architecture Overview

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ POST /auth/login
       │ { username, password }
       ▼
┌────────────────────────────────────────┐
│         AuthController                 │
│  @UseGuards(LocalAuthGuard)            │
└──────┬─────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────┐
│       LocalStrategy                    │
│  - Validates username/email + password │
│  - Calls AuthService.validateUser()    │
└──────┬─────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────┐
│         AuthService                    │
│  - Find user by username or email      │
│  - Verify password with PasswordService│
│  - Generate JWT token                  │
└──────┬─────────────────────────────────┘
       │
       ▼
┌────────────────────────────────────────┐
│         Response                       │
│  - Set HTTP-only cookie with JWT      │
│  - Return user data (without password) │
└────────────────────────────────────────┘
```

## Component Design

### 1. AuthModule

**Location:** `apps/api/src/auth/auth.module.ts`

**Responsibilities:**
- Register LocalStrategy and JwtStrategy
- Configure JwtModule with secret and expiration
- Import UsersModule to access user data
- Import PasswordService for validation

**Dependencies:**
```typescript
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, PasswordService],
  controllers: [AuthController],
})
```

### 2. LocalStrategy

**Location:** `apps/api/src/auth/strategies/local.strategy.ts`

**Purpose:** Validate username/email and password during login

**Flow:**
1. Passport extracts `username` and `password` from request body
2. LocalStrategy calls `AuthService.validateUser(username, password)`
3. If valid, attaches user to request object
4. If invalid, throws UnauthorizedException

**Implementation Pattern:**
```typescript
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'username', // Accepts username OR email
    });
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user; // Attached to req.user
  }
}
```

### 3. JwtStrategy

**Location:** `apps/api/src/auth/strategies/jwt.strategy.ts`

**Purpose:** Validate JWT tokens from cookies for protected routes

**Token Extraction:** From HTTP-only cookie named `access_token`

**Flow:**
1. Extract JWT from cookie
2. Verify signature and expiration
3. Decode payload to get user ID
4. Attach user info to request object

**Implementation Pattern:**
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.access_token, // Extract from cookie
      ]),
      secretOrKey: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    });
  }

  async validate(payload: any) {
    return { id: payload.sub, username: payload.username };
  }
}
```

### 4. AuthService

**Location:** `apps/api/src/auth/auth.service.ts`

**Key Methods:**

#### `validateUser(usernameOrEmail: string, password: string)`
- Finds user by username OR email (flexible input)
- Uses `PasswordService.compare()` to verify password
- Returns user without password if valid, null otherwise

```typescript
async validateUser(usernameOrEmail: string, password: string): Promise<any> {
  const user = await this.prisma.user.findFirst({
    where: {
      OR: [
        { username: usernameOrEmail },
        { email: usernameOrEmail },
      ],
    },
  });

  if (user && await this.passwordService.compare(password, user.password)) {
    const { password, ...result } = user;
    return result;
  }
  return null;
}
```

#### `login(user: any)`
- Generates JWT token with user.id and user.username as payload
- Returns token (controller sets it in cookie)

```typescript
async login(user: any) {
  const payload = { username: user.username, sub: user.id };
  return {
    access_token: this.jwtService.sign(payload),
    user: user,
  };
}
```

### 5. AuthController

**Location:** `apps/api/src/auth/auth.controller.ts`

**Endpoints:**

#### `POST /auth/login`
- Protected by `@UseGuards(LocalAuthGuard)` (triggers LocalStrategy)
- LocalStrategy validates credentials and attaches user to `req.user`
- Controller calls `authService.login(req.user)`
- Sets JWT in HTTP-only cookie
- Returns user data (without password)

**Implementation Pattern:**
```typescript
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res: Response) {
    const { access_token, user } = await this.authService.login(req.user);
    
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour
    });

    return { user };
  }
}
```

### 6. Guards

#### LocalAuthGuard
**Location:** `apps/api/src/auth/guards/local-auth.guard.ts`

```typescript
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
```

#### JwtAuthGuard (for future protected routes)
**Location:** `apps/api/src/auth/guards/jwt-auth.guard.ts`

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

## Security Design

### HTTP-Only Cookies

**Configuration:**
```typescript
res.cookie('access_token', jwt, {
  httpOnly: true,        // Prevents JavaScript access (XSS protection)
  secure: true,          // HTTPS only in production
  sameSite: 'strict',    // CSRF protection
  maxAge: 3600000,       // 1 hour
});
```

**Benefits:**
- **XSS Protection:** JavaScript cannot read the cookie
- **CSRF Protection:** SameSite=strict prevents cross-site requests
- **Automatic Sending:** Browser automatically includes cookie in requests to same domain

### Password Security

**Reusing Existing PasswordService:**
- Already implements bcrypt with salt rounds = 10
- `hash(password: string)`: Hash password before storing
- `compare(password: string, hash: string)`: Verify password during login

**Seed Users:**
- Test passwords should be simple (e.g., "password123") but clearly documented as dev-only
- All passwords hashed before storing in database

### JWT Security

**Token Payload:**
```json
{
  "sub": "user-uuid",
  "username": "john.doe",
  "iat": 1234567890,
  "exp": 1234571490
}
```

**Best Practices:**
- Secret stored in environment variable (never hardcode)
- Short expiration (1 hour)
- Include minimal claims (no sensitive data)
- Use `sub` claim for user ID (standard)

## Data Flow

### Login Flow (Successful)

1. **Client** → POST `/auth/login` with `{ username: "john", password: "secret" }`
2. **LocalAuthGuard** → Triggers LocalStrategy
3. **LocalStrategy** → Calls `AuthService.validateUser("john", "secret")`
4. **AuthService** → Queries database for user with username or email = "john"
5. **AuthService** → Calls `PasswordService.compare("secret", storedHash)`
6. **PasswordService** → Returns `true`
7. **AuthService** → Returns user object (without password)
8. **LocalStrategy** → Attaches user to `req.user`
9. **AuthController** → Calls `AuthService.login(req.user)`
10. **AuthService** → Generates JWT with payload `{ sub: userId, username: "john" }`
11. **AuthController** → Sets cookie with JWT, returns user data
12. **Client** → Receives 200 OK with user data, cookie stored by browser

### Login Flow (Failed)

1. **Client** → POST `/auth/login` with `{ username: "john", password: "wrong" }`
2. **LocalAuthGuard** → Triggers LocalStrategy
3. **LocalStrategy** → Calls `AuthService.validateUser("john", "wrong")`
4. **AuthService** → Queries database for user
5. **AuthService** → Calls `PasswordService.compare("wrong", storedHash)`
6. **PasswordService** → Returns `false`
7. **AuthService** → Returns `null`
8. **LocalStrategy** → Throws `UnauthorizedException`
9. **Client** → Receives 401 Unauthorized with error message

### Protected Route Flow (Future)

1. **Client** → GET `/users/profile` (cookie automatically included)
2. **JwtAuthGuard** → Triggers JwtStrategy
3. **JwtStrategy** → Extracts JWT from `access_token` cookie
4. **JwtStrategy** → Verifies signature and expiration
5. **JwtStrategy** → Decodes payload, attaches user to `req.user`
6. **Controller** → Accesses `req.user.id` to get current user
7. **Service** → Queries database for user profile
8. **Client** → Receives 200 OK with profile data

## Prisma Seeding Design

### Seed Script

**Location:** `apps/api/prisma/seed.ts`

**Purpose:** Create test users for development and testing

**Users to Seed:**
1. **Admin User**
   - Username: `admin`
   - Email: `admin@vsgkugelberg.local`
   - Password: `Admin123!` (hashed)

2. **Regular User**
   - Username: `john.doe`
   - Email: `john.doe@example.com`
   - Password: `password123` (hashed)

3. **Test User**
   - Username: `test.user`
   - Email: `test@example.com`
   - Password: `testpass` (hashed)

**Idempotency:** Use `upsert` to avoid duplicate users on re-run

**Implementation Pattern:**
```typescript
import { PrismaClient } from '@prisma/client';
import { PasswordService } from '../src/common/services/password.service';

const prisma = new PrismaClient();
const passwordService = new PasswordService();

async function main() {
  const users = [
    {
      username: 'admin',
      email: 'admin@vsgkugelberg.local',
      password: await passwordService.hash('Admin123!'),
    },
    {
      username: 'john.doe',
      email: 'john.doe@example.com',
      password: await passwordService.hash('password123'),
    },
    {
      username: 'test.user',
      email: 'test@example.com',
      password: await passwordService.hash('testpass'),
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  console.log('Seeded users:', users.map(u => u.username).join(', '));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Package.json Configuration

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

## Environment Variables

**Required:**
- `JWT_SECRET`: Secret key for signing JWT tokens (production must be strong random string)
- `NODE_ENV`: Environment (production/development) - affects cookie `secure` flag

**Example `.env`:**
```
JWT_SECRET=your-super-secret-key-change-this-in-production
NODE_ENV=development
```

## CORS Configuration

**Important:** For cookies to work with frontend:
```typescript
app.enableCors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true, // Allow cookies
});
```

## Future Enhancements

1. **Refresh Tokens:** Add longer-lived refresh tokens stored in database
2. **Logout Endpoint:** Blacklist tokens or clear cookie
3. **Password Reset:** Email-based password reset flow
4. **Rate Limiting:** Prevent brute force attacks
5. **2FA:** Two-factor authentication
6. **Session Management:** Track active sessions
7. **Role-Based Access Control:** Add roles to user model and enforce with guards
