# Tasks

## Implementation Order

### 1. Create User DTOs ✅
**Owner:** Backend Team  
**Estimated Time:** 30 minutes  
**Dependencies:** None

- [x] Create `apps/api/src/users/dto/create-user.dto.ts`
  - Define username, email, password fields
  - Add class-validator decorators: @IsString(), @IsEmail(), @MinLength(8)
- [x] Create `apps/api/src/users/dto/update-user.dto.ts`
  - Define optional fields with @IsOptional() decorator
- [x] Verify DTO validation with unit tests or manual testing

**Validation:** 
- [x] DTOs should compile without TypeScript errors
- [x] Import statements should reference class-validator correctly

---

### 2. Create User Entity Interface ✅
**Owner:** Backend Team  
**Estimated Time:** 15 minutes  
**Dependencies:** None

- [x] Create `apps/api/src/users/entities/user.entity.ts`
- [x] Define User interface matching Prisma User model (or export from @prisma/client)
- [x] Use TypeScript Omit to exclude password field

**Validation:**
- [x] Entity compiles without errors
- [x] Fields match Prisma schema

---

### 3. Implement UsersService ✅
**Owner:** Backend Team  
**Estimated Time:** 1 hour  
**Dependencies:** Task 1 (DTOs)

- [x] Create `apps/api/src/users/users.service.ts`
- [x] Inject PrismaService and PasswordService
- [x] Implement methods:
  - `findAll()` - Returns all users with password excluded
  - `findOne(id: number)` - Returns single user or throws NotFoundException
  - `create(createUserDto: CreateUserDto)` - Hash password, create user, handle unique constraint errors
  - `update(id: number, updateUserDto: UpdateUserDto)` - Hash password if present, update user, handle conflicts
  - `remove(id: number)` - Delete user or throw NotFoundException
- [x] Handle Prisma errors (P2002 for unique constraint violations, P2025 for not found)
- [x] Exclude password from all returned user objects using Prisma select

**Validation:**
- [x] Service compiles without errors
- [x] All methods have proper return types
- [x] Error handling for database constraints is in place

---

### 4. Implement UsersController ✅
**Owner:** Backend Team  
**Estimated Time:** 45 minutes  
**Dependencies:** Task 2 (Entity), Task 3 (Service)

- [x] Create `apps/api/src/users/users.controller.ts`
- [x] Inject UsersService
- [x] Implement route handlers:
  - `@Get()` findAll()
  - `@Get(':id')` findOne(@Param('id') id: string)
  - `@Post()` create(@Body() createUserDto: CreateUserDto)
  - `@Patch(':id')` update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto)
  - `@Delete(':id')` remove(@Param('id') id: string)
- [x] Add ValidationPipe for automatic DTO validation
- [x] Convert string ID params to numbers using ParseIntPipe

**Validation:**
- [x] Controller compiles without errors
- [x] All routes have correct decorators
- [x] Parameter types are correct

---

### 5. Create UsersModule ✅
**Owner:** Backend Team  
**Estimated Time:** 15 minutes  
**Dependencies:** Task 3 (Service), Task 4 (Controller)

- [x] Create `apps/api/src/users/users.module.ts`
- [x] Declare UsersController in controllers array
- [x] Provide UsersService and PasswordService in providers array
- [x] PrismaModule is already global, no need to import

**Validation:**
- [x] Module compiles without errors
- [x] All imports are correct

---

### 6. Register UsersModule in AppModule ✅
**Owner:** Backend Team  
**Estimated Time:** 5 minutes  
**Dependencies:** Task 5 (UsersModule)

- [x] Open `apps/api/src/app.module.ts`
- [x] Add UsersModule to imports array

**Validation:**
- [x] Application starts without errors
- [x] Module registration is visible in application logs

---

### 7. Manual API Testing ✅
**Owner:** Backend Team  
**Estimated Time:** 30 minutes  
**Dependencies:** Task 6 (Module registration)

- [x] Start the API server (`pnpm --filter=api dev`)
- [x] Test each endpoint with curl:
  - POST /users - Create a user ✅
  - GET /users - List users ✅
  - GET /users/:id - Get specific user ✅
  - PATCH /users/:id - Update user ✅
  - DELETE /users/:id - Delete user ✅
- [x] Verify error responses (404, 400, 409) ✅
- [x] Confirm password is never returned in responses ✅
- [x] Test unique constraint violations ✅

**Validation:**
- [x] All endpoints return expected status codes
- [x] Response bodies match expected structure
- [x] Password hashing works correctly
- [x] Error handling is appropriate

---

### 8. Update Project Documentation ✅
**Owner:** Backend Team  
**Estimated Time:** 15 minutes  
**Dependencies:** Task 7 (Testing complete)

- [x] Implementation complete and tested
- [x] All API routes functional

**Validation:**
- [x] All tasks completed successfully

---

## Parallelizable Work
- Tasks 1 and 2 can be done in parallel
- Task 7 can happen alongside Task 8

## Optional Future Enhancements
- Add pagination to GET /users
- Add filtering/search capabilities
- Add integration tests
- Add Swagger/OpenAPI documentation decorators
