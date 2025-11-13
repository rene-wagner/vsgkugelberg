# Change Proposal: Add ESLint and Prettier to Web Project

**Change ID:** `add-web-linting-tooling`  
**Status:** Draft  
**Created:** 2025-11-13  
**Author:** AI Assistant

## Summary

Add ESLint and Prettier to the web project to enforce code quality standards and consistent code formatting for Vue 3 components with TypeScript and Composition API.

## Why

The web project currently lacks automated code quality and formatting tools. This leads to:
- Inconsistent code style across the codebase
- Potential bugs and anti-patterns going unnoticed
- Manual code review burden for style issues
- Lack of enforced best practices for Vue 3 Composition API

Adding ESLint and Prettier will:
- Enforce consistent code formatting automatically
- Catch common bugs and anti-patterns early
- Enforce Vue 3 best practices and Composition API patterns
- Integrate with editor tooling for real-time feedback
- Reduce code review friction

## Scope

### In Scope
- ESLint configuration using flat config format (`eslint.config.mjs`)
- Prettier configuration file (`.prettierrc`)
- Integration between ESLint and Prettier
- Vue 3 linting rules for Composition API and TypeScript
- TypeScript ESLint support
- npm scripts for linting and formatting
- Configuration for Vue SFC (Single File Components)
- Ignore patterns for generated/build files

### Out of Scope
- Linting for the API project (already has ESLint)
- Pre-commit hooks (can be added in a future change)
- Auto-fix on save configuration (user preference)
- Changing existing code style (linting tools only)

## Dependencies

**Capabilities:**
- None (new capability: code-quality)

**External:**
- ESLint v9+
- Prettier v3+
- eslint-plugin-vue
- @typescript-eslint packages
- Vue 3 project structure

## Impact Assessment

**Benefits:**
- Improved code quality and consistency
- Early detection of potential bugs
- Better developer experience with editor integration
- Reduced code review time for style issues

**Risks:**
- Initial setup time
- Potential for many linting errors in existing code (low risk - new project)
- Team learning curve for new rules

**Breaking Changes:**
- None

## Implementation Notes

- Use ESLint flat config format (modern approach, future-proof)
- Base configuration on best practices from official Vue, TypeScript, and ESLint documentation
- Integrate Prettier through `eslint-config-prettier` to avoid rule conflicts
- Follow patterns from the API project's ESLint setup where applicable
- Configure for Vue 3.5+ with Composition API and `<script setup>` syntax
- Support `.vue`, `.ts`, and `.js` file types

## Alternatives Considered

1. **Using legacy `.eslintrc` format**: Rejected in favor of modern flat config
2. **Prettier-only without ESLint**: Rejected - ESLint provides bug detection, not just formatting
3. **Copying API config exactly**: Rejected - web project has different needs (Vue vs NestJS)

## Success Criteria

- ESLint and Prettier configurations are present and valid
- npm scripts for linting and formatting work correctly
- TypeScript files and Vue components can be linted
- Prettier and ESLint do not conflict
- Configuration passes `openspec validate --strict`
- Zero linting errors on initial run (project is new)
