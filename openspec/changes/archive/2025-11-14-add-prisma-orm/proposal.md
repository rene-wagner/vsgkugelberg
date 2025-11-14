# Add Prisma ORM

## Summary

Integrate Prisma ORM into the API application to provide type-safe database access with PostgreSQL. This includes setting up Prisma Client, defining User and Post models with proper relationships, implementing secure password hashing, and establishing migration workflows.

## Motivation

The API currently lacks database persistence capabilities. Adding Prisma ORM will:
- Enable type-safe database operations with auto-completion
- Provide declarative schema management with migrations
- Support future features requiring user authentication and content management
- Establish patterns for secure password storage and data modeling

## Scope

**In Scope:**
- Install and configure Prisma ORM with PostgreSQL
- Define User model with username, email, and hashed password fields
- Define Post model with title, slug (indexed), content (markdown), and author relationship
- Set up password hashing using bcrypt
- Configure unique constraints on username and email
- Establish migration workflow with Prisma Migrate
- Integrate PrismaService with NestJS dependency injection
- Create initial migration for User and Post tables

**Out of Scope:**
- User registration/login endpoints (future work)
- Post CRUD API endpoints (future work)
- Authentication middleware (future work)
- Authorization/permissions system (future work)
- Password reset functionality (future work)
- Email verification (future work)

## Design Decisions

### Database Provider
- **Decision:** Use PostgreSQL
- **Rationale:** Production-ready, excellent TypeScript support via Prisma, supports advanced features like full-text search for future content search

### Password Storage
- **Decision:** Use bcrypt with salt rounds of 10
- **Rationale:** Industry standard for password hashing, resistant to rainbow table attacks, configurable work factor

### Markdown Storage
- **Decision:** Store markdown as TEXT in content field
- **Rationale:** Markdown is plain text, efficient storage, easily parsed in frontend, future-proof for rendering libraries

### Slug Implementation
- **Decision:** Store slug as indexed String field, require manual/automatic generation
- **Rationale:** Slugs need fast lookup for routing, indexed field improves query performance, separate from title allows customization

### NestJS Integration
- **Decision:** Use `nestjs-prisma` package for PrismaService
- **Rationale:** Provides proper NestJS lifecycle integration, enables global module pattern, handles connection management

## Implementation Notes

### Password Hashing
Passwords should be hashed before storing in the database using bcrypt. The application should never store plain-text passwords. The hashing should occur in the service layer, not at the database level.

### Slug Generation
The slug field should be derived from the title but can be customized. A utility function for slug generation (slugify) should be created. The slug must be URL-safe and lowercase.

### Migration Strategy
- Use Prisma Migrate for schema changes
- Commit migration files to version control
- Run migrations as part of deployment process
- Keep migrations sequential and never edit committed migrations

### Database URL Configuration
Store database connection string in `.env` file (not committed). Provide `.env.example` with placeholder values.

## Dependencies

### New Dependencies
- `@prisma/client` - Prisma Client for database queries
- `prisma` - Prisma CLI for migrations and schema management (dev dependency)
- `nestjs-prisma` - NestJS integration for Prisma
- `bcrypt` - Password hashing library
- `@types/bcrypt` - TypeScript types for bcrypt (dev dependency)

## Affected Specifications

**New Capabilities:**
- `data-model` - Database schema and models
- `password-security` - Password hashing and validation
- `content-management` - Post content with markdown support

**Modified Capabilities:**
- None (new functionality)

## Testing Considerations

- Verify Prisma Client generation works correctly
- Test database connection on application startup
- Validate schema constraints (unique username, unique email)
- Ensure password hashing occurs before storage
- Test slug index performance with sample queries
- Verify migrations run successfully on fresh database

## Rollout Plan

1. Install dependencies and initialize Prisma
2. Define schema models for User and Post
3. Create and run initial migration
4. Integrate PrismaService into NestJS AppModule
5. Create utility functions for password hashing and slug generation
6. Update documentation with database setup instructions

## Future Considerations

- Add full-text search on Post content and title
- Implement soft delete for Users and Posts
- Add created_at/updated_at timestamps to User model
- Consider adding Post categories/tags with many-to-many relationship
- Implement database seeding for development data
- Add post publishing workflow (draft/published status)
