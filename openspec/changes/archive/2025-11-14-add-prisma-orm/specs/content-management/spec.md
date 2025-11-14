# Content Management

## Overview

Defines requirements for managing blog posts with markdown content, including slug generation and URL-safe identifiers for routing.

## ADDED Requirements

### Requirement: Markdown Content Storage

The system SHALL support markdown content for blog posts.

#### Scenario: Store markdown content

**Given** a blog post with markdown content  
**When** saving the post to the database  
**Then** the markdown must be stored as plain text in the `content` field  
**And** the field type must be String (TEXT in PostgreSQL)  
**And** the content must preserve all markdown formatting  
**And** special characters in markdown must not be escaped or modified

#### Scenario: Retrieve markdown content

**Given** a stored blog post  
**When** fetching the post from the database  
**Then** the markdown content must be returned exactly as stored  
**And** no server-side rendering of markdown must occur (handled by frontend)  
**And** the content must be included in the Post response

#### Scenario: Handle empty content

**Given** a blog post being created  
**When** no content is provided  
**Then** the content field must accept null or empty string  
**And** the post must still be valid  
**And** empty content must not cause validation errors

---

### Requirement: Slug Generation

The system SHALL generate URL-safe slugs from post titles.

#### Scenario: Create slug utility function

**Given** the need for URL-safe identifiers  
**When** implementing slug generation  
**Then** a utility function `slugify(text: string): string` must be created  
**And** the function must convert text to lowercase  
**And** must replace spaces with hyphens  
**And** must remove or replace special characters  
**And** must handle Unicode characters appropriately  
**And** must trim leading and trailing hyphens

#### Scenario: Generate slug from title

**Given** a post with a title "My First Post!"  
**When** generating the slug  
**Then** the slug must be "my-first-post"  
**And** special characters must be removed  
**And** the result must be URL-safe

#### Scenario: Handle duplicate slugs

**Given** multiple posts with similar titles  
**When** generating slugs  
**Then** the system must ensure slug uniqueness  
**And** duplicate slugs must be handled by appending a counter (e.g., "my-post-2")  
**Or** the system must reject posts with duplicate slugs with a validation error

#### Scenario: Custom slug override

**Given** a post being created  
**When** a custom slug is provided  
**Then** the custom slug must be used instead of auto-generated slug  
**And** the custom slug must still be validated for URL-safety  
**And** the custom slug must be lowercased and trimmed

---

### Requirement: Slug Indexing

The system SHALL provide fast slug-based lookups for routing.

#### Scenario: Index slug field

**Given** the Post model  
**When** defining database indexes  
**Then** the `slug` field must have a unique index  
**And** queries filtering by slug must use the index  
**And** the index must be created in the initial migration

#### Scenario: Query posts by slug

**Given** a slug value  
**When** fetching a post by slug  
**Then** the query must use `findUnique` with slug  
**And** the query must complete in constant time regardless of table size  
**And** non-existent slugs must return null or throw not found error

---

### Requirement: Post Publishing Workflow

The system SHALL support draft and published states for posts.

#### Scenario: Default post state

**Given** a new post is created  
**When** no published status is specified  
**Then** the `published` field must default to `false`  
**And** the post must be considered a draft

#### Scenario: Publish a post

**Given** a draft post  
**When** updating the post  
**Then** the `published` field must be settable to `true`  
**And** published posts must be distinguishable from drafts in queries

#### Scenario: Query published posts

**Given** multiple posts with different published states  
**When** fetching posts for public display  
**Then** queries must be able to filter by `published: true`  
**And** draft posts must be excluded from public listings  
**And** the filter must use the database index if available
