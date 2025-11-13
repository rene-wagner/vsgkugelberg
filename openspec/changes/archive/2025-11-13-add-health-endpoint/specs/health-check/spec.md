# Health Check Capability

## ADDED Requirements

### Requirement: Health Endpoint
The API SHALL provide a health check endpoint at `GET /health` that returns a JSON response indicating service availability.

#### Scenario: Successful health check
- **GIVEN** the API service is running
- **WHEN** a client sends a GET request to `/health`
- **THEN** the response status code SHALL be 200 OK
- **AND** the response SHALL be valid JSON
- **AND** the response SHALL contain a `status` field with value `"ok"`

#### Scenario: Response structure validation
- **GIVEN** a client requests the health endpoint
- **WHEN** the response is received
- **THEN** the Content-Type header SHALL be `application/json`
- **AND** the response body SHALL be parseable as JSON
- **AND** the response SHALL include at minimum `{"status": "ok"}`

### Requirement: Controller Implementation
The health check SHALL be implemented using a dedicated NestJS controller following framework conventions.

#### Scenario: Controller registration
- **GIVEN** the NestJS application is initialized
- **WHEN** the application module is loaded
- **THEN** the HealthController SHALL be registered in the controllers array
- **AND** the controller SHALL use the `@Controller('health')` decorator
- **AND** the GET endpoint SHALL use the `@Get()` decorator

#### Scenario: TypeScript type safety
- **GIVEN** the health controller implementation
- **WHEN** TypeScript compilation occurs
- **THEN** all code SHALL be properly typed
- **AND** no `any` types SHALL be used
- **AND** the return type SHALL be explicitly defined or inferred

### Requirement: No External Dependencies
The basic health check SHALL NOT require additional npm packages beyond core NestJS dependencies already in the project.

#### Scenario: Dependency check
- **GIVEN** the current package.json dependencies
- **WHEN** implementing the health endpoint
- **THEN** no new package installations SHALL be required
- **AND** only @nestjs/common decorators SHALL be used
- **AND** the implementation SHALL work with existing dependencies
