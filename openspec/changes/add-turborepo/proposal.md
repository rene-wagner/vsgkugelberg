# Proposal: Add Turborepo Build System

## Status
**Draft** - Awaiting review and approval

## Motivation
The VSG Kugelberg monorepo currently uses pnpm workspaces for package management but lacks an intelligent build orchestration system. As the project grows to include multiple applications (web, api) and potentially shared packages, we need a build system that:

1. **Improves developer experience** - Developers currently must manually build dependencies in the correct order or run builds individually per app
2. **Accelerates build times** - No caching mechanism exists; every build runs from scratch even when nothing has changed
3. **Enables efficient CI/CD** - Without intelligent task orchestration, CI pipelines build everything regardless of what changed
4. **Supports scaling** - As more apps and shared packages are added, manual coordination becomes unsustainable
5. **Provides task parallelization** - Tasks that don't depend on each other could run in parallel but currently run sequentially

Turborepo is the industry-standard solution for JavaScript/TypeScript monorepos, offering intelligent caching, parallel task execution, and seamless integration with pnpm workspaces.

## Goals
- Install and configure Turborepo as the build orchestrator for the monorepo
- Define a task pipeline for common operations (build, dev, lint, type-check, format)
- Enable local and remote caching to speed up repeated builds
- Maintain compatibility with existing pnpm workspace configuration
- Preserve all existing scripts and workflows while adding Turborepo layer
- Provide clear documentation for developers on using Turborepo commands

## Non-Goals
- Migrating from pnpm to a different package manager
- Restructuring the monorepo directory layout
- Adding new shared packages or libraries (future work)
- Implementing remote cache server (can be added later)
- Changing build tools for individual apps (Vite for web, NestJS CLI for api)

## Approach

### Installation
Install `turbo` as a dev dependency at the root level using pnpm.

### Configuration
Create a `turbo.json` at the root level that defines:
- **Pipeline tasks**: build, dev, lint, type-check, format, format:fix, lint:fix
- **Task dependencies**: ensure builds depend on dependencies' builds (`^build`)
- **Cache outputs**: specify output directories (.next, dist, .vite, etc.)
- **Cache configuration**: enable local caching with appropriate cache settings
- **Persistent tasks**: mark dev servers as persistent so they don't block

### Root Scripts
Add convenience scripts to the root `package.json`:
- `turbo build` - Build all apps and packages
- `turbo dev` - Run all dev servers
- `turbo lint` - Lint all packages
- `turbo type-check` - Type check all packages
- `turbo format` - Format check all packages

### Integration Points
- Preserve existing pnpm workspace configuration
- Keep individual app scripts unchanged (developers can still use them directly)
- Update Makefile if needed to use Turborepo commands
- Ensure compatibility with existing linting and formatting tools

### Documentation
Update project documentation to explain:
- How to run tasks using Turborepo
- How caching works
- How to run tasks for specific packages using filters
- When to use `turbo` vs direct `pnpm` commands

## Impact

### Developer Experience
- **Before**: `cd apps/web && pnpm build && cd ../api && pnpm build`
- **After**: `pnpm turbo build` (runs in parallel, uses cache)

### Build Performance
- Initial builds: Same speed as before
- Subsequent builds: Near-instant if nothing changed
- Parallel execution: Up to 2x faster for concurrent tasks

### CI/CD
- Enables selective task execution based on changed files
- Remote caching can be added later for team-wide cache sharing
- Reduced CI times through intelligent task orchestration

### Learning Curve
- Minimal - developers can continue using existing commands
- Optional - `turbo` commands are additive, not replacing existing workflows
- Clear - documentation will explain when and why to use Turborepo

## Alternatives Considered

### Nx
- **Pros**: Feature-rich, excellent for large enterprises
- **Cons**: More opinionated, steeper learning curve, heavier setup
- **Decision**: Turborepo is simpler, more focused, and sufficient for our needs

### Rush
- **Pros**: Microsoft-backed, good for large orgs
- **Cons**: More complex setup, less community adoption
- **Decision**: Turborepo has better DX and stronger ecosystem

### Plain pnpm scripts
- **Pros**: Simplest, no new tools
- **Cons**: No caching, manual dependency management, no parallelization
- **Decision**: Doesn't solve the core problems we're facing

### Lerna
- **Pros**: Mature, well-known
- **Cons**: Primarily for package publishing, less focused on builds, slower adoption
- **Decision**: Turborepo is more modern and build-focused

## Dependencies
- Requires pnpm workspace configuration (already in place)
- Compatible with existing build tools (Vite, NestJS CLI)
- No breaking changes to existing workflows

## Success Metrics
- ✅ Turborepo successfully installs and runs
- ✅ All existing build commands continue to work
- ✅ `pnpm turbo build` successfully builds all apps
- ✅ Cache hits occur on repeated builds with no changes
- ✅ Parallel task execution works correctly
- ✅ Documentation is clear and developers understand how to use it

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Cache invalidation issues | Low | Medium | Use conservative cache configuration, document how to clear cache |
| Developer confusion about when to use turbo | Low | Low | Clear documentation, make both approaches work |
| Build failures due to incorrect task graph | Low | High | Thorough testing, validate task dependencies |
| Performance regression | Very Low | Medium | Benchmark before/after, cache is optional |

## Timeline
- **Setup and configuration**: 1-2 hours
- **Testing and validation**: 1 hour
- **Documentation**: 30 minutes
- **Total**: ~3-4 hours

## Related Changes
- None currently
- Future: Could add shared packages that benefit from Turborepo's dependency management
- Future: Could add remote caching for team-wide performance benefits
