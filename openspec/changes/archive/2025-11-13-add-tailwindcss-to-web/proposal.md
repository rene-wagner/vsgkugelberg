# Proposal: Add Tailwind CSS v4 to Web Application

## Why

The VSG Kugelberg web application currently uses custom CSS with minimal styling utilities. As the application grows, this approach leads to:

1. **Inconsistent styling** - No design system or standardized spacing/colors leads to visual inconsistencies
2. **Slower development** - Writing custom CSS for every component is time-consuming
3. **Larger CSS bundles** - Custom CSS accumulates unused styles that aren't tree-shaken
4. **Maintenance burden** - Refactoring styles requires searching across multiple CSS files
5. **Poor responsive design** - No standardized breakpoint system for mobile-first development

Tailwind CSS v4 is the latest generation utility-first CSS framework that:
- Provides a comprehensive design system out of the box
- Enables rapid UI development with utility classes
- Automatically purges unused styles for optimal bundle sizes
- Integrates seamlessly with Vite through native plugin support
- Offers improved performance over v3 with the new engine
- Eliminates PostCSS configuration complexity with the Vite plugin

## What Changes

This proposal adds Tailwind CSS v4 to the `web` application in the monorepo:

### Installation
- Install `tailwindcss` and `@tailwindcss/vite` packages in `apps/web`
- Configure the `@tailwindcss/vite` plugin in `vite.config.ts`

### Styling Integration
- Replace or augment existing CSS imports with Tailwind directives
- Import Tailwind CSS in the main stylesheet (`assets/main.css`)
- Preserve existing custom styles where needed using `@layer` directives

### Configuration
- No `tailwind.config.js` required - v4 uses CSS-based configuration
- Use CSS variables and `@theme` directive for customization if needed
- Ensure Prettier integration works with Tailwind class sorting

### Developer Experience
- Update linting to work with Tailwind classes
- Ensure hot module replacement (HMR) works correctly
- Verify Turborepo caching compatibility

## Scope

**In Scope:**
- Installing Tailwind CSS v4 in the `web` application
- Configuring Vite plugin for Tailwind processing
- Importing Tailwind base styles
- Verifying build and dev workflows work correctly
- Updating documentation with Tailwind usage guidelines

**Out of Scope:**
- Rewriting existing components to use Tailwind (future work)
- Adding Tailwind to the `api` application (not applicable)
- Installing Tailwind plugins or extensions (can be added later)
- Customizing the default theme (can be done incrementally)
- Creating a component library (future work)

## Alternatives Considered

### Alternative 1: Continue with Custom CSS
**Pros:** No new dependencies, full control over styles
**Cons:** Slower development, inconsistent design system, maintenance burden
**Decision:** Rejected - doesn't scale well for growing application

### Alternative 2: Use Tailwind CSS v3
**Pros:** More mature, larger ecosystem
**Cons:** Requires PostCSS configuration, slower build times, less performant
**Decision:** Rejected - v4 offers significant improvements and simpler setup with Vite

### Alternative 3: Use UnoCSS
**Pros:** Extremely fast, flexible configuration
**Cons:** Smaller ecosystem, different API, less documentation
**Decision:** Rejected - Tailwind has better documentation and community support

### Alternative 4: Use CSS-in-JS (styled-components, emotion)
**Pros:** Co-located styles, dynamic styling
**Cons:** Runtime overhead, larger bundle sizes, not as performant
**Decision:** Rejected - utility-first approach is better for this use case

## Implementation Notes

- **Vite Integration**: v4 uses a native Vite plugin (`@tailwindcss/vite`) instead of PostCSS
- **No Config File**: Unlike v3, v4 doesn't require `tailwind.config.js` by default
- **CSS-based Theme**: Customization is done via CSS variables and `@theme` directive
- **Compatibility**: Works with existing Vue 3 components and Vite setup
- **Performance**: v4 has faster build times due to rewritten Rust-based engine

## Success Criteria

- ✅ Tailwind CSS v4 installed and configured in `apps/web`
- ✅ Development server (`pnpm dev`) works with HMR
- ✅ Production build (`pnpm build`) successfully compiles
- ✅ Tailwind utility classes can be used in Vue components
- ✅ Existing styles continue to work alongside Tailwind
- ✅ Linting and formatting work correctly
- ✅ Turborepo caching remains functional
- ✅ Documentation updated with Tailwind usage guidelines
