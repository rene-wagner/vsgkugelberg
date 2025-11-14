# category-api Specification

## Purpose

Provide RESTful API endpoints for managing post categories, enabling content organization and discovery through hierarchical classification.

## ADDED Requirements

### Requirement: Category Module Structure

The API MUST provide a dedicated NestJS module for category management following standard resource organization patterns.

#### Scenario: Categories module registration

**Given** the NestJS application is initialized  
**When** the application bootstraps  
**Then** a CategoriesModule must be imported in AppModule  
**And** the module must declare CategoriesController  
**And** the module must provide CategoriesService  
**And** PrismaService must be available through the global PrismaModule

#### Scenario: Service dependency injection

**Given** the CategoriesController is instantiated  
**When** processing category requests  
**Then** CategoriesService must be injected via constructor  
**And** CategoriesService must have access to PrismaService

---

### Requirement: List Categories Endpoint

The API MUST expose an endpoint to retrieve all categories with post counts.

#### Scenario: Get all categories successfully

**Given** the database contains multiple category records  
**When** a GET request is made to `/categories`  
**Then** the response must have status 200  
**And** the response body must contain an array of category objects  
**And** each category must include: id, name, slug, description, createdAt, updatedAt  
**And** each category must include a `_count` object with `posts` field indicating number of associated posts

#### Scenario: Get all categories when database is empty

**Given** the database contains no category records  
**When** a GET request is made to `/categories`  
**Then** the response must have status 200  
**And** the response body must contain an empty array

---

### Requirement: Get Single Category by Slug Endpoint

The API MUST expose an endpoint to retrieve a specific category by its URL slug with associated posts.

#### Scenario: Get category by valid slug

**Given** a category with slug "news" exists  
**When** a GET request is made to `/categories/news`  
**Then** the response must have status 200  
**And** the response must include: id, name, slug, description, createdAt, updatedAt  
**And** the response must include a `posts` array with all posts in this category  
**And** each post must include: id, title, slug, published, createdAt, author data

#### Scenario: Get category by non-existent slug

**Given** no category with slug "nonexistent" exists  
**When** a GET request is made to `/categories/nonexistent`  
**Then** the response must have status 404  
**And** the response body must contain an error message indicating category not found

---

### Requirement: Create Category Endpoint

The API MUST expose an endpoint to create new category records with automatic slug generation.

#### Scenario: Create category with valid data

**Given** valid category data with name "News" and description  
**When** a POST request is made to `/categories` with the data  
**Then** the response must have status 201  
**And** a slug "news" must be automatically generated from the name  
**And** the response must include: id, name, slug, description, createdAt, updatedAt

#### Scenario: Create category with missing required fields

**Given** category data without the required `name` field  
**When** a POST request is made to `/categories`  
**Then** the response must have status 400  
**And** the response body must contain validation error details

#### Scenario: Create category with duplicate name

**Given** a category with name "News" already exists  
**When** a POST request is made to create another category named "News"  
**Then** the response must have status 409  
**And** the error message must indicate duplicate category name

#### Scenario: Create category with minimal data

**Given** category data with only name "Events" (no description)  
**When** a POST request is made to `/categories`  
**Then** the response must have status 201  
**And** the description field must be null  
**And** a slug "events" must be generated

---

### Requirement: Update Category Endpoint

The API MUST expose an endpoint to update existing category records with slug regeneration.

#### Scenario: Update category name

**Given** a category with slug "old-name" exists  
**When** a PATCH request is made to `/categories/old-name` with new name "New Name"  
**Then** the response must have status 200  
**And** the slug must be regenerated to "new-name"  
**And** all post associations must remain intact

#### Scenario: Update category description only

**Given** a category with slug "news" exists  
**When** a PATCH request is made to `/categories/news` with new description only  
**Then** the response must have status 200  
**And** the slug must remain "news"  
**And** the description must be updated

#### Scenario: Update category with duplicate name

**Given** categories "News" and "Events" exist  
**When** a PATCH request is made to update "Events" name to "News"  
**Then** the response must have status 409  
**And** the error message must indicate duplicate category name

#### Scenario: Update non-existent category

**Given** no category with slug "missing" exists  
**When** a PATCH request is made to `/categories/missing`  
**Then** the response must have status 404  
**And** the error message must indicate category not found

---

### Requirement: Delete Category Endpoint

The API MUST expose an endpoint to delete category records with referential integrity checks.

#### Scenario: Delete category with no posts

**Given** a category with slug "unused" has zero associated posts  
**When** a DELETE request is made to `/categories/unused`  
**Then** the response must have status 200  
**And** the category must be removed from the database

#### Scenario: Delete category with associated posts

**Given** a category with slug "news" has 15 associated posts  
**When** a DELETE request is made to `/categories/news`  
**Then** the response must have status 409  
**And** the error message must indicate the category cannot be deleted due to associated posts  
**And** the message must include the count of associated posts

#### Scenario: Delete non-existent category

**Given** no category with slug "missing" exists  
**When** a DELETE request is made to `/categories/missing`  
**Then** the response must have status 404  
**And** the error message must indicate category not found

---

### Requirement: Data Transfer Objects

The API MUST define DTOs with validation rules for category operations.

#### Scenario: CreateCategoryDto validation

**Given** the CreateCategoryDto definition  
**When** validating category creation data  
**Then** the `name` field must be required, type string, length 1-100 characters  
**And** the `description` field must be optional, type string, max 500 characters  
**And** validation must use class-validator decorators

#### Scenario: UpdateCategoryDto validation

**Given** the UpdateCategoryDto definition  
**When** validating category update data  
**Then** the `name` field must be optional, type string, length 1-100 characters  
**And** the `description` field must be optional, type string, max 500 characters  
**And** validation must use class-validator decorators

---

### Requirement: Slug Generation and Uniqueness

The API MUST generate unique URL-safe slugs for categories automatically.

#### Scenario: Generate slug from category name

**Given** a category with name "Sports News"  
**When** creating the category  
**Then** the slug must be generated as "sports-news"  
**And** the slug must use the existing slugify utility

#### Scenario: Handle duplicate slugs

**Given** a category with slug "news" already exists  
**When** creating a new category with name "News"  
**Then** a unique slug "news-2" must be generated  
**And** the counter must increment for subsequent duplicates

#### Scenario: Regenerate slug on name update

**Given** a category with slug "old-name"  
**When** updating the category name to "New Name"  
**Then** a new slug "new-name" must be generated  
**And** uniqueness must be checked and counter applied if needed
