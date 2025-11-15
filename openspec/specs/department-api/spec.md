# department-api Specification

## Purpose
Provide RESTful API endpoints for managing sport departments of VSG Kugelberg e.V., enabling CRUD operations for the four departments: Badminton, Gymnastics, Table Tennis, and Volleyball.

## Requirements

### Requirement: Department Module Structure

The API MUST provide a dedicated NestJS module for department management following standard resource organization patterns.

#### Scenario: Departments module registration

**Given** the NestJS application is initialized  
**When** the application bootstraps  
**Then** a DepartmentsModule must be imported in AppModule  
**And** the module must declare DepartmentsController  
**And** the module must provide DepartmentsService  
**And** PrismaService must be available through the global PrismaModule

#### Scenario: Service dependency injection

**Given** the DepartmentsController is instantiated  
**When** processing department requests  
**Then** DepartmentsService must be injected via constructor  
**And** DepartmentsService must have access to PrismaService

---

### Requirement: List Departments Endpoint

The API MUST expose an endpoint to retrieve all departments.

#### Scenario: Get all departments successfully

**Given** the database contains multiple department records  
**When** a GET request is made to `/departments`  
**Then** the response must have status 200  
**And** the response body must contain an array of department objects  
**And** each department must include: id, name, slug, shortDescription, longDescription, createdAt, updatedAt

#### Scenario: Get all departments when database is empty

**Given** the database contains no department records  
**When** a GET request is made to `/departments`  
**Then** the response must have status 200  
**And** the response body must contain an empty array

---

### Requirement: Get Single Department by Slug Endpoint

The API MUST expose an endpoint to retrieve a specific department by its URL slug.

#### Scenario: Get department by valid slug

**Given** a department with slug "badminton" exists  
**When** a GET request is made to `/departments/badminton`  
**Then** the response must have status 200  
**And** the response must include: id, name, slug, shortDescription, longDescription, createdAt, updatedAt

#### Scenario: Get department by non-existent slug

**Given** no department with slug "nonexistent" exists  
**When** a GET request is made to `/departments/nonexistent`  
**Then** the response must have status 404  
**And** the response body must contain an error message indicating department not found

---

### Requirement: Create Department Endpoint

The API MUST expose an endpoint to create new department records with automatic slug generation.

#### Scenario: Create department with valid data

**Given** valid department data with name "Badminton", shortDescription, and longDescription  
**When** a POST request is made to `/departments` with the data  
**Then** the response must have status 201  
**And** a slug "badminton" must be automatically generated from the name  
**And** the response must include: id, name, slug, shortDescription, longDescription, createdAt, updatedAt

#### Scenario: Create department with missing required fields

**Given** department data without the required `name` field  
**When** a POST request is made to `/departments`  
**Then** the response must have status 400  
**And** the response body must contain validation error details

#### Scenario: Create department with duplicate name

**Given** a department with name "Badminton" already exists  
**When** a POST request is made to create another department named "Badminton"  
**Then** the response must have status 409  
**And** the error message must indicate duplicate department name

#### Scenario: Create department with missing shortDescription

**Given** department data with name and longDescription but no shortDescription  
**When** a POST request is made to `/departments`  
**Then** the response must have status 400  
**And** the response body must contain validation error for missing shortDescription

#### Scenario: Create department with missing longDescription

**Given** department data with name and shortDescription but no longDescription  
**When** a POST request is made to `/departments`  
**Then** the response must have status 400  
**And** the response body must contain validation error for missing longDescription

---

### Requirement: Update Department Endpoint

The API MUST expose an endpoint to update existing department records with slug regeneration.

#### Scenario: Update department name

**Given** a department with slug "old-name" exists  
**When** a PATCH request is made to `/departments/old-name` with new name "New Name"  
**Then** the response must have status 200  
**And** the slug must be regenerated to "new-name"  
**And** all department data must be preserved

#### Scenario: Update department descriptions only

**Given** a department with slug "badminton" exists  
**When** a PATCH request is made to `/departments/badminton` with new shortDescription and longDescription only  
**Then** the response must have status 200  
**And** the slug must remain "badminton"  
**And** the descriptions must be updated

#### Scenario: Update department with duplicate name

**Given** departments "Badminton" and "Volleyball" exist  
**When** a PATCH request is made to update "Volleyball" name to "Badminton"  
**Then** the response must have status 409  
**And** the error message must indicate duplicate department name

#### Scenario: Update non-existent department

**Given** no department with slug "missing" exists  
**When** a PATCH request is made to `/departments/missing`  
**Then** the response must have status 404  
**And** the error message must indicate department not found

---

### Requirement: Delete Department Endpoint

The API MUST expose an endpoint to delete department records.

#### Scenario: Delete existing department

**Given** a department with slug "badminton" exists  
**When** a DELETE request is made to `/departments/badminton`  
**Then** the response must have status 200  
**And** the department record must be removed from the database  
**And** subsequent GET requests to `/departments/badminton` must return 404

#### Scenario: Delete non-existent department

**Given** no department with slug "missing" exists  
**When** a DELETE request is made to `/departments/missing`  
**Then** the response must have status 404  
**And** the error message must indicate department not found

---

### Requirement: Input Validation

The API MUST validate all incoming department data according to business rules.

#### Scenario: Validate department name length

**Given** a create or update request with department data  
**When** the `name` field exceeds 100 characters  
**Then** the response must have status 400  
**And** the validation error must indicate name is too long

#### Scenario: Validate shortDescription length

**Given** a create or update request with department data  
**When** the `shortDescription` field exceeds 200 characters  
**Then** the response must have status 400  
**And** the validation error must indicate shortDescription is too long

#### Scenario: Validate longDescription length

**Given** a create or update request with department data  
**When** the `longDescription` field exceeds 5000 characters  
**Then** the response must have status 400  
**And** the validation error must indicate longDescription is too long

#### Scenario: Validate required fields are strings

**Given** a create or update request with department data  
**When** any of name, shortDescription, or longDescription are not strings  
**Then** the response must have status 400  
**And** the validation error must indicate the field must be a string

#### Scenario: Validate name is not empty

**Given** a create or update request with department data  
**When** the `name` field is an empty string or whitespace only  
**Then** the response must have status 400  
**And** the validation error must indicate name cannot be empty

---

### Requirement: Slug Generation

The API MUST automatically generate URL-friendly slugs from department names.

#### Scenario: Generate slug from name on creation

**Given** a POST request with department name "Table Tennis"  
**When** creating the department  
**Then** the slug must be automatically generated as "table-tennis"  
**And** the slug must be lowercase  
**And** spaces must be replaced with hyphens

#### Scenario: Regenerate slug on name update

**Given** a department with name "Badminton" and slug "badminton"  
**When** a PATCH request updates the name to "Badminton Club"  
**Then** the slug must be regenerated to "badminton-club"

#### Scenario: Handle special characters in slug generation

**Given** a department name contains special characters like "Gym & Fitness"  
**When** generating the slug  
**Then** special characters must be removed or replaced  
**And** the slug must contain only lowercase letters, numbers, and hyphens

---

### Requirement: Error Handling

The API MUST provide clear and consistent error responses for all failure scenarios.

#### Scenario: Handle Prisma unique constraint violations

**Given** a duplicate name or slug violation at database level  
**When** Prisma throws a unique constraint error  
**Then** the API must catch the error  
**And** return status 409 Conflict  
**And** provide a user-friendly error message

#### Scenario: Handle Prisma record not found

**Given** a request for a non-existent department  
**When** Prisma returns no records  
**Then** the API must return status 404 Not Found  
**And** provide a clear error message indicating department not found

#### Scenario: Handle validation pipe errors

**Given** invalid input data that fails DTO validation  
**When** the validation pipe processes the request  
**Then** the API must return status 400 Bad Request  
**And** include detailed validation error messages for each field

---
