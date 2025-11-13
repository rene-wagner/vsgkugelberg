# Project Context

## Purpose
This is the monorepo for the sports club VSG Kugelberg e.V. website and related projects. The project aims to provide a modern web presence for the sports club.

## Tech Stack
- **Package Manager:** pnpm with workspace support
- **Monorepo Structure:** Apps organized under `apps/*`
- **Frontend Framework:** Vue 3.5+ with Composition API
- **State Management:** Pinia 3.0+
- **Routing:** Vue Router 4.6+
- **Build Tool:** Vite 7.1+
- **TypeScript:** 5.9 with strict type checking
- **Node.js:** ^20.19.0 || >=22.12.0
- **Development Tools:** 
  - Vue DevTools plugin for Vite
  - vue-tsc for type checking
  - npm-run-all2 for script orchestration

## Project Conventions

### Code Style
- **Language:** TypeScript throughout the project
- **Module System:** ES Modules (type: "module")
- **Import Paths:** Use `@/` alias for src directory imports
- **File Extensions:** .ts for TypeScript, .vue for Vue components
- **TypeScript Config:** Extends @vue/tsconfig and @tsconfig/node22

### Architecture Patterns
- **Monorepo:** pnpm workspace with apps under `apps/*`
- **Frontend App Structure:**
  - `src/components/` - Vue components
  - `src/views/` - Page-level components
  - `src/router/` - Vue Router configuration
  - `src/stores/` - Pinia stores
  - `src/assets/` - Static assets and global styles
- **Component Organization:** Separate icon components in dedicated folder
- **Build Configuration:** Vite-based with Vue plugin and DevTools

### Testing Strategy
[To be defined - currently no testing framework configured]

### Git Workflow
[To be defined - add your branching strategy and commit conventions here]

## Domain Context
This is a website for VSG Kugelberg e.V., a German sports club. Context includes:
- German sports club terminology and culture
- Community engagement and public information sharing

## Important Constraints
- **Node Version:** Must use Node.js ^20.19.0 or >=22.12.0
- **Package Manager:** Must use pnpm (not npm or yarn)
- **TypeScript:** All code must be properly typed (no `any`)
- **Build Process:** Type checking must pass before production builds

## External Dependencies
- **Vue Ecosystem:** Official Vue 3 tooling and libraries
- **Vite:** For development server and production builds
- Currently no external APIs or services configured (api folder is empty)
