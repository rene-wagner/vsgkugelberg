# tag-api Specification

## Purpose

Provide RESTful API endpoints for managing post tags, enabling flexible cross-cutting content labeling and discovery.

## ADDED Requirements

### Requirement: Tag Module Structure

The API MUST provide a dedicated NestJS module for tag management following standard resource organization patterns.

#### Scenario: Tags module registration

**Given** the NestJS application is initialized  
**When** the application bootstraps  
**Then** a TagsModule must be imported in AppModule  
**And** the module must declare TagsController  
**And** the module must provide TagsService  
**And** PrismaService must be available through the global PrismaModule

#### Scenario: Service dependency injection

**Given** the TagsController is instantiated  
**When** processing tag requests  
**Then** TagsService must be injected via constructor  
**And** TagsService must have access to PrismaService

---

### Requirement: List Tags Endpoint

The API MUST expose an endpoint to retrieve all tags with post counts.

#### Scenario: Get all tags successfully

**Given** the database contains multiple tag records  
**When** a GET request is made to `/tags`  
**Then** the response must have status 200  
**And** the response body must contain an array of tag objects  
**And** each tag must include: id, name, slug, createdAt, updatedAt  
**And** each tag must include a `_count` object with `posts` field indicating number of associated posts

#### Scenario: Get all tags when database is empty

**Given** the database contains no tag records  
**When** a GET request is made to `/tags`  
**Then** the response must have status 200  
**And** the response body must contain an empty array

---

### Requirement: Get Single Tag by Slug Endpoint

The API MUST expose an endpoint to retrieve a specific tag by its URL slug with associated posts.

#### Scenario: Get tag by valid slug

**Given** a tag with slug "handball" exists  
**When** a GET request is made to `/tags/handball`  
**Then** the response must have status 200  
**And** the response must include: id, name, slug, createdAt, updatedAt  
**And** the response must include a `posts` array with all posts having this tag  
**And** each post must include: id, title, slug, published, createdAt, author data

#### Scenario: Get tag by non-existent slug

**Given** no tag with slug "nonexistent" exists  
**When** a GET request is made to `/tags/nonexistent`  
**Then** the response must have status 404  
**And** the response body must contain an error message indicating tag not found

---

### Requirement: Create Tag Endpoint

The API MUST expose an endpoint to create new tag records with automatic slug generation.

#### Scenario: Create tag with valid data

**Given** valid tag data with name "handball"  
**When** a POST request is made to `/tags` with the data  
**Then** the response must have status 201  
**And** a slug "handball" must be automatically generated from the name  
**And** the response must include: id, name, slug, createdAt, updatedAt

#### Scenario: Create tag with missing required fields

**Given** tag data without the required `name` field  
**When** a POST request is made to `/tags`  
**Then** the response must have status 400  
**And** the response body must contain validation error details

#### Scenario: Create tag with duplicate name

**Given** a tag with name "handball" already exists  
**When** a POST request is made to create another tag named "handball"  
**Then** the response must have status 409  
**And** the error message must indicate duplicate tag name

---

### Requirement: Update Tag Endpoint

The API MUST expose an endpoint to update existing tag records with slug regeneration.

#### Scenario: Update tag name

**Given** a tag with slug "old-tag" exists  
**When** a PATCH request is made to `/tags/old-tag` with new name "New Tag"  
**Then** the response must have status 200  
**And** the slug must be regenerated to "new-tag"  
**And** all post associations must remain intact

#### Scenario: Update tag with duplicate name

**Given** tags "handball" and "football" exist  
**When** a PATCH request is made to update "football" name to "handball"  
**Then** the response must have status 409  
**And** the error message must indicate duplicate tag name

#### Scenario: Update non-existent tag

**Given** no tag with slug "missing" exists  
**When** a PATCH request is made to `/tags/missing`  
**Then** the response must have status 404  
**And** the error message must indicate tag not found

---

### Requirement: Delete Tag Endpoint

The API MUST expose an endpoint to delete tag records with referential integrity checks.

#### Scenario: Delete tag with no posts

**Given** a tag with slug "unused" has zero associated posts  
**When** a DELETE request is made to `/tags/unused`  
**Then** the response must have status 200  
**And** the tag must be removed from the database

#### Scenario: Delete tag with associated posts

**Given** a tag with slug "handball" has 25 associated posts  
**When** a DELETE request is made to `/tags/handball`  
**Then** the response must have status 409  
**And** the error message must indicate the tag cannot be deleted due to associated posts  
**And** the message must include the count of associated posts

#### Scenario: Delete non-existent tag

**Given** no tag with slug "missing" exists  
**When** a DELETE request is made to `/tags/missing`  
**Then** the response must have status 404  
**And** the error message must indicate tag not found

---

### Requirement: Data Transfer Objects

The API MUST define DTOs with validation rules for tag operations.

#### Scenario: CreateTagDto validation

**Given** the CreateTagDto definition  
**When** validating tag creation data  
**Then** the `name` field must be required, type string, length 1-50 characters  
**And** validation must use class-validator decorators

#### Scenario: UpdateTagDto validation

**Given** the UpdateTagDto definition  
**When** validating tag update data  
**Then** the `name` field must be optional, type string, length 1-50 characters  
**And** validation must use class-validator decorators

---

### Requirement: Slug Generation and Uniqueness

The API MUST generate unique URL-safe slugs for tags automatically.

#### Scenario: Generate slug from tag name

**Given** a tag with name "Handball Team"  
**When** creating the tag  
**Then** the slug must be generated as "handball-team"  
**And** the slug must use the existing slugify utility

#### Scenario: Handle duplicate slugs

**Given** a tag with slug "handball" already exists  
**When** creating a new tag with name "Handball"  
**Then** a unique slug "handball-2" must be generated  
**And** the counter must increment for subsequent duplicates

#### Scenario: Regenerate slug on name update

**Given** a tag with slug "old-tag"  
**When** updating the tag name to "New Tag"  
**Then** a new slug "new-tag" must be generated  
**And** uniqueness must be checked and counter applied if needed
