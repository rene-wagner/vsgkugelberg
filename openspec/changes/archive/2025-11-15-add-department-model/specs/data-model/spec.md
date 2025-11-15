# data-model Specification Delta

## ADDED Requirements

### Requirement: Department Model

The system SHALL define a Department model for representing the sport departments of VSG Kugelberg e.V.

#### Scenario: Department model fields

**Given** the Department model definition  
**When** the schema is defined  
**Then** the Department model must have an auto-incrementing `id` field as primary key  
**And** must have a `name` field of type String with unique constraint  
**And** must have a `slug` field of type String with unique constraint  
**And** must have a `shortDescription` field of type String  
**And** must have a `longDescription` field of type String  
**And** must have a `createdAt` field of type DateTime with default value `now()`  
**And** must have an `updatedAt` field of type DateTime with `@updatedAt` directive

#### Scenario: Department uniqueness constraints

**Given** the Department model  
**When** unique constraints are applied  
**Then** the `name` field must have a `@unique` constraint  
**And** the `slug` field must have a `@unique` constraint  
**And** duplicate department names must be rejected by the database  
**And** duplicate slugs must be rejected by the database

#### Scenario: Department slug indexing

**Given** the Department model definition  
**When** querying departments by slug  
**Then** the `slug` field must have a database index for fast lookups  
**And** slug uniqueness must be enforced at database level

#### Scenario: Department descriptions

**Given** a Department record  
**When** storing department information  
**Then** `shortDescription` must not be null (required field)  
**And** `longDescription` must not be null (required field)  
**And** both description fields must accept text strings for content

---
