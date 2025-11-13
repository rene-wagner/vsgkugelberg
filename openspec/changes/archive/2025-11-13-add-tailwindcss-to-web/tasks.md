# Implementation Tasks

## Overview
This document outlines the implementation tasks for adding Tailwind CSS v4 to the VSG Kugelberg web application. Tasks should be completed in order, with each task tested and verified before moving to the next.

## Tasks

- [x] **Install Tailwind CSS v4 packages**
  - Navigate to `apps/web` directory
  - Run `pnpm add -D tailwindcss @tailwindcss/vite`
  - Verify packages are added to `devDependencies` in `package.json`
  - Verify versions are Tailwind CSS 4.x and compatible `@tailwindcss/vite`
  - Run `pnpm install` at the root to update lockfile

- [x] **Configure Vite plugin**
  - Open `apps/web/vite.config.ts`
  - Add import statement: `import tailwindcss from '@tailwindcss/vite'`
  - Add `tailwindcss()` to the `plugins` array before other plugins
  - Ensure proper TypeScript types are recognized
  - Save the file and verify no TypeScript errors

- [x] **Import Tailwind CSS in main stylesheet**
  - Open `apps/web/src/assets/main.css`
  - Add `@import "tailwindcss";` at the very top of the file
  - Keep existing custom CSS below the import
  - Consider organizing custom CSS with comments for clarity
  - Save the file

- [x] **Test development server**
  - Navigate to `apps/web`
  - Run `pnpm dev` to start the development server
  - Verify the server starts without errors
  - Check the terminal output for Tailwind processing
  - Verify no console errors in the browser
  - Check that existing pages still render correctly

- [x] **Test Tailwind utility classes**
  - Open an existing Vue component (e.g., `src/App.vue` or `src/components/HelloWorld.vue`)
  - Add a simple Tailwind utility class to test (e.g., `class="text-blue-500 font-bold"`)
  - Check the browser to verify the styles are applied
  - Verify the utility classes render correctly
  - Test responsive classes (e.g., `md:text-lg`)
  - Test state classes (e.g., `hover:bg-blue-100`)
  - Remove test classes or keep if desired

- [x] **Verify Hot Module Replacement**
  - With dev server running, modify a Tailwind class in a Vue component
  - Verify the browser updates without full refresh (< 500ms)
  - Verify component state is preserved
  - Test modifying custom CSS in `main.css`
  - Verify HMR works for custom CSS changes as well

- [x] **Test production build**
  - Navigate to `apps/web`
  - Run `pnpm build` to create a production build
  - Verify the build completes without errors
  - Check the `dist/` output directory is created
  - Examine the generated CSS file size (should be optimized)
  - Verify unused utilities are purged (check output file)

- [x] **Test Turborepo integration**
  - Run `pnpm turbo build` from the root
  - Verify the web app builds successfully
  - Run `pnpm turbo build` again without changes
  - Verify Turborepo uses cached results (FULL TURBO)
  - Make a small change to a Vue component
  - Run `pnpm turbo build` again
  - Verify cache invalidation works and rebuild occurs

- [x] **Verify linting works**
  - Navigate to `apps/web`
  - Run `pnpm lint` to check for linting errors
  - Verify no false positives for Tailwind classes
  - Verify existing ESLint rules still work
  - Fix any legitimate linting issues
  - Run `pnpm turbo lint` from root to verify monorepo linting

- [x] **Verify formatting works**
  - Navigate to `apps/web`
  - Run `pnpm format` to check formatting
  - Verify Prettier doesn't break Tailwind classes
  - Verify existing formatting rules still apply
  - Run `pnpm format:fix` if needed
  - Verify formatted code still works correctly

- [x] **Verify TypeScript type checking**
  - Navigate to `apps/web`
  - Run `pnpm type-check` to verify types
  - Verify no TypeScript errors related to Tailwind
  - Check `vite.config.ts` has correct types
  - Verify Vue component types still work
  - Run `pnpm turbo type-check` from root

- [x] **Test with existing components**
  - Open each existing component in `apps/web/src/components/`
  - Verify they render correctly with Tailwind installed
  - Test all routes in `apps/web/src/views/`
  - Verify existing custom styles still work
  - Check for any visual regressions
  - Test responsive behavior at different screen sizes

- [x] **Update project documentation**
  - Open `openspec/project.md`
  - Add Tailwind CSS v4 to the Tech Stack section
  - Add a new "Styling" section with Tailwind guidelines
  - Document when to use Tailwind vs custom CSS
  - Include examples of common Tailwind patterns
  - Document responsive design best practices
  - Add troubleshooting tips for common issues

- [x] **Create example component (optional)**
  - Create a new component demonstrating Tailwind usage
  - Show responsive design patterns (e.g., `sm:`, `md:`, `lg:`)
  - Show state patterns (e.g., `hover:`, `focus:`, `active:`)
  - Show common layout patterns (flexbox, grid)
  - Show color and typography utilities
  - Document the example in comments

- [ ] **Test GitHub Actions CI**
  - Commit and push changes to a branch
  - Verify CI workflow runs successfully
  - Check that lint job passes
  - Check that format-check job passes
  - Verify build completes in CI environment
  - Check for any warnings or errors in CI logs

- [ ] **Commit changes**
  - Stage all modified files
  - Write descriptive commit message
  - Include Tailwind CSS v4 installation in commit message
  - Mention configuration changes
  - Commit the changes
  - Push to repository

- [ ] **Final validation**
  - Clone repository to fresh directory (or pull changes)
  - Run `pnpm install` at root
  - Run `pnpm turbo build` to build everything
  - Run `pnpm turbo dev` to start all dev servers
  - Test web application in browser
  - Verify all Tailwind utilities work
  - Verify existing functionality is preserved
  - Check that CI passes on GitHub

## Dependencies
- Requires existing Vite setup (already in place)
- Requires existing Vue 3 setup (already in place)
- Requires existing Turborepo setup (already in place)
- Requires pnpm workspace configuration (already in place)

## Validation Criteria
- ✅ Tailwind CSS v4 and `@tailwindcss/vite` installed in `apps/web/package.json`
- ✅ Vite config includes `tailwindcss()` plugin
- ✅ Main CSS file imports `@import "tailwindcss";`
- ✅ Development server runs without errors
- ✅ Tailwind utility classes work in Vue components
- ✅ Hot Module Replacement works for CSS changes
- ✅ Production build completes successfully
- ✅ CSS output is optimized and minified
- ✅ Turborepo caching works correctly
- ✅ Linting and formatting work correctly
- ✅ TypeScript type checking passes
- ✅ Existing components and styles still work
- ✅ Documentation updated with Tailwind guidelines
- ✅ CI/CD pipeline passes all checks

## Notes
- Tailwind CSS v4 uses a native Vite plugin, not PostCSS
- No `tailwind.config.js` file is needed for basic setup
- Customization is done via CSS variables and `@theme` directive if needed
- The `@import "tailwindcss";` statement should be at the top of `main.css`
- Existing custom CSS can coexist with Tailwind utilities
- v4 automatically includes features that required plugins in v3
