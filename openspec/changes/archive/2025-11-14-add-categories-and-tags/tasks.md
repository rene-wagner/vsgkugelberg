# Tasks

## Implementation Order

### 1. Update Prisma Schema [x]
**Owner:** Backend Team  
**Estimated Time:** 30 minutes  
**Dependencies:** None

- Add Category model with fields: id, name, slug, description?, createdAt, updatedAt, posts[]
- Add Tag model with fields: id, name, slug, createdAt, updatedAt, posts[]
- Add categories[] and tags[] fields to Post model
- Add unique constraints on name and slug for both models
- Add indexes on slug fields
- Verify implicit many-to-many relations are properly defined

**Validation:**
- Schema compiles without errors
- Relations are properly typed
- Unique constraints and indexes are in place

---

### 2. Generate and Apply Prisma Migration [x]
**Owner:** Backend Team  
**Estimated Time:** 15 minutes  
**Dependencies:** Task 1 (Schema updated)

- Run `prisma migrate dev --name add-categories-and-tags`
- Verify migration creates Category, Tag, and join tables
- Confirm no data loss (existing posts unaffected)
- Update Prisma Client

**Validation:**
- Migration runs successfully
- All new tables created in database
- Prisma Client regenerated with new types

---

### 3. Create Category Module Structure [x]
**Owner:** Backend Team  
**Estimated Time:** 1.5 hours  
**Dependencies:** Task 2 (Migration applied)

- Create `apps/api/src/categories/` directory
- Create CreateCategoryDto (name: required string 1-100 chars, description: optional string max 500 chars)
- Create UpdateCategoryDto (name: optional string 1-100 chars, description: optional string max 500 chars)
- Create category.entity.ts interface
- Create slug-generator.helper.ts (or reuse existing slugify utility)
- Create CategoriesService with methods: findAll, findBySlug, create, update, remove
- Create CategoriesController with endpoints: GET /, GET /:slug, POST /, PATCH /:slug, DELETE /:slug
- Create CategoriesModule
- Register CategoriesModule in AppModule

**Validation:**
- All files compile without errors
- Module registers successfully in AppModule
- Slug generation helper works correctly

---

### 4. Implement Category CRUD Operations [x]
**Owner:** Backend Team  
**Estimated Time:** 2 hours  
**Dependencies:** Task 3 (Category module structure)

- Implement CategoriesService.findAll() with _count for posts
- Implement CategoriesService.findBySlug() with posts include
- Implement CategoriesService.create() with slug generation and duplicate checking
- Implement CategoriesService.update() with slug regeneration on name change
- Implement CategoriesService.remove() with post count check (409 if posts exist)
- Handle Prisma errors (P2002 for unique constraint, P2025 for not found)
- Add ValidationPipe to controller endpoints

**Validation:**
- All CRUD operations work correctly
- Slug generation handles duplicates
- Delete constraint properly enforced
- Error handling returns appropriate status codes

---

### 5. Create Tag Module Structure [x]
**Owner:** Backend Team  
**Estimated Time:** 1 hour  
**Dependencies:** Task 2 (Migration applied)

- Create `apps/api/src/tags/` directory
- Create CreateTagDto (name: required string 1-50 chars)
- Create UpdateTagDto (name: optional string 1-50 chars)
- Create tag.entity.ts interface
- Create slug-generator.helper.ts (or reuse existing slugify utility)
- Create TagsService with methods: findAll, findBySlug, create, update, remove
- Create TagsController with endpoints: GET /, GET /:slug, POST /, PATCH /:slug, DELETE /:slug
- Create TagsModule
- Register TagsModule in AppModule

**Validation:**
- All files compile without errors
- Module registers successfully in AppModule
- Slug generation helper works correctly

---

### 6. Implement Tag CRUD Operations [x]
**Owner:** Backend Team  
**Estimated Time:** 1.5 hours  
**Dependencies:** Task 5 (Tag module structure)

- Implement TagsService.findAll() with _count for posts
- Implement TagsService.findBySlug() with posts include
- Implement TagsService.create() with slug generation and duplicate checking
- Implement TagsService.update() with slug regeneration on name change
- Implement TagsService.remove() with post count check (409 if posts exist)
- Handle Prisma errors (P2002 for unique constraint, P2025 for not found)
- Add ValidationPipe to controller endpoints

**Validation:**
- All CRUD operations work correctly
- Slug generation handles duplicates
- Delete constraint properly enforced
- Error handling returns appropriate status codes

---

### 7. Update Post DTOs for Taxonomy [x]
**Owner:** Backend Team  
**Estimated Time:** 30 minutes  
**Dependencies:** Task 2 (Migration applied)

- Add optional `categoryIds` field to CreatePostDto (type: number[], validate each is positive int)
- Add optional `tagIds` field to CreatePostDto (type: number[], validate each is positive int)
- Add optional `categoryIds` field to UpdatePostDto (type: number[], validate each is positive int)
- Add optional `tagIds` field to UpdatePostDto (type: number[], validate each is positive int)
- Use @IsOptional(), @IsArray(), @IsInt({ each: true }), @Min(1, { each: true }) decorators

**Validation:**
- DTOs compile without errors
- Validation decorators properly applied
- Array validation works correctly

---

### 8. Update PostsService for Taxonomy [x]
**Owner:** Backend Team  
**Estimated Time:** 2.5 hours  
**Dependencies:** Task 7 (DTOs updated), Task 3 (Category module), Task 5 (Tag module)

- Update findAll() to accept optional category and tag query params (as slugs)
- Add category/tag filtering logic using Prisma `some` queries with slug matching
- Update findAll() to include categories and tags in response
- Update findBySlug() to include categories and tags
- Update create() to accept categoryIds and tagIds, validate they exist
- Implement connect logic for categories and tags in create()
- Update update() to accept categoryIds and tagIds
- Implement set logic (replace all) for categories and tags in update()
- Add error handling for non-existent category/tag IDs (404 responses)

**Validation:**
- All service methods include taxonomy data
- Filtering by category/tag works correctly
- Creating/updating with taxonomy associations works
- Non-existent ID validation returns 404
- Empty arrays properly clear associations

---

### 9. Update PostsController for Taxonomy Filtering [x]
**Owner:** Backend Team  
**Estimated Time:** 30 minutes  
**Dependencies:** Task 8 (PostsService updated)

- Add @Query('category') category?: string to findAll handler
- Add @Query('tag') tag?: string to findAll handler
- Pass slug query params directly to service
- Return empty array if category/tag slug not found (no error)

**Validation:**
- Query parameters properly parsed
- Filtering works with single or combined params
- Non-existent slugs return empty array gracefully

---

### 10. Manual API Testing [x]
**Owner:** Backend Team  
**Estimated Time:** 1.5 hours  
**Dependencies:** All previous tasks

Test categories:
- POST /categories - Create categories "News", "Events", "Training"
- GET /categories - List all with post counts
- GET /categories/news - Get single category with posts
- PATCH /categories/news - Update name/description
- DELETE /categories/unused - Delete category without posts
- DELETE /categories/news - Verify 409 if posts exist

Test tags:
- POST /tags - Create tags "handball", "youth", "tournament"
- GET /tags - List all with post counts
- GET /tags/handball - Get single tag with posts
- PATCH /tags/handball - Update name
- DELETE /tags/unused - Delete tag without posts
- DELETE /tags/handball - Verify 409 if posts exist

Test posts with taxonomy:
- POST /posts - Create post with categoryIds [1] and tagIds [1, 2]
- GET /posts - Verify categories/tags included
- GET /posts?category=news - Filter by category slug
- GET /posts?tag=handball - Filter by tag slug
- GET /posts?category=nonexistent - Verify empty array for non-existent slug
- GET /posts/:slug - Verify categories/tags included
- PATCH /posts/:slug - Update to add/remove categories/tags
- POST /posts - Verify 404 for invalid categoryId/tagId

**Validation:**
- All endpoints return expected status codes
- Response bodies match expected structure
- Filtering works correctly
- Associations properly created/updated/removed
- Error handling is appropriate

---

### 11. Update Documentation [x]
**Owner:** Backend Team  
**Estimated Time:** 30 minutes  
**Dependencies:** Task 10 (Testing complete)

- Document new endpoints in API documentation
- Update data model diagrams if applicable
- Note the many-to-many relation pattern
- Document query parameter options for filtering
- Add examples of creating posts with categories/tags

**Validation:**
- Documentation accurately reflects implementation
- Examples are correct and tested

---

## Total Estimated Time
- Schema and migration: 45 minutes
- Category module: 3.5 hours
- Tag module: 3.5 hours
- Post updates: 3.5 hours
- Testing and documentation: 2 hours
- **Total: ~13 hours** (approximately 1.5-2 days)

## Parallel Work Opportunities
- Tasks 3 and 5 can be done in parallel (Category and Tag modules are independent)
- Tasks 4 and 6 can be done in parallel (Category and Tag CRUD operations are independent)
- Task 7 can start as soon as Task 2 is complete
