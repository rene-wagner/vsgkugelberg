# Change Proposal: Add Department Model

## Summary
Add a Department model and API to manage the four sport departments of VSG Kugelberg e.V.: Badminton, Gymnastics, Table Tennis, and Volleyball. This feature enables the organization and presentation of sport departments on the club website with their descriptions and associated content.

## Motivation
The sports club has four distinct sport departments that need to be represented in the database and accessible via API. Each department requires:
- A unique identifier and URL-friendly slug
- A display name (e.g., "Badminton", "Volleyball")
- Short description for listing views and previews
- Long description for detailed department pages
- Timestamps for tracking creation and updates

This follows the same pattern as existing Category and Tag models but is specifically designed for the club's organizational structure.

## Scope

### In Scope
- **Data Model**: Department model in Prisma schema with all required fields
- **API Endpoints**: Complete CRUD API for managing departments
- **NestJS Module**: Departments module with controller, service, DTOs, and entities
- **Validation**: Input validation using class-validator decorators
- **Slug Generation**: Automatic slug generation from department names
- **Database Migration**: Prisma migration for the Department table

### Out of Scope
- Frontend UI components for department management
- Department-to-post or department-to-member relationships (future work)
- Department-specific features (schedules, rosters, etc.)
- Image/media upload for departments
- Multi-language support for descriptions

## Technical Approach
The implementation follows established patterns in the codebase:
1. Define the Department model in Prisma schema with auto-incrementing ID, name, slug, short/long descriptions, and timestamps
2. Create and apply Prisma migration
3. Generate NestJS resource using similar structure to Categories/Tags modules
4. Implement slug generation helper following the pattern in categories/tags
5. Add comprehensive validation rules for DTOs
6. Implement CRUD operations with proper error handling

## Dependencies
- Existing Prisma setup and PrismaService
- NestJS framework with validation pipe
- class-validator for DTO validation
- Established slug generation utilities (or create following existing pattern)

## Risks & Mitigations
- **Risk**: Slug generation conflicts if names are similar
  - **Mitigation**: Use existing slug generation utility that handles duplicates
- **Risk**: Data validation may allow invalid characters in names
  - **Mitigation**: Apply strict validation rules (alphanumeric, spaces, hyphens only)
- **Risk**: Missing uniqueness constraints could allow duplicate departments
  - **Mitigation**: Enforce unique constraints on name and slug at database level

## Success Criteria
- [ ] Department model exists in Prisma schema with all required fields
- [ ] Database migration successfully creates Department table with indexes
- [ ] All CRUD endpoints are functional and return correct status codes
- [ ] Input validation prevents invalid data from being stored
- [ ] Slugs are automatically generated and guaranteed unique
- [ ] Error handling returns appropriate HTTP status codes (400, 404, 409)
- [ ] OpenSpec validation passes with `--strict` flag

## Related Changes
None - this is a new capability.

## Future Considerations
- Relationship between departments and posts (e.g., news filtered by department)
- Relationship between departments and users (e.g., department administrators)
- Department contact information and location details
- Department-specific pages with custom layouts
- Photo galleries and media for each department
