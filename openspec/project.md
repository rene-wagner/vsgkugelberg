# Project Context

## Purpose
This is the monorepo for the sports club VSG Kugelberg e.V. website and related projects. The project aims to provide a modern web presence for the sports club.

## Tech Stack
- **Package Manager:** pnpm@10.22.0 with workspace support
- **Build System:** Turborepo 2.6+ for intelligent task orchestration and caching
- **Monorepo Structure:** Apps organized under `apps/*`
- **Frontend Framework:** Vue 3.5+ with Composition API
- **State Management:** Pinia 3.0+
- **Routing:** Vue Router 4.6+
- **Build Tool:** Vite 7.1+
- **Styling:** Tailwind CSS 4.1+ with native Vite plugin
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
- **Build Orchestration:** Turborepo manages task execution, caching, and dependencies
- **Frontend App Structure:**
  - `src/components/` - Vue components
  - `src/views/` - Page-level components
  - `src/router/` - Vue Router configuration
  - `src/stores/` - Pinia stores
  - `src/assets/` - Static assets and global styles
- **Component Organization:** Separate icon components in dedicated folder
- **Build Configuration:** Vite-based with Vue plugin and DevTools

### Build System (Turborepo)

#### When to Use Turborepo Commands
Use Turborepo commands when working with multiple packages or when you want to benefit from caching:
- `pnpm build` or `pnpm turbo build` - Build all apps in parallel with caching
- `pnpm dev` or `pnpm turbo dev` - Run all dev servers simultaneously
- `pnpm lint` or `pnpm turbo lint` - Lint all packages
- `pnpm type-check` or `pnpm turbo type-check` - Type check all packages
- `pnpm format` or `pnpm turbo format` - Format check all packages

#### When to Use Direct Package Commands
Use direct commands when working on a single package:
- `cd apps/web && pnpm build` - Build only the web app
- `cd apps/api && pnpm dev` - Run only the API dev server
- `pnpm --filter=web lint` - Lint only the web app using pnpm workspace

#### Turborepo Filtering
Filter tasks to specific packages using the `--filter` flag:
- `pnpm turbo build --filter=web` - Build only web app (with dependencies)
- `pnpm turbo dev --filter=api` - Run only API dev server
- `pnpm turbo lint --filter=web` - Lint only web app

#### Caching
Turborepo automatically caches task outputs:
- **Cache hits:** When nothing changes, tasks complete in milliseconds
- **Selective rebuilds:** Only changed packages are rebuilt
- **Cache location:** `.turbo/cache/` directory (gitignored)
- **Clear cache:** Delete `.turbo` directory if needed

#### Common Tasks
- **Build everything:** `pnpm build`
- **Start all dev servers:** `pnpm dev`
- **Lint everything:** `pnpm lint`
- **Type check everything:** `pnpm type-check`
- **Format check everything:** `pnpm format`
- **Auto-fix linting:** `pnpm lint:fix`
- **Auto-fix formatting:** `pnpm format:fix`

#### Troubleshooting
- **Cache issues:** Delete `.turbo` directory and rebuild
- **Dependency issues:** Run `pnpm install` at the root
- **Build failures:** Check individual package build with `cd apps/<name> && pnpm build`
- **Task not found:** Ensure the task is defined in the package's `package.json`

### Styling with Tailwind CSS

The web application uses Tailwind CSS v4 for styling, providing a utility-first approach with excellent performance.

#### Using Tailwind Utilities
Apply Tailwind utility classes directly in Vue component templates:
```vue
<template>
  <div class="mt-4 p-6 bg-blue-100 rounded-lg">
    <h2 class="text-2xl font-bold text-blue-900">Hello World</h2>
    <p class="text-gray-700 mt-2">Tailwind utilities work seamlessly!</p>
  </div>
</template>
```

#### Responsive Design
Use responsive prefixes for mobile-first design:
- `sm:` - Small screens (640px+)
- `md:` - Medium screens (768px+)
- `lg:` - Large screens (1024px+)
- `xl:` - Extra large screens (1280px+)

Example: `class="text-sm md:text-lg lg:text-xl"`

#### State Modifiers
Apply styles on interaction states:
- `hover:` - On mouse hover
- `focus:` - On keyboard focus
- `active:` - When actively pressed
- `disabled:` - When disabled

Example: `class="bg-blue-500 hover:bg-blue-600 focus:ring-2"`

#### When to Use Custom CSS
While Tailwind handles most styling needs, use custom CSS for:
- Complex animations that require `@keyframes`
- Global base styles (in `src/assets/base.css`)
- Component-specific styles that don't fit utility patterns

#### Configuration
- Tailwind is configured via the `@tailwindcss/vite` plugin in `vite.config.ts`
- Main import is at the top of `src/assets/main.css`
- No `tailwind.config.js` needed - v4 uses CSS-based configuration
- Theme customization can be done via CSS variables if needed

#### Performance Notes
- Tailwind v4 automatically purges unused utilities in production builds
- CSS bundle is typically < 10KB gzipped
- Hot Module Replacement (HMR) works instantly for style changes
- Turborepo caching includes Tailwind compilation

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
