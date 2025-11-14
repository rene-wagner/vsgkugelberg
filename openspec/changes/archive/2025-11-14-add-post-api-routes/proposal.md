# Proposal: Add Post API Routes

## Summary
Implement RESTful API endpoints for post CRUD operations (Create, Read, Update, Delete) in the NestJS API application. This change introduces a dedicated posts module with controller, service, and DTOs to manage post entities through the existing Prisma database connection, including automatic slug generation from titles.

## Motivation
With the database connection and Post model already established via Prisma ORM, and user API endpoints implemented, the API now needs endpoints to manage blog posts. This enables content management functionality for the sports club website, allowing creation, editing, and publishing of articles and news.

## Goals
- Implement GET /posts (list all posts with optional published filter)
- Implement GET /posts/:slug (get single post by slug)
- Implement POST /posts (create new post with auto-generated slug)
- Implement PATCH /posts/:slug (update existing post, regenerate slug if title changes)
- Implement DELETE /posts/:slug (delete post)
- Use DTOs for request validation
- Return appropriate HTTP status codes
- Automatically generate URL-safe slugs from post titles
- Include author information in responses (username, email - no password)
- Support filtering published vs draft posts
- Use slugs as the primary identifier in all routes (not numeric IDs)

## Non-Goals
- Authentication/authorization (to be addressed separately)
- Rich text editor integration (frontend concern)
- Image/media upload for posts (separate feature)
- Post categories or tags (keep initial implementation simple)
- Comments functionality
- Post versioning or revision history

## Affected Components
- `apps/api/src/` - New posts module with controller, service, and DTOs
- `apps/api/src/app.module.ts` - Register PostsModule
- Prisma Post model - Already exists, no schema changes needed
- `apps/api/src/common/utils/slugify.util.ts` - Already exists, will be used

## Dependencies
- Existing Prisma setup (data-model spec)
- Existing slugify utility (content-management spec)
- User model and relationship (data-model spec)
- NestJS common decorators and validation pipes

## Alternatives Considered
1. **Using numeric IDs in URLs** - Less SEO-friendly and less readable. Decided to use slugs exclusively for all single-resource operations.
2. **Supporting both ID and slug lookups** - Adds unnecessary complexity and multiple ways to do the same thing. Slug-only approach is simpler and more consistent.
3. **Manual slug input** - Error-prone and requires additional validation. Auto-generation from title is more user-friendly.
4. **Including full post content in list endpoints** - Would slow down list operations. Better to return summaries and require fetching individual posts for full content.
5. **Using PUT instead of PATCH** - PATCH is more appropriate for partial updates, which is the expected use case.

## Related Changes
- Builds upon user-api spec (uses User relationship)
- Leverages existing slugify utility from content-management spec

## Migration Strategy
Not applicable - this is a new feature with no breaking changes to existing functionality.
