# Post API

## ADDED Requirements

### Requirement: Post Module Structure

The API MUST provide a dedicated NestJS module for post management following standard resource organization patterns.

#### Scenario: Posts module registration

**Given** the NestJS application is initialized  
**When** the application bootstraps  
**Then** a PostsModule must be imported in AppModule  
**And** the module must declare PostsController  
**And** the module must provide PostsService  
**And** PrismaService must be available through the global PrismaModule

#### Scenario: Service dependency injection

**Given** the PostsController is instantiated  
**When** processing post requests  
**Then** PostsService must be injected via constructor  
**And** PostsService must have access to PrismaService

---

### Requirement: List Posts Endpoint

The API MUST expose an endpoint to retrieve all posts from the database with optional filtering.

#### Scenario: Get all posts successfully

**Given** the database contains multiple post records  
**When** a GET request is made to `/posts`  
**Then** the response must have status 200  
**And** the response body must contain an array of post objects  
**And** each post object must include: id, title, slug, content, published, createdAt, updatedAt, authorId  
**And** each post object must include author data with: id, username, email (no password)

#### Scenario: Get all posts when database is empty

**Given** the database contains no post records  
**When** a GET request is made to `/posts`  
**Then** the response must have status 200  
**And** the response body must contain an empty array

#### Scenario: Filter published posts only

**Given** the database contains both published and draft posts  
**When** a GET request is made to `/posts?published=true`  
**Then** the response must have status 200  
**And** the response body must contain only posts where published is true

#### Scenario: Filter draft posts only

**Given** the database contains both published and draft posts  
**When** a GET request is made to `/posts?published=false`  
**Then** the response must have status 200  
**And** the response body must contain only posts where published is false

---

### Requirement: Get Single Post by Slug Endpoint

The API MUST expose an endpoint to retrieve a specific post by its URL slug.

#### Scenario: Get post by valid slug

**Given** a post with slug "my-first-post" exists in the database  
**When** a GET request is made to `/posts/my-first-post`  
**Then** the response must have status 200  
**And** the response body must contain the post object  
**And** the post object must include: id, title, slug, content, published, createdAt, updatedAt, authorId  
**And** the post object must include author data with: id, username, email (no password)

#### Scenario: Get post by non-existent slug

**Given** no post with slug "nonexistent-post" exists  
**When** a GET request is made to `/posts/nonexistent-post`  
**Then** the response must have status 404  
**And** the response body must contain an error message indicating post not found

---

### Requirement: Create Post Endpoint

The API MUST expose an endpoint to create new post records with automatic slug generation.

#### Scenario: Create post with valid data

**Given** valid post data with title, content, published status, and authorId  
**When** a POST request is made to `/posts` with the post data  
**Then** the response must have status 201  
**And** a slug must be automatically generated from the title using the slugify utility  
**And** the response body must contain the created post object  
**And** the post object must include: id, title, slug, content, published, createdAt, updatedAt, authorId  
**And** the post object must include author data with: id, username, email (no password)

#### Scenario: Create post with missing required fields

**Given** post data is missing the title field  
**When** a POST request is made to `/posts` with incomplete data  
**Then** the response must have status 400  
**And** the response body must contain validation errors for missing fields

#### Scenario: Create post with duplicate title generates unique slug

**Given** a post with title "Hello World" and slug "hello-world" already exists  
**When** a POST request is made to `/posts` with title "Hello World"  
**Then** the slug must be made unique by appending a counter or timestamp  
**And** the response must have status 201  
**And** the new post must be created with a unique slug

#### Scenario: Create post with non-existent authorId

**Given** no user with ID 999 exists  
**When** a POST request is made to `/posts` with authorId 999  
**Then** the response must have status 404  
**And** the response body must indicate the author was not found

#### Scenario: Create post with optional content

**Given** valid post data with title and authorId but no content  
**When** a POST request is made to `/posts`  
**Then** the response must have status 201  
**And** the content field must be null in the created post

---

### Requirement: Update Post Endpoint

The API MUST expose an endpoint to update existing post records by slug with partial data.

#### Scenario: Update post with valid data

**Given** a post with slug "my-post" exists in the database  
**And** valid update data for title and/or content and/or published status  
**When** a PATCH request is made to `/posts/my-post` with update data  
**Then** the response must have status 200  
**And** the specified fields must be updated in the database  
**And** unspecified fields must remain unchanged  
**And** the response body must contain the updated post object  
**And** the post object must include author data

#### Scenario: Update post title regenerates slug

**Given** a post with slug "old-title" and title "Old Title" exists  
**And** update data contains a new title "New Title"  
**When** a PATCH request is made to `/posts/old-title` with the new title  
**Then** the slug must be regenerated from the new title  
**And** the response must have status 200  
**And** the post must have a new slug derived from "New Title"  
**And** subsequent requests must use the new slug

#### Scenario: Update post without title change preserves slug

**Given** a post with slug "my-post" exists  
**And** update data contains only content or published fields  
**When** a PATCH request is made to `/posts/my-post`  
**Then** the slug must remain unchanged  
**And** the response must have status 200

#### Scenario: Update non-existent post

**Given** no post with slug "nonexistent-post" exists  
**When** a PATCH request is made to `/posts/nonexistent-post`  
**Then** the response must have status 404  
**And** the response body must contain an error message

#### Scenario: Update post with duplicate title generates unique slug

**Given** a post with slug "my-post" exists  
**And** another post already has title "Existing Title" with slug "existing-title"  
**When** a PATCH request is made to `/posts/my-post` with title "Existing Title"  
**Then** the slug must be made unique  
**And** the response must have status 200

#### Scenario: Update post with no fields provided

**Given** a post with slug "my-post" exists  
**When** a PATCH request is made to `/posts/my-post` with an empty body  
**Then** the response must have status 200  
**And** no fields must be modified in the database  
**And** the response body must contain the unchanged post object

---

### Requirement: Delete Post Endpoint

The API MUST expose an endpoint to delete post records by slug.

#### Scenario: Delete existing post

**Given** a post with slug "my-post" exists in the database  
**When** a DELETE request is made to `/posts/my-post`  
**Then** the response must have status 200  
**And** the post must be removed from the database  
**And** the response body must contain the deleted post object

#### Scenario: Delete non-existent post

**Given** no post with slug "nonexistent-post" exists  
**When** a DELETE request is made to `/posts/nonexistent-post`  
**Then** the response must have status 404  
**And** the response body must contain an error message

---

### Requirement: Data Transfer Objects

The API MUST use DTOs for request validation and response serialization.

#### Scenario: CreatePostDto validation

**Given** a CreatePostDto class is defined  
**When** request data is validated  
**Then** title must be a required string field  
**And** content must be an optional string field  
**And** published must be an optional boolean field with default value false  
**And** authorId must be a required integer field

#### Scenario: UpdatePostDto validation

**Given** an UpdatePostDto class is defined  
**When** request data is validated  
**Then** title must be an optional string field  
**And** content must be an optional string field  
**And** published must be an optional boolean field  
**And** authorId must not be allowed to be updated (immutable after creation)  
**And** at least one field should be allowed to be empty (partial updates)

#### Scenario: Author data inclusion in responses

**Given** any post operation returns a post object  
**When** the response is serialized  
**Then** the author field must be included with user data  
**And** the author password field must be excluded  
**And** author must include: id, username, email, createdAt, updatedAt

---

### Requirement: Slug Generation and Uniqueness

The API MUST automatically generate URL-safe slugs from post titles and ensure uniqueness.

#### Scenario: Generate slug from title on creation

**Given** a new post is being created with title "My Awesome Post!"  
**When** the slugify utility is called  
**Then** the slug must be "my-awesome-post"  
**And** the slug must be stored in the database

#### Scenario: Ensure slug uniqueness on creation

**Given** a post with slug "hello-world" already exists  
**And** a new post is being created with title "Hello World"  
**When** the slug generation process runs  
**Then** the system must detect the duplicate slug  
**And** the system must append a unique identifier (counter or timestamp)  
**And** the final slug must be unique (e.g., "hello-world-2" or "hello-world-1234567890")

#### Scenario: Regenerate slug on title update

**Given** a post with ID 5 and title "Old Title" exists  
**And** the post is being updated with a new title "New Title"  
**When** the update process runs  
**Then** a new slug must be generated from "New Title"  
**And** uniqueness must be ensured  
**And** the post must be updated with the new slug

#### Scenario: Preserve slug when title unchanged

**Given** a post with ID 5 and slug "my-post" exists  
**And** the post is being updated with content or published status  
**When** the update process runs  
**Then** the slug must remain "my-post"  
**And** the slug must not be regenerated
