# user-api Specification

## Purpose
TBD - created by archiving change add-user-api-routes. Update Purpose after archive.
## Requirements
### Requirement: User Module Structure

The API MUST provide a dedicated NestJS module for user management following standard resource organization patterns.

#### Scenario: Users module registration

**Given** the NestJS application is initialized  
**When** the application bootstraps  
**Then** a UsersModule must be imported in AppModule  
**And** the module must declare UsersController  
**And** the module must provide UsersService  
**And** PrismaService must be available through the global PrismaModule

#### Scenario: Service dependency injection

**Given** the UsersController is instantiated  
**When** processing user requests  
**Then** UsersService must be injected via constructor  
**And** UsersService must have access to PrismaService  
**And** UsersService must have access to PasswordService

---

### Requirement: List Users Endpoint

The API MUST expose an endpoint to retrieve all users from the database.

#### Scenario: Get all users successfully

**Given** the database contains multiple user records  
**When** a GET request is made to `/users`  
**Then** the response must have status 200  
**And** the response body must contain an array of user objects  
**And** each user object must include: id, username, email, createdAt, updatedAt  
**And** each user object must NOT include the password field

#### Scenario: Get all users when database is empty

**Given** the database contains no user records  
**When** a GET request is made to `/users`  
**Then** the response must have status 200  
**And** the response body must contain an empty array

---

### Requirement: Get Single User Endpoint

The API MUST expose an endpoint to retrieve a specific user by their ID.

#### Scenario: Get user by valid ID

**Given** a user with ID 5 exists in the database  
**When** a GET request is made to `/users/5`  
**Then** the response must have status 200  
**And** the response body must contain the user object  
**And** the user object must include: id, username, email, createdAt, updatedAt  
**And** the user object must NOT include the password field

#### Scenario: Get user by non-existent ID

**Given** no user with ID 999 exists in the database  
**When** a GET request is made to `/users/999`  
**Then** the response must have status 404  
**And** the response body must contain an error message indicating user not found

#### Scenario: Get user with invalid ID format

**Given** the ID parameter is not a valid integer  
**When** a GET request is made to `/users/invalid`  
**Then** the response must have status 400  
**And** the response body must contain a validation error

---

### Requirement: Create User Endpoint

The API MUST expose an endpoint to create new user records.

#### Scenario: Create user with valid data

**Given** valid user data with username, email, and password  
**When** a POST request is made to `/users` with the user data  
**Then** the response must have status 201  
**And** the password must be hashed using PasswordService before storing  
**And** the response body must contain the created user object  
**And** the user object must include: id, username, email, createdAt, updatedAt  
**And** the user object must NOT include the password field

#### Scenario: Create user with missing required fields

**Given** user data is missing the email field  
**When** a POST request is made to `/users` with incomplete data  
**Then** the response must have status 400  
**And** the response body must contain validation errors for missing fields

#### Scenario: Create user with duplicate username

**Given** a user with username "john_doe" already exists  
**When** a POST request is made to `/users` with username "john_doe"  
**Then** the response must have status 409  
**And** the response body must indicate a conflict error

#### Scenario: Create user with duplicate email

**Given** a user with email "john@example.com" already exists  
**When** a POST request is made to `/users` with email "john@example.com"  
**Then** the response must have status 409  
**And** the response body must indicate a conflict error

#### Scenario: Create user with invalid email format

**Given** user data contains an invalid email format  
**When** a POST request is made to `/users` with data  
**Then** the response must have status 400  
**And** the response body must contain an email validation error

---

### Requirement: Update User Endpoint

The API MUST expose an endpoint to update existing user records with partial data.

#### Scenario: Update user with valid data

**Given** a user with ID 3 exists in the database  
**And** valid update data for username and/or email  
**When** a PATCH request is made to `/users/3` with update data  
**Then** the response must have status 200  
**And** the specified fields must be updated in the database  
**And** unspecified fields must remain unchanged  
**And** the response body must contain the updated user object  
**And** the user object must NOT include the password field

#### Scenario: Update user password

**Given** a user with ID 3 exists in the database  
**And** update data contains a new password  
**When** a PATCH request is made to `/users/3` with the password  
**Then** the new password must be hashed using PasswordService  
**And** the hashed password must be stored in the database  
**And** the response must have status 200  
**And** the response body must NOT include the password field

#### Scenario: Update non-existent user

**Given** no user with ID 999 exists  
**When** a PATCH request is made to `/users/999`  
**Then** the response must have status 404  
**And** the response body must contain an error message

#### Scenario: Update user with duplicate username

**Given** a user with ID 3 exists  
**And** another user already has username "jane_doe"  
**When** a PATCH request is made to `/users/3` with username "jane_doe"  
**Then** the response must have status 409  
**And** the response body must indicate a conflict error

#### Scenario: Update user with duplicate email

**Given** a user with ID 3 exists  
**And** another user already has email "jane@example.com"  
**When** a PATCH request is made to `/users/3` with email "jane@example.com"  
**Then** the response must have status 409  
**And** the response body must indicate a conflict error

#### Scenario: Update user with no fields provided

**Given** a user with ID 3 exists  
**When** a PATCH request is made to `/users/3` with an empty body  
**Then** the response must have status 200  
**And** no fields must be modified in the database  
**And** the response body must contain the unchanged user object

---

### Requirement: Delete User Endpoint

The API MUST expose an endpoint to delete user records.

#### Scenario: Delete existing user

**Given** a user with ID 7 exists in the database  
**When** a DELETE request is made to `/users/7`  
**Then** the response must have status 200  
**And** the user must be removed from the database  
**And** the response body must contain the deleted user object  
**And** any related posts must be deleted due to cascade rules

#### Scenario: Delete non-existent user

**Given** no user with ID 999 exists  
**When** a DELETE request is made to `/users/999`  
**Then** the response must have status 404  
**And** the response body must contain an error message

#### Scenario: Delete user with invalid ID format

**Given** the ID parameter is not a valid integer  
**When** a DELETE request is made to `/users/invalid`  
**Then** the response must have status 400  
**And** the response body must contain a validation error

---

### Requirement: Data Transfer Objects

The API MUST use DTOs for request validation and response serialization.

#### Scenario: CreateUserDto validation

**Given** a CreateUserDto class is defined  
**When** request data is validated  
**Then** username must be a required string field  
**And** email must be a required string field with email format validation  
**And** password must be a required string field with minimum length of 8 characters

#### Scenario: UpdateUserDto validation

**Given** an UpdateUserDto class is defined  
**When** request data is validated  
**Then** username must be an optional string field  
**And** email must be an optional string field with email format validation if provided  
**And** password must be an optional string field with minimum length of 8 characters if provided  
**And** at least one field should be allowed to be empty (partial updates)

#### Scenario: Password exclusion from responses

**Given** any user operation returns a user object  
**When** the response is serialized  
**Then** the password field must be explicitly excluded  
**And** the exclusion must be consistent across all endpoints

