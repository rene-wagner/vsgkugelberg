# authentication-api Specification

## Purpose

Defines the authentication API for user login using JWT tokens stored in secure HTTP-only cookies. This specification covers the login endpoint, token generation, cookie configuration, and error handling for username/email + password authentication.

## Requirements

### Requirement: Login Endpoint

The API MUST provide a POST endpoint for user authentication that accepts username or email with password and returns a JWT token in a secure HTTP-only cookie.

#### Scenario: Login with username successfully

**Given** a user with username "john.doe" and password "secret123" exists  
**When** a POST request is made to `/auth/login` with `{ "username": "john.doe", "password": "secret123" }`  
**Then** the response must have status 200  
**And** the response body must contain a user object with id, username, email, createdAt, updatedAt  
**And** the response body must NOT include the password field  
**And** the response must set a cookie named "access_token" containing a JWT  
**And** the cookie must have httpOnly flag set to true  
**And** the cookie must have sameSite set to "strict"  
**And** the cookie must have maxAge of 3600000 milliseconds (1 hour)

#### Scenario: Login with email successfully

**Given** a user with email "john@example.com" and password "secret123" exists  
**When** a POST request is made to `/auth/login` with `{ "username": "john@example.com", "password": "secret123" }`  
**Then** the response must have status 200  
**And** the response body must contain the user object  
**And** the response must set the access_token cookie with JWT

#### Scenario: Login with invalid password

**Given** a user with username "john.doe" exists  
**When** a POST request is made to `/auth/login` with incorrect password  
**Then** the response must have status 401  
**And** the response body must contain `{ "statusCode": 401, "message": "Unauthorized" }`  
**And** no cookie must be set

#### Scenario: Login with non-existent user

**Given** no user with username "unknown" exists  
**When** a POST request is made to `/auth/login` with `{ "username": "unknown", "password": "anypass" }`  
**Then** the response must have status 401  
**And** the response body must contain `{ "statusCode": 401, "message": "Unauthorized" }`

#### Scenario: Login with missing username

**Given** the API is available  
**When** a POST request is made to `/auth/login` without username field  
**Then** the response must have status 400  
**And** the response body must contain validation error messages

#### Scenario: Login with missing password

**Given** the API is available  
**When** a POST request is made to `/auth/login` without password field  
**Then** the response must have status 400  
**And** the response body must contain validation error messages

---

### Requirement: JWT Token Generation

The system MUST generate JWT tokens with minimal claims and proper security configuration.

#### Scenario: JWT payload structure

**Given** a user with id "uuid-123" and username "john.doe" logs in  
**When** a JWT token is generated  
**Then** the token payload must include "sub" claim with user ID  
**And** the token payload must include "username" claim with username value  
**And** the token payload must include "iat" (issued at) claim  
**And** the token payload must include "exp" (expiration) claim  
**And** the token must be signed with HS256 algorithm  
**And** the token must expire 1 hour after issuance

#### Scenario: JWT secret configuration

**Given** the authentication system is configured  
**When** tokens are signed or verified  
**Then** the system must use JWT_SECRET from environment variables  
**And** the system must fall back to "dev-secret-change-in-production" in development  
**And** the secret must be used for HMAC-SHA256 signing

---

### Requirement: Secure HTTP-Only Cookies

The system MUST store JWT tokens in cookies with security attributes to prevent XSS and CSRF attacks.

#### Scenario: Cookie security attributes

**Given** a user logs in successfully  
**When** the JWT cookie is set  
**Then** the cookie name must be "access_token"  
**And** the httpOnly attribute must be true  
**And** the sameSite attribute must be "strict"  
**And** the secure attribute must be true when NODE_ENV is "production"  
**And** the secure attribute must be false when NODE_ENV is "development"  
**And** the maxAge must be 3600000 milliseconds

---

### Requirement: Password Verification

The login process MUST securely verify passwords using the existing PasswordService.

#### Scenario: Password comparison

**Given** a user attempts to log in  
**When** validating credentials  
**Then** the system must retrieve the user by username OR email  
**And** the system must call PasswordService.compare() with plaintext password and stored hash  
**And** the system must return user data if comparison succeeds  
**And** the system must return null if comparison fails  
**And** the password hash must never be included in any response

---

### Requirement: Authentication Guard

The system MUST provide a JwtAuthGuard for protecting routes that require authentication.

#### Scenario: Protect route with JWT guard

**Given** a route decorated with @UseGuards(JwtAuthGuard)  
**When** a request is made with a valid JWT cookie  
**Then** the guard must extract the JWT from access_token cookie  
**And** the guard must validate the token signature  
**And** the guard must check the token expiration  
**And** the guard must decode the payload  
**And** the guard must attach user object to req.user with id and username  
**And** the request must proceed to the route handler

#### Scenario: Access protected route without token

**Given** a route decorated with @UseGuards(JwtAuthGuard)  
**When** a request is made without an access_token cookie  
**Then** the guard must return status 401  
**And** the response must contain "Unauthorized" message  
**And** the request must not reach the route handler

#### Scenario: Access protected route with invalid token

**Given** a route decorated with @UseGuards(JwtAuthGuard)  
**When** a request is made with an invalid or expired JWT cookie  
**Then** the guard must return status 401  
**And** the response must contain "Unauthorized" message

---

### Requirement: CORS Configuration for Credentials

The API MUST configure CORS to allow cookies to be sent from the frontend origin.

#### Scenario: CORS credentials configuration

**Given** the NestJS application is initialized  
**When** CORS is configured  
**Then** the origin must be set to FRONTEND_URL environment variable  
**And** the origin must default to "http://localhost:5173" if FRONTEND_URL is not set  
**And** credentials must be set to true  
**And** the browser must be allowed to send cookies with cross-origin requests

---

### Requirement: Environment Variables

The authentication system MUST use environment variables for sensitive configuration.

#### Scenario: Required environment variables

**Given** the authentication system is deployed  
**When** the application starts  
**Then** JWT_SECRET must be defined in environment  
**And** JWT_SECRET must be at least 32 characters in production  
**And** NODE_ENV must be defined as "development" or "production"  
**And** FRONTEND_URL must be defined for CORS configuration

#### Scenario: Development fallback values

**Given** the application runs in development mode  
**When** JWT_SECRET is not defined  
**Then** the system must use "dev-secret-change-in-production" as fallback  
**And** a warning should be logged about using development secret

---

### Requirement: Auth Module Structure

The API MUST provide a dedicated NestJS module for authentication following standard patterns.

#### Scenario: Auth module registration

**Given** the NestJS application is initialized  
**When** the application bootstraps  
**Then** an AuthModule must be imported in AppModule  
**And** the module must register LocalStrategy for username/password validation  
**And** the module must register JwtStrategy for token validation  
**And** the module must provide AuthService  
**And** the module must declare AuthController  
**And** the module must import PassportModule  
**And** the module must import JwtModule with secret and expiration configuration  
**And** the module must import UsersModule to access user data  
**And** the module must provide PasswordService

#### Scenario: Strategy registration

**Given** the AuthModule is initialized  
**When** authentication is performed  
**Then** LocalStrategy must be available for login validation  
**And** JwtStrategy must be available for token validation  
**And** both strategies must be injectable services

---
