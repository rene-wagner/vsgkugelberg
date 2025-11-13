# Implementation Tasks

## Overview
This document outlines the implementation tasks for adding Turborepo to the VSG Kugelberg monorepo. Tasks should be completed in order, with each task tested and verified before moving to the next.

## Tasks

- [x] **Install Turborepo**
  - Run `pnpm add turbo --save-dev --workspace-root` to install Turborepo at the root level
  - Verify installation by running `pnpm exec turbo --version`
  - Commit the updated `package.json` and `pnpm-lock.yaml`

- [x] **Create turbo.json configuration**
  - Create `turbo.json` at the repository root
  - Define the `$schema` property pointing to `https://turbo.build/schema.json`
  - Configure the task pipeline with the following tasks:
    - `build`: depends on `^build`, outputs to `["dist/**", ".next/**", ".vite/**", "build/**"]`
    - `dev`: persistent task, cache disabled
    - `lint`: can run in parallel, no outputs
    - `type-check`: depends on `^build`, no outputs
    - `format`: can run in parallel, no outputs
    - `format:fix`: cache disabled (side effects)
    - `lint:fix`: cache disabled (side effects)
  - Set global options: enable local caching
  - Validate JSON syntax

- [x] **Add root-level convenience scripts**
  - Edit root `package.json` to add scripts section
  - Add the following scripts:
    - `"build": "turbo build"`
    - `"dev": "turbo dev"`
    - `"lint": "turbo lint"`
    - `"type-check": "turbo type-check"`
    - `"format": "turbo format"`
    - `"format:fix": "turbo format:fix"`
    - `"lint:fix": "turbo lint:fix"`
  - Ensure these don't conflict with existing scripts

- [x] **Test build task**
  - Run `pnpm turbo build` and verify all apps build successfully
  - Check that both `apps/web` and `apps/api` are built
  - Verify build outputs are created in expected locations
  - Note build time for baseline

- [x] **Test caching functionality**
  - Run `pnpm turbo build` a second time without changes
  - Verify Turborepo reports cache hits (look for "FULL TURBO" or cache indicators)
  - Confirm build completes much faster (< 1 second)
  - Modify a file in `apps/web/src` and rebuild
  - Verify only `web` is rebuilt, `api` uses cache

- [x] **Test dev task**
  - Run `pnpm turbo dev` and verify both dev servers start
  - Check that web app is accessible (typically `localhost:5173`)
  - Check that api is accessible (typically `localhost:3000`)
  - Verify logs from both servers are visible
  - Test hot reload by making a change
  - Stop with Ctrl+C and verify clean shutdown

- [x] **Test filtering**
  - Run `pnpm turbo build --filter=web` and verify only web builds
  - Run `pnpm turbo dev --filter=api` and verify only api starts
  - Run `pnpm turbo lint --filter=web` and verify only web is linted
  - Confirm filtering works as expected

- [x] **Test linting and type-checking**
  - Run `pnpm turbo lint` and verify all packages are linted
  - Run `pnpm turbo type-check` and verify TypeScript checks all packages
  - Run `pnpm turbo format` and verify Prettier checks all packages
  - Introduce a temporary lint error and verify it's caught
  - Fix the error and verify lint passes

- [x] **Verify existing workflows still work**
  - Test direct package commands: `cd apps/web && pnpm build`
  - Test pnpm workspace commands: `pnpm --filter=web build`
  - Verify Makefile `clean` target still works
  - Ensure all original functionality is preserved

- [x] **Update project documentation**
  - Update `openspec/project.md` to mention Turborepo in the tech stack
  - Add a section explaining when to use `turbo` commands vs `pnpm` commands
  - Document common Turborepo commands and filters
  - Explain caching and how to clear the cache if needed
  - Add troubleshooting tips for common issues

- [x] **Update .gitignore if needed**
  - Ensure `.turbo` directory is in `.gitignore`
  - Add any other Turborepo-related ignore patterns
  - Verify no cache files are committed

- [x] **Final validation**
  - Run `pnpm install` from scratch in a clean directory
  - Run `pnpm turbo build` and verify success
  - Run `pnpm turbo lint` and verify no errors
  - Run `pnpm turbo type-check` and verify no errors
  - Check that all tasks complete successfully
  - Verify documentation is accurate and complete

- [x] **Create commit with changes**
  - Stage all changes: `turbo.json`, `package.json`, `pnpm-lock.yaml`, docs
  - Write descriptive commit message following project conventions
  - Push to feature branch and create PR if applicable
  - Write descriptive commit message following project conventions
  - Push to feature branch and create PR if applicable

## Dependencies
- All tasks must be completed sequentially as some depend on previous steps
- Testing tasks depend on configuration tasks being complete
- Documentation should be updated after all functionality is verified

## Validation Criteria
- ✅ `pnpm turbo build` successfully builds all applications
- ✅ Cache hits occur on repeated builds
- ✅ `pnpm turbo dev` starts all development servers
- ✅ Filtering works for individual packages
- ✅ All existing workflows continue to function
- ✅ Documentation is clear and accurate
- ✅ No cache files are committed to git

## Notes
- If any task fails, investigate and resolve before proceeding
- Keep commits focused and atomic where possible
- Test thoroughly on your local machine before pushing
- Consider running tasks in parallel where safe (lint, format)
