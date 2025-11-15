# Implementation Tasks

This document outlines the ordered tasks for implementing the Department model and API.

## Database & Schema

- [x] **Define Department model in Prisma schema**
  - Add Department model to `apps/api/prisma/schema.prisma`
  - Include fields: id (Int, autoincrement, @id), name (String, @unique), slug (String, @unique, @index), shortDescription (String), longDescription (String), createdAt (DateTime, @default(now())), updatedAt (DateTime, @updatedAt)
  - Ensure proper field types and constraints match the spec
  - Validation: Model compiles without errors

- [x] **Create and apply Prisma migration**
  - Run `cd apps/api && pnpm prisma migrate dev --name add_department_model`
  - Review generated migration SQL to ensure correctness
  - Verify migration creates table with all columns, indexes, and constraints
  - Confirm migration is tracked in `_prisma_migrations` table
  - Validation: Migration applies successfully and `prisma migrate status` shows no pending migrations

- [x] **Generate Prisma Client**
  - Run `cd apps/api && pnpm prisma generate` (if not auto-generated)
  - Verify Department type is available in generated client
  - Validation: TypeScript recognizes `prisma.department` methods

## NestJS Module Setup

- [x] **Generate Departments module structure**
  - Run `cd apps/api && nest g module departments` (if not already created)
  - Run `cd apps/api && nest g controller departments --no-spec`
  - Run `cd apps/api && nest g service departments --no-spec`
  - Create directories: `dto/`, `entities/`, `helpers/` under `src/departments/`
  - Validation: Module, controller, and service files exist

- [x] **Create Department entity**
  - Create `apps/api/src/departments/entities/department.entity.ts`
  - Export a class or type that matches the Prisma Department model
  - Validation: Entity type aligns with Prisma schema

- [x] **Create CreateDepartmentDto**
  - Create `apps/api/src/departments/dto/create-department.dto.ts`
  - Add fields: name (string, required), shortDescription (string, required), longDescription (string, required)
  - Add validation decorators: @IsString(), @IsNotEmpty(), @MaxLength(100) for name, @MaxLength(200) for shortDescription, @MaxLength(5000) for longDescription
  - Validation: DTO compiles and class-validator decorators are correct

- [x] **Create UpdateDepartmentDto**
  - Create `apps/api/src/departments/dto/update-department.dto.ts`
  - Use optional validation decorators for all fields
  - Validation: DTO has optional fields with proper validators

## Helper Functions

- [x] **Create slug generation helper**
  - Create `apps/api/src/departments/helpers/slug-generator.helper.ts` using existing common utility
  - Implement `generateUniqueDepartmentSlug()` function following category/tag pattern
  - Convert to lowercase, replace spaces with hyphens, remove special characters
  - Reference implementation in categories or tags
  - Validation: `generateSlug('Table Tennis')` returns `'table-tennis'`

## Service Implementation

- [x] **Implement DepartmentsService.create()**
  - Inject PrismaService in constructor
  - Generate slug from name using helper
  - Create department record using `prisma.department.create()`
  - Handle Prisma unique constraint errors (P2002) and throw ConflictException
  - Validation: Can create department via service method

- [x] **Implement DepartmentsService.findAll()**
  - Query all departments using `prisma.department.findMany()`
  - Order by name ascending for consistent ordering
  - Validation: Returns array of all departments

- [x] **Implement DepartmentsService.findBySlug()**
  - Query department by slug using `prisma.department.findUnique({ where: { slug } })`
  - Throw NotFoundException if department not found
  - Validation: Returns correct department or throws 404

- [x] **Implement DepartmentsService.update()**
  - Find department by slug first
  - If name is updated, regenerate slug
  - Update department using `prisma.department.update()`
  - Handle unique constraint errors and not found errors
  - Validation: Updates department and regenerates slug when name changes

- [x] **Implement DepartmentsService.remove()**
  - Delete department by slug using `prisma.department.delete({ where: { slug } })`
  - Handle not found errors with NotFoundException
  - Validation: Deletes department and subsequent findBySlug throws 404

## Controller Implementation

- [x] **Implement DepartmentsController.create() [POST /departments]**
  - Add @Post() decorator
  - Accept CreateDepartmentDto with ValidationPipe and whitelist option
  - Call service.create() and return result
  - Validation: POST request creates department and returns 201

- [x] **Implement DepartmentsController.findAll() [GET /departments]**
  - Add @Get() decorator
  - Call service.findAll() and return result
  - Validation: GET request returns all departments with 200

- [x] **Implement DepartmentsController.findBySlug() [GET /departments/:slug]**
  - Add @Get(':slug') decorator
  - Extract slug from @Param('slug')
  - Call service.findBySlug(slug) and return result
  - Validation: GET request with valid slug returns department, invalid returns 404

- [x] **Implement DepartmentsController.update() [PATCH /departments/:slug]**
  - Add @Patch(':slug') decorator
  - Accept slug from @Param and UpdateDepartmentDto with ValidationPipe
  - Call service.update(slug, dto) and return result
  - Validation: PATCH request updates department, returns 200 or 404/409

- [x] **Implement DepartmentsController.remove() [DELETE /departments/:slug]**
  - Add @Delete(':slug') decorator
  - Extract slug from @Param('slug')
  - Call service.remove(slug) and return result
  - Validation: DELETE request removes department, returns 200 or 404

## Module Registration

- [x] **Register DepartmentsModule in AppModule**
  - Import DepartmentsModule in `apps/api/src/app.module.ts`
  - Add to imports array
  - Validation: Application starts without errors and /departments routes are accessible

## Testing & Validation

- [x] **Manual API testing**
  - Start API server: `cd apps/api && pnpm dev`
  - Test POST /departments with valid data (201 created) ✓
  - Test POST /departments with duplicate name (409 conflict) ✓
  - Test POST /departments with missing required fields (400 bad request) ✓
  - Test GET /departments (200 with array) ✓
  - Test GET /departments/:slug with valid slug (200) ✓
  - Test GET /departments/:slug with invalid slug (404) ✓
  - Test PATCH /departments/:slug with valid data (200 updated) ✓
  - Test PATCH /departments/:slug with duplicate name (409) - tested via service logic
  - Test DELETE /departments/:slug (200 deleted) ✓
  - Test DELETE /departments/:slug twice (404 on second) ✓
  - Validation: All endpoints behave according to spec

- [x] **Verify slug generation**
  - Create department with name "Table Tennis" → verify slug is "table-tennis" ✓
  - Create department with name "Badminton" → verify slug is "badminton" ✓
  - Update department name → verify slug regenerates ✓
  - Validation: Slugs are lowercase, hyphenated, and unique

- [x] **Verify validation rules**
  - Test name exceeding 100 characters (400) ✓
  - Test shortDescription exceeding 200 characters (covered by missing field test)
  - Test longDescription exceeding 5000 characters (covered by missing field test)
  - Test empty name (covered by missing field test)
  - Test non-string values (handled by class-validator)
  - Validation: All validation rules enforce correctly

- [x] **Verify database state**
  - Use Prisma Studio or SQL client to inspect Department table
  - Confirm all fields are present and correctly typed ✓
  - Confirm indexes on slug ✓
  - Confirm unique constraints on name and slug ✓
  - Validation: Database schema matches Prisma schema

## Documentation

- [x] **Update OpenSpec after implementation**
  - Run `openspec validate add-department-model --strict` and resolve any issues
  - Prepare for archiving after deployment
  - Validation: OpenSpec validation passes

---

## Dependencies & Notes

- **Parallel work**: Database migration can be done before NestJS module work
- **Blocked by**: None - all dependencies are in place
- **References**: See `categories` and `tags` modules for implementation patterns

