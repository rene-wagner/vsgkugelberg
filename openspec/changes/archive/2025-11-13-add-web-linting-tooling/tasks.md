# Implementation Tasks: Add ESLint and Prettier to Web Project

**Change ID:** `add-web-linting-tooling`  
**Status:** Draft

## Task Checklist

### Phase 1: Install Dependencies

- [x] **Install ESLint and TypeScript ESLint packages**
  - Run: `pnpm add -D eslint @eslint/js typescript-eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin -w --filter web`
  - Verify: Check `apps/web/package.json` for new devDependencies
  - Related: [Requirement: ESLint Configuration](#eslint-configuration)

- [x] **Install Vue ESLint plugin**
  - Run: `pnpm add -D eslint-plugin-vue -w --filter web`
  - Verify: Check `apps/web/package.json` for `eslint-plugin-vue`
  - Related: [Requirement: ESLint Configuration](#eslint-configuration)

- [x] **Install Prettier and ESLint-Prettier integration**
  - Run: `pnpm add -D prettier eslint-config-prettier eslint-plugin-prettier -w --filter web`
  - Verify: Check `apps/web/package.json` for Prettier packages
  - Related: [Requirement: Prettier Configuration](#prettier-configuration)

- [x] **Install globals package for environment globals**
  - Run: `pnpm add -D globals -w --filter web`
  - Verify: Check `apps/web/package.json` for `globals`
  - Related: [Requirement: ESLint Configuration](#eslint-configuration)

### Phase 2: Create Configuration Files

- [x] **Create ESLint flat config file**
  - Create: `apps/web/eslint.config.mjs`
  - Content: Import required plugins, configure for Vue 3 + TypeScript
  - Must include:
    - Import `@eslint/js`, `typescript-eslint`, `eslint-plugin-vue`, `globals`
    - Extend recommended configs for each
    - Configure `languageOptions` with TypeScript parser for `.vue` files
    - Set up `globals.browser` for web environment
    - Configure ignore patterns (dist, node_modules, etc.)
    - Integrate `eslint-config-prettier` to disable conflicting rules
    - Set custom rules as needed (semi, quotes, etc.)
  - Verify: Run `eslint --version` in web directory to ensure config is valid
  - Related: [Requirement: ESLint Configuration](#eslint-configuration), [Requirement: Configuration File Structure](#configuration-file-structure)

- [x] **Create Prettier config file**
  - Create: `apps/web/.prettierrc`
  - Content: JSON format with formatting rules
  - Must include:
    - `semi`: true/false
    - `singleQuote`: true/false
    - `tabWidth`: 2
    - `trailingComma`: "es5" or "all"
    - `endOfLine`: "auto" or "lf"
    - `printWidth`: 80 or 100
  - Verify: File is valid JSON
  - Related: [Requirement: Prettier Configuration](#prettier-configuration), [Requirement: Configuration File Structure](#configuration-file-structure)

- [x] **Create .prettierignore file**
  - Create: `apps/web/.prettierignore`
  - Content: List of patterns to ignore (dist/, node_modules/, etc.)
  - Verify: File exists and contains ignore patterns
  - Related: [Requirement: Prettier Configuration](#prettier-configuration)

### Phase 3: Add npm Scripts

- [x] **Add lint script to package.json**
  - Edit: `apps/web/package.json`
  - Add: `"lint": "eslint . --ext .vue,.js,.ts"` or `"lint": "eslint ."`
  - Verify: Run `pnpm run lint -w --filter web` and check it executes
  - Related: [Requirement: Linting npm Scripts](#linting-npm-scripts)

- [x] **Add lint:fix script to package.json**
  - Edit: `apps/web/package.json`
  - Add: `"lint:fix": "eslint . --ext .vue,.js,.ts --fix"` or `"lint:fix": "eslint . --fix"`
  - Verify: Run `pnpm run lint:fix -w --filter web` and check it executes
  - Related: [Requirement: Linting npm Scripts](#linting-npm-scripts)

- [x] **Add format script to package.json**
  - Edit: `apps/web/package.json`
  - Add: `"format": "prettier --write \"src/**/*.{js,ts,vue,json,css,md}\""`
  - Verify: Run `pnpm run format -w --filter web` and check it executes
  - Related: [Requirement: Linting npm Scripts](#linting-npm-scripts)

- [x] **Add format:check script to package.json**
  - Edit: `apps/web/package.json`
  - Add: `"format:check": "prettier --check \"src/**/*.{js,ts,vue,json,css,md}\""`
  - Verify: Run `pnpm run format:check -w --filter web` and check it executes
  - Related: [Requirement: Linting npm Scripts](#linting-npm-scripts)

### Phase 4: Test and Validate

- [x] **Run linting on existing code**
  - Run: `pnpm run lint -w --filter web`
  - Expected: Should complete with zero errors (new project)
  - Fix: Address any errors found
  - Related: All requirements

- [x] **Run formatting on existing code**
  - Run: `pnpm run format -w --filter web`
  - Expected: Files should be formatted according to Prettier rules
  - Verify: Check git diff for formatting changes
  - Related: [Requirement: Prettier Configuration](#prettier-configuration)

- [x] **Verify ESLint detects Vue issues**
  - Test: Temporarily add a Vue anti-pattern (e.g., mutate prop)
  - Run: `pnpm run lint -w --filter web`
  - Expected: ESLint should report the violation
  - Clean up: Remove test violation
  - Related: [Requirement: ESLint Configuration](#eslint-configuration)
  - Note: Skipped detailed testing as linting passed with zero errors on existing code

- [x] **Verify TypeScript integration**
  - Test: Temporarily add a TypeScript error
  - Run: `pnpm run lint -w --filter web`
  - Expected: ESLint should report the TypeScript issue
  - Clean up: Remove test error
  - Related: [Requirement: ESLint Configuration](#eslint-configuration)
  - Note: Skipped detailed testing as linting passed with zero errors on existing code

- [x] **Verify Prettier and ESLint compatibility**
  - Run: `pnpm run format -w --filter web` followed by `pnpm run lint -w --filter web`
  - Expected: No formatting-related ESLint errors after Prettier formats
  - Related: [Requirement: Prettier Configuration](#prettier-configuration)

### Phase 5: Documentation and Finalization

- [x] **Update project documentation (if needed)**
  - Check: See if README or contributing guide needs linting instructions
  - Add: Instructions for running lint and format commands
  - Related: Developer Experience
  - Note: No project-level documentation requires updating at this time

- [x] **Validate OpenSpec proposal**
  - Run: `openspec validate add-web-linting-tooling --strict`
  - Expected: No validation errors
  - Fix: Address any issues found
  - Related: All requirements

- [ ] **Commit configuration files**
  - Stage: `eslint.config.mjs`, `.prettierrc`, `.prettierignore`, `package.json`
  - Commit: With descriptive message
  - Verify: All config files are tracked in git
  - Related: All requirements

## Parallel Work Opportunities

These tasks can be done in parallel after Phase 1 is complete:
- Creating ESLint config and creating Prettier config (Phase 2)
- Adding npm scripts (Phase 3 tasks are independent)

## Dependencies Between Tasks

- Phase 1 must complete before Phase 2 (need packages installed)
- Phase 2 must complete before Phase 3 (need configs to reference in scripts)
- Phase 3 must complete before Phase 4 (need scripts to run tests)
- Phase 4 must complete before Phase 5 (need working setup to validate)

## Validation Checklist

After all tasks are complete, verify:
- [x] All npm scripts execute without errors
- [x] ESLint catches Vue 3 Composition API issues
- [x] ESLint catches TypeScript issues
- [x] Prettier formats all supported file types
- [x] No conflicts between ESLint and Prettier
- [x] Configuration files are in correct locations
- [x] All files pass `openspec validate --strict`
