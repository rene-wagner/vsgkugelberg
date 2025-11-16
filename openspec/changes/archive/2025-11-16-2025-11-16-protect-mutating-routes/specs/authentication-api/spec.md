# authentication-api Specification Deltas

This file contains the specification changes for protecting mutating routes with authentication.

## ADDED Requirements

### Requirement: Global Authentication Guard

The authentication system MUST provide a global JWT guard that automatically protects all routes except those explicitly marked as public.

#### Scenario: Register global JWT guard

**Given** the authentication module is configured  
**When** the application initializes  
**Then** the JwtAuthGuard must be registered as APP_GUARD provider  
**And** the guard must be applied to all routes by default  
**And** the guard must have access to Reflector for metadata checking

#### Scenario: Global guard validates JWT on protected routes

**Given** the global JWT guard is active  
**And** a route handler does not have public metadata  
**When** a request is made without Authorization header  
**Then** the response must have status 401  
**And** the response must contain UnauthorizedException message

#### Scenario: Global guard allows public routes

**Given** the global JWT guard is active  
**And** a route handler has IS_PUBLIC_KEY metadata set to true  
**When** a request is made without Authorization header  
**Then** the guard must return true immediately  
**And** the route handler must be executed  
**And** no authentication check must be performed

---

### Requirement: Public Route Decorator

The authentication system MUST provide a decorator to mark routes as publicly accessible without authentication.

#### Scenario: Define public decorator

**Given** the decorator system is available  
**When** the Public decorator is created  
**Then** it must use SetMetadata with key "isPublic"  
**And** it must set the metadata value to true  
**And** it must be exported from auth/decorators module

#### Scenario: Apply public decorator to route

**Given** the @Public() decorator exists  
**When** applied to a controller method or class  
**Then** the IS_PUBLIC_KEY metadata must be set on that handler  
**And** the global guard must skip authentication for that route

#### Scenario: Public decorator on login endpoint

**Given** the login endpoint at POST /auth/login exists  
**When** the @Public() decorator is applied  
**Then** the endpoint must be accessible without JWT token  
**And** authentication must not be required  
**And** the local authentication guard must still validate credentials

---

### Requirement: Enhanced JWT Auth Guard

The JWT authentication guard MUST check for public route metadata before enforcing authentication.

#### Scenario: Guard checks public metadata first

**Given** a route is being accessed  
**When** the JwtAuthGuard canActivate method executes  
**Then** it must use Reflector.getAllAndOverride to check IS_PUBLIC_KEY  
**And** it must check both handler and class metadata  
**And** if metadata is true, it must return true immediately

#### Scenario: Guard enforces authentication on non-public routes

**Given** a route does not have public metadata  
**When** the JwtAuthGuard canActivate method executes  
**Then** it must extract token from Authorization header  
**And** it must verify the JWT token  
**And** it must attach user payload to request object  
**And** it must throw UnauthorizedException if token is invalid or missing

---

## MODIFIED Requirements

### Requirement: Protected Mutating Routes (MODIFIED)

All POST, PATCH, and DELETE routes MUST require JWT authentication. GET routes and explicitly marked public routes remain accessible without authentication.

#### Scenario: POST route requires authentication

**Given** the global JWT guard is active  
**And** any POST endpoint exists (e.g., POST /posts, POST /categories)  
**When** a request is made without valid JWT token  
**Then** the response must have status 401  
**And** the response must contain UnauthorizedException

#### Scenario: POST route succeeds with valid token

**Given** the global JWT guard is active  
**And** a user has a valid JWT token  
**When** a POST request is made with Authorization: Bearer <token>  
**Then** the request must be authenticated  
**And** the route handler must execute  
**And** the expected operation must complete successfully

#### Scenario: PATCH route requires authentication

**Given** the global JWT guard is active  
**And** any PATCH endpoint exists (e.g., PATCH /posts/:slug)  
**When** a request is made without valid JWT token  
**Then** the response must have status 401  
**And** the response must contain UnauthorizedException

#### Scenario: DELETE route requires authentication

**Given** the global JWT guard is active  
**And** any DELETE endpoint exists (e.g., DELETE /posts/:slug)  
**When** a request is made without valid JWT token  
**Then** the response must have status 401  
**And** the response must contain UnauthorizedException

#### Scenario: GET routes remain public

**Given** the global JWT guard is active  
**And** a GET endpoint exists (e.g., GET /posts, GET /posts/:slug)  
**When** a request is made without JWT token  
**Then** the request must succeed  
**And** the response must return the requested data  
**And** no authentication must be required

---

### Requirement: Login Endpoint Remains Public (MODIFIED)

The login endpoint MUST remain publicly accessible to allow users to obtain JWT tokens.

#### Scenario: Login without prior authentication

**Given** the global JWT guard is active  
**And** the login endpoint has @Public() decorator  
**When** a POST request is made to /auth/login with valid credentials  
**Then** the request must succeed without JWT token  
**And** the LocalAuthGuard must validate credentials  
**And** a new JWT token must be issued  
**And** the user must be authenticated

#### Scenario: Login endpoint bypasses global guard

**Given** the global JWT guard is active  
**And** the @Public() decorator is on POST /auth/login  
**When** the guard's canActivate method executes for this route  
**Then** the public metadata check must return true  
**And** JWT verification must be skipped  
**And** the LocalAuthGuard must handle authentication

---

## REMOVED Requirements

None - this change adds new security requirements without removing existing functionality.
