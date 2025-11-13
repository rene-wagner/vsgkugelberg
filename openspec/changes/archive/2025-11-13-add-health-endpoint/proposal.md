# Change: Add Basic Health Check Endpoint

## Why
The API needs a health check endpoint for monitoring, load balancers, and container orchestration platforms to verify service availability and readiness.

## What Changes
- Add `GET /health` endpoint that returns JSON response
- Implement basic HealthController with @nestjs/common decorators
- Return simple JSON status without external dependencies
- Follow NestJS best practices for controller structure

## Impact
- Affected specs: health-check (new capability)
- Affected code: 
  - `apps/api/src/health/health.controller.ts` (new)
  - `apps/api/src/app.module.ts` (register controller)
- No breaking changes
- No external dependencies required (basic implementation without @nestjs/terminus)
