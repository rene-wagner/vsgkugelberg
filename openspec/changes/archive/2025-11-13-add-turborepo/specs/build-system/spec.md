# Build System Specification

## Overview
This specification defines the build orchestration system for the VSG Kugelberg monorepo, powered by Turborepo.

## ADDED Requirements

### Requirement: Turborepo Installation and Configuration
**Priority**: High  
**Category**: Infrastructure

The monorepo SHALL have Turborepo installed and configured as the build orchestration tool.

#### Scenario: Developer installs dependencies
**Given** the developer has cloned the repository  
**And** the developer runs `pnpm install` at the root  
**Then** Turborepo should be installed as a dev dependency  
**And** the `turbo` CLI should be available in node_modules/.bin  

#### Scenario: Turborepo configuration exists
**Given** the repository is set up with Turborepo  
**When** the developer looks at the root directory  
**Then** a `turbo.json` file should exist at the root level  
**And** the file should define a pipeline with common tasks  

---

### Requirement: Task Pipeline Definition
**Priority**: High  
**Category**: Build

The build system SHALL define a clear task pipeline that orchestrates common development tasks across all workspace packages.

#### Scenario: Building all applications
**Given** the developer is at the root of the monorepo  
**When** the developer runs `pnpm turbo build`  
**Then** all applications with a build script should be built  
**And** builds should happen in the correct dependency order  
**And** builds should run in parallel where possible  

#### Scenario: Running development servers
**Given** the developer is at the root of the monorepo  
**When** the developer runs `pnpm turbo dev`  
**Then** all development servers should start  
**And** the dev task should be marked as persistent  
**And** Turborepo should not wait for persistent tasks to complete  

#### Scenario: Linting all code
**Given** the developer is at the root of the monorepo  
**When** the developer runs `pnpm turbo lint`  
**Then** ESLint should run across all workspace packages  
**And** linting should happen in parallel across packages  
**And** any linting errors should be reported clearly  

#### Scenario: Type checking all TypeScript
**Given** the developer is at the root of the monorepo  
**When** the developer runs `pnpm turbo type-check`  
**Then** TypeScript type checking should run for all packages  
**And** type errors from all packages should be aggregated  

#### Scenario: Format checking all code
**Given** the developer is at the root of the monorepo  
**When** the developer runs `pnpm turbo format`  
**Then** Prettier format checks should run for all packages  
**And** formatting issues should be reported  

---

### Requirement: Intelligent Caching
**Priority**: High  
**Category**: Performance

The build system SHALL cache task outputs to avoid redundant work and speed up repeated builds.

#### Scenario: Cache hit on unchanged build
**Given** the developer has built the project once  
**And** no source files have been modified  
**When** the developer runs `pnpm turbo build` again  
**Then** Turborepo should use cached results  
**And** the build should complete in less than 1 second  
**And** the terminal should indicate cache hits  

#### Scenario: Cache invalidation on source changes
**Given** the developer has built the project once  
**When** the developer modifies a source file in `apps/web/src/`  
**And** runs `pnpm turbo build`  
**Then** Turborepo should rebuild only the affected package  
**And** unaffected packages should use cached results  

#### Scenario: Cache configuration for build outputs
**Given** the turbo.json configuration file  
**When** examining the build task definition  
**Then** the outputs array should include appropriate build directories  
**And** outputs should include patterns like `dist/**`, `.next/**`, etc.  
**And** cache should exclude frequently-changing files like logs  

---

### Requirement: Workspace Filtering
**Priority**: Medium  
**Category**: Developer Experience

The build system SHALL support running tasks for specific workspaces using filters.

#### Scenario: Building a single application
**Given** the developer wants to build only the web app  
**When** the developer runs `pnpm turbo build --filter=web`  
**Then** only the web application should be built  
**And** its dependencies should be built first if needed  

#### Scenario: Running dev server for single app
**Given** the developer wants to work on the API only  
**When** the developer runs `pnpm turbo dev --filter=api`  
**Then** only the API dev server should start  

---

### Requirement: Task Dependencies
**Priority**: High  
**Category**: Build

The build system SHALL correctly handle task dependencies to ensure tasks run in the proper order.

#### Scenario: Topological build order
**Given** the monorepo has multiple packages with interdependencies  
**When** running `pnpm turbo build`  
**Then** packages should build in topological order  
**And** dependency packages should complete before dependent packages  

#### Scenario: Build depends on dependency builds
**Given** a package depends on another workspace package  
**When** building the dependent package  
**Then** the dependency's build task should complete first  
**And** this should be defined via `dependsOn: ["^build"]`  

---

### Requirement: Root-Level Scripts
**Priority**: Medium  
**Category**: Developer Experience

The root package.json SHALL provide convenience scripts for common Turborepo operations.

#### Scenario: Root scripts are available
**Given** the developer is at the root of the monorepo  
**When** the developer runs `pnpm run` to list scripts  
**Then** scripts for `build`, `dev`, `lint`, `type-check`, and `format` should be available  
**And** each script should delegate to the corresponding `turbo` command  

#### Scenario: Running root build script
**Given** the developer wants to build all apps  
**When** the developer runs `pnpm build` (or `pnpm run build`)  
**Then** it should execute `turbo build`  
**And** all applications should be built  

---

### Requirement: Compatibility with Existing Workflows
**Priority**: High  
**Category**: Integration

The build system SHALL NOT break existing workflows and SHALL work alongside existing tools.

#### Scenario: Individual app scripts still work
**Given** the developer wants to build just the web app manually  
**When** the developer runs `cd apps/web && pnpm build`  
**Then** the web app should build successfully  
**And** this should work independently of Turborepo  

#### Scenario: pnpm workspace commands work
**Given** the developer uses pnpm workspace commands  
**When** running `pnpm --filter=web build`  
**Then** it should build the web app without using Turborepo  
**And** this should remain a valid workflow  

#### Scenario: Existing tools are preserved
**Given** the repository uses Vite, NestJS CLI, ESLint, Prettier  
**When** Turborepo is installed  
**Then** all existing tools should continue to work  
**And** their configurations should not require changes  
**And** individual package.json scripts should remain unchanged  

---

### Requirement: Configuration Best Practices
**Priority**: Medium  
**Category**: Configuration

The Turborepo configuration SHALL follow best practices for monorepo management.

#### Scenario: Persistent tasks are marked correctly
**Given** the turbo.json configuration  
**When** examining the dev task  
**Then** it should have `"persistent": true`  
**And** it should have `"cache": false`  
**And** this prevents Turborepo from waiting indefinitely  

#### Scenario: Cache is disabled for non-cacheable tasks
**Given** the turbo.json configuration  
**When** examining tasks like `dev`, `format:fix`, `lint:fix`  
**Then** these tasks should have `"cache": false`  
**And** this ensures side-effects are always executed  

#### Scenario: Output directories are specified
**Given** the turbo.json build task configuration  
**When** examining the outputs array  
**Then** it should include common build output patterns  
**And** it should exclude node_modules and cache directories  

---

### Requirement: Documentation
**Priority**: Medium  
**Category**: Documentation

The project SHALL include clear documentation on using Turborepo.

#### Scenario: Developer reads monorepo documentation
**Given** a developer new to the project  
**When** they look for build documentation  
**Then** they should find information about Turborepo  
**And** understand when to use `turbo` vs `pnpm` commands  
**And** know how to run tasks for specific packages  

#### Scenario: Cache management is documented
**Given** a developer encounters cache issues  
**When** they consult the documentation  
**Then** they should learn how to clear the cache  
**And** understand how caching works  
**And** know the command `turbo prune` or manual cache deletion  
