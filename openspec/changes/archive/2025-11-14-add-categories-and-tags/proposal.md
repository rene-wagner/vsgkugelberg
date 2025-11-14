# Proposal: Add Categories and Tags to Posts

## Why

Posts need a taxonomy system to enable content organization and discovery. Categories provide hierarchical content classification (e.g., "News", "Events", "Training"), while tags enable flexible cross-cutting labeling (e.g., "youth", "tournament", "handball"). This supports:

- **Content Discovery:** Users can browse posts by category or find related content through tags
- **Editorial Workflow:** Authors can organize content systematically using predefined categories
- **SEO:** Category and tag pages improve search engine indexing and site structure
- **User Experience:** Visitors can filter and navigate content based on their interests

Without this taxonomy system, all posts appear in a flat list, making it difficult to organize and find relevant content as the site grows.

## What Changes

This change introduces two new models (Category and Tag) with many-to-many relationships to Post, plus CRUD API endpoints for managing them:

### Data Model Changes
- Add `Category` model with id, name, slug, description
- Add `Tag` model with id, name, slug
- Establish implicit many-to-many relations between Post and Category
- Establish implicit many-to-many relations between Post and Tag
- Update Post model to include categories and tags relations
- Create Prisma migration for new schema

### Post API Changes
- Update CreatePostDto to accept categoryIds[] and tagIds[]
- Update UpdatePostDto to accept categoryIds[] and tagIds[]
- Modify PostsService to handle category/tag associations on create/update
- Include categories and tags in post responses (findAll, findBySlug)
- Add query filters: `GET /posts?category=news` and `GET /posts?tag=handball` (using slugs)

### New Category API
- Create CategoriesModule, CategoriesController, CategoriesService
- Implement CRUD endpoints:
  - `POST /categories` - Create category
  - `GET /categories` - List all categories
  - `GET /categories/:slug` - Get category by slug (includes posts)
  - `PATCH /categories/:slug` - Update category
  - `DELETE /categories/:slug` - Delete category (only if no posts)
- Auto-generate slugs from category names
- Return post count with each category

### New Tag API
- Create TagsModule, TagsController, TagsService
- Implement CRUD endpoints:
  - `POST /tags` - Create tag
  - `GET /tags` - List all tags
  - `GET /tags/:slug` - Get tag by slug (includes posts)
  - `PATCH /tags/:slug` - Update tag
  - `DELETE /tags/:slug` - Delete tag (only if no posts)
- Auto-generate slugs from tag names
- Return post count with each tag

## Impact

- **Database:** New tables created (Category, Tag, join tables managed by Prisma)
- **API:** 10 new endpoints added, existing post endpoints modified
- **Migration:** Run `prisma migrate dev` to apply schema changes
- **Breaking Changes:** None - existing post endpoints remain backward compatible
- **Dependencies:** No new dependencies required

## Alternatives Considered

### Explicit Many-to-Many Relations
**Rejected** because we don't need extra metadata (like assignedAt, assignedBy) on the join tables. Implicit relations keep the schema simpler and queries more straightforward.

### Single Taxonomy Model
**Rejected** the idea of combining categories and tags into one "taxonomy" model with a "type" field. Keeping them separate provides clearer semantics and simpler queries.

### Nested Categories
**Deferred** the possibility of hierarchical categories (parent/child). Start with flat categories for simplicity; can add hierarchy later if needed.

## Open Questions

1. Should categories have a specific order/priority for display? → Start without ordering, can add later
2. Maximum number of tags per post? → No limit initially, can add validation if needed
3. Should we enforce unique category/tag names? → Yes, enforce uniqueness on name field
4. Can posts exist without categories/tags? → Yes, both are optional
