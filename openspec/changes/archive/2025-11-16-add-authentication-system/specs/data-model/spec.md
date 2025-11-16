# data-model Specification Delta

**Change:** add-authentication-system

## ADDED Requirements

### Requirement: Prisma Database Seeding

The system SHALL provide a database seeding mechanism for creating test users with hashed passwords.

#### Scenario: Seed script setup

**Given** the Prisma configuration  
**When** setting up seeding  
**Then** a `prisma/seed.ts` file must exist in the API app directory  
**And** the seed script must use TypeScript with ts-node  
**And** `package.json` must include a `prisma.seed` configuration  
**And** the seed command must be `ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts`

#### Scenario: Seed test users

**Given** the seed script  
**When** the seed script is executed  
**Then** at least 3 test users must be created:
- Admin user with username `admin`, email `admin@vsgkugelberg.local`
- Regular user with username `john.doe`, email `john.doe@example.com`
- Test user with username `test.user`, email `test@example.com`

**And** all passwords must be hashed using `PasswordService.hash()`  
**And** seed data must be idempotent (using `upsert` to avoid duplicates)  
**And** seed script must log the usernames of created users  
**And** seed script must handle errors gracefully  
**And** seed script must disconnect from Prisma after completion

#### Scenario: Run seeding

**Given** the seed script is configured  
**When** running `prisma db seed`  
**Then** test users must be created in the database  
**And** seeding can be run multiple times without errors  
**And** existing users with same email are not duplicated (upsert behavior)

#### Scenario: Seed user credentials

**Given** seeded test users  
**When** users attempt to log in  
**Then** the following credentials must work:
- Username: `admin`, Password: `Admin123!`
- Username: `john.doe`, Password: `password123`
- Username: `test.user`, Password: `testpass`

**And** passwords must be stored as bcrypt hashes with salt rounds = 10  
**And** plaintext passwords must never be stored in the database

#### Scenario: Seed script dependencies

**Given** the seed script implementation  
**When** the script imports dependencies  
**Then** it must import `PrismaClient` from `@prisma/client`  
**And** it must import `PasswordService` from the common services  
**And** it must instantiate both services correctly  
**And** it must handle async password hashing

---

## Implementation Notes

### Seed Script Template

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

  console.log('✓ Seeded users:', users.map(u => u.username).join(', '));
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

Add to `apps/api/package.json`:

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

### Running Seeds

```bash
# Manually run seed script
cd apps/api
npx prisma db seed

# Reset database and seed (destructive!)
npx prisma migrate reset
```

### Security Notes

- Seed users are for **development and testing only**
- Seed passwords should be simple but clearly documented as non-production
- Production databases should never use these credentials
- Consider adding a check to prevent seeding in production environment
