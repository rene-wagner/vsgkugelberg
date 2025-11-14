# data-model Specification Delta

## ADDED Requirements

### Requirement: Category Model

The system SHALL define a Category model for organizing posts into broad content classifications.

#### Scenario: Category model fields

**Given** the Category model definition  
**When** the schema is defined  
**Then** the Category model must have an auto-incrementing `id` field as primary key  
**And** must have a `name` field of type String with unique constraint  
**And** must have a `slug` field of type String with unique constraint  
**And** must have a `description` field of type String? (optional)  
**And** must have a `createdAt` field of type DateTime with default value `now()`  
**And** must have an `updatedAt` field of type DateTime with `@updatedAt` directive

#### Scenario: Category slug indexing

**Given** the Category model definition  
**When** querying categories by slug  
**Then** the `slug` field must have a database index for fast lookups  
**And** slug uniqueness must be enforced at database level

#### Scenario: Category to Post relation

**Given** the Category and Post models  
**When** establishing relationships  
**Then** Category must have a `posts` field of type Post[] for implicit many-to-many relation  
**And** Prisma must auto-generate a join table `_CategoryToPost`

---

### Requirement: Tag Model

The system SHALL define a Tag model for flexible cross-cutting labeling of posts.

#### Scenario: Tag model fields

**Given** the Tag model definition  
**When** the schema is defined  
**Then** the Tag model must have an auto-incrementing `id` field as primary key  
**And** must have a `name` field of type String with unique constraint  
**And** must have a `slug` field of type String with unique constraint  
**And** must have a `createdAt` field of type DateTime with default value `now()`  
**And** must have an `updatedAt` field of type DateTime with `@updatedAt` directive

#### Scenario: Tag slug indexing

**Given** the Tag model definition  
**When** querying tags by slug  
**Then** the `slug` field must have a database index for fast lookups  
**And** slug uniqueness must be enforced at database level

#### Scenario: Tag to Post relation

**Given** the Tag and Post models  
**When** establishing relationships  
**Then** Tag must have a `posts` field of type Post[] for implicit many-to-many relation  
**And** Prisma must auto-generate a join table `_PostToTag`

---

## MODIFIED Requirements

### Requirement: Post Model

The system SHALL extend the Post model to support taxonomic classification via categories and tags.

#### Scenario: Post taxonomy relations

**Given** the Post model with Category and Tag models  
**When** establishing relationships  
**Then** Post must have a `categories` field of type Category[] for many-to-many relation  
**And** Post must have a `tags` field of type Tag[] for many-to-many relation  
**And** both relations must be optional (posts can exist without categories/tags)
