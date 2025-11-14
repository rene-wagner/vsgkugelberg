# Tasks

## Implementation Order

### 1. Create Post DTOs
**Owner:** Backend Team  
**Estimated Time:** 45 minutes  
**Dependencies:** None

- [x] Create `apps/api/src/posts/dto/create-post.dto.ts`
  - Define title (required string), content (optional string), published (optional boolean), authorId (required number)
  - Add class-validator decorators: @IsString(), @IsOptional(), @IsBoolean(), @IsInt()
- [x] Create `apps/api/src/posts/dto/update-post.dto.ts`
  - Define optional fields for title, content, published (all optional)
  - Exclude authorId from updates (immutable after creation)
- [x] Verify DTO validation with unit tests or manual testing

**Validation:** 
- DTOs should compile without TypeScript errors
- Import statements should reference class-validator correctly
- All decorators properly applied

---

### 2. Create Post Entity Interface
**Owner:** Backend Team  
**Estimated Time:** 15 minutes  
**Dependencies:** None

- [x] Create `apps/api/src/posts/entities/post.entity.ts`
- [x] Define Post interface matching Prisma Post model (or export from @prisma/client)
- [x] Include author relation type

**Validation:**
- Entity compiles without errors
- Fields match Prisma schema
- Author relation properly typed

---

### 3. Implement Slug Generation Helper
**Owner:** Backend Team  
**Estimated Time:** 30 minutes  
**Dependencies:** None

- [x] Create `apps/api/src/posts/helpers/slug-generator.helper.ts` (or use existing slugify utility)
- [x] Implement logic to:
  - Generate slug from title using slugify utility
  - Check for duplicate slugs in database
  - Append counter/timestamp if duplicate detected
  - Return unique slug

**Validation:**
- Helper function compiles without errors
- Unit tests for slug generation and uniqueness logic
- Edge cases handled (empty titles, special characters, etc.)

---

### 4. Implement PostsService
**Owner:** Backend Team  
**Estimated Time:** 2 hours  
**Dependencies:** Task 1 (DTOs), Task 3 (Slug helper)

- [x] Create `apps/api/src/posts/posts.service.ts`
- [x] Inject PrismaService
- [x] Implement methods:
  - `findAll(published?: boolean)` - Returns all posts with optional published filter, includes author
  - `findBySlug(slug: string)` - Returns single post by slug or throws NotFoundException, includes author
  - `create(createPostDto: CreatePostDto)` - Generate slug, create post, handle errors, include author in response
  - `update(slug: string, updatePostDto: UpdatePostDto)` - Find by slug, regenerate slug if title changes, update post, handle errors, include author
  - `remove(slug: string)` - Find and delete post by slug or throw NotFoundException
- [x] Handle Prisma errors (P2002 for unique constraint violations, P2003 for foreign key violations, P2025 for not found)
- [x] Use Prisma include to fetch author data with password excluded

**Validation:**
- Service compiles without errors
- All methods have proper return types
- Error handling for database constraints is in place
- Slug generation integrated correctly
- Slug-based lookups work correctly

---

### 5. Implement PostsController
**Owner:** Backend Team  
**Estimated Time:** 45 minutes  
**Dependencies:** Task 2 (Entity), Task 4 (Service)

- [x] Create `apps/api/src/posts/posts.controller.ts`
- [x] Inject PostsService
- [x] Implement route handlers:
  - `@Get()` findAll(@Query('published') published?: string)
  - `@Get(':slug')` findBySlug(@Param('slug') slug: string)
  - `@Post()` create(@Body() createPostDto: CreatePostDto)
  - `@Patch(':slug')` update(@Param('slug') slug: string, @Body() updatePostDto: UpdatePostDto)
  - `@Delete(':slug')` remove(@Param('slug') slug: string)
- [x] Add ValidationPipe for automatic DTO validation
- [x] Handle query parameter conversion for published filter

**Validation:**
- Controller compiles without errors
- All routes have correct decorators
- Parameter types are correct
- Query parameter handling works
- Slug parameter properly captured

---

### 6. Create PostsModule
**Owner:** Backend Team  
**Estimated Time:** 15 minutes  
**Dependencies:** Task 4 (Service), Task 5 (Controller)

- [x] Create `apps/api/src/posts/posts.module.ts`
- [x] Declare PostsController in controllers array
- [x] Provide PostsService in providers array
- [x] PrismaModule is already global, no need to import

**Validation:**
- Module compiles without errors
- All imports are correct

---

### 7. Register PostsModule in AppModule
**Owner:** Backend Team  
**Estimated Time:** 5 minutes  
**Dependencies:** Task 6 (PostsModule)

- [x] Open `apps/api/src/app.module.ts`
- [x] Add PostsModule to imports array

**Validation:**
- Application starts without errors
- Module registration is visible in application logs

---

### 8. Manual API Testing
**Owner:** Backend Team  
**Estimated Time:** 45 minutes  
**Dependencies:** Task 7 (Module registration)

- [x] Start the API server (`pnpm --filter=api dev`)
- [x] Create test user first if needed
- [x] Test each endpoint with curl or Postman:
  - POST /posts - Create a post (verify slug generation)
  - GET /posts - List all posts
  - GET /posts?published=true - List published posts
  - GET /posts?published=false - List draft posts
  - GET /posts/:slug - Get specific post by slug
  - PATCH /posts/:slug - Update post (test slug regeneration when title changes)
  - DELETE /posts/:slug - Delete post
- [x] Verify error responses (404, 400)
- [x] Confirm author data is included with password excluded
- [x] Test duplicate slug handling
- [x] Test foreign key constraint (invalid authorId)
- [x] Verify slug changes are reflected in URLs after title updates

**Validation:**
- All endpoints return expected status codes
- Response bodies match expected structure
- Slug generation works correctly
- Slug uniqueness is enforced
- Author data properly included
- Error handling is appropriate
- Slug-based routing works correctly

---

### 9. Update Project Documentation
**Owner:** Backend Team  
**Estimated Time:** 15 minutes  
**Dependencies:** Task 8 (Testing complete)

- [x] Add posts API routes to README if applicable
- [x] Document available endpoints and their usage
- [x] Note slug generation behavior
- [x] Note that authentication is not yet implemented

**Implementation Notes:**
- All 5 post endpoints successfully implemented with slug-based routing
- Slug generation handles duplicates by appending counter (-2, -3, etc.)
- Author data included in responses with password field excluded
- Published filter works correctly (true/false query parameter)
- Error handling includes 404 for missing posts/authors, 400 for validation errors
- Slug regenerates automatically when title changes via PATCH

**Validation:**
- Documentation is clear and accurate

---

## Parallelizable Work
- Tasks 1, 2, and 3 can be done in parallel
- Task 8 can happen alongside Task 9

## Optional Future Enhancements
- Add pagination to GET /posts
- Add filtering/search capabilities (by author, date range, title/content search)
- Add sorting options
- Add integration tests
- Add Swagger/OpenAPI documentation decorators
- Add post preview/excerpt functionality
- Add featured image support
