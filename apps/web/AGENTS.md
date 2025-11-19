# App: Web Frontend

This directory contains the frontend web application for the VSG Kugelberg platform.

## Overview

The frontend is a modern Single Page Application (SPA) built with **Vue 3**. It provides the user interface for interacting with the platform.

## Key Technologies

- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router
- **Styling**: TailwindCSS
- **Language**: TypeScript

## Project Structure

- **`src/components`**: Reusable Vue components.
- **`src/views`**: Page-level components matched to routes.
- **`src/stores`**: Pinia state stores.
- **`src/router`**: Routing configuration.
- **`src/assets`**: Static assets and global styles.

## Key Scripts

- `pnpm dev`: Start the development server with Hot Module Replacement (HMR).
- `pnpm build`: Build the application for production.
- `pnpm lint`: Run ESLint.
- `pnpm type-check`: Run Vue TSC for type checking.
