# Project Overview: VSG Kugelberg Monorepo

This is the root of the **VSG Kugelberg e.V.** monorepo, managed with **Turborepo** and **pnpm**. It contains the source code for the sports club's digital ecosystem.

## Structure

The project is divided into the following workspaces:

- **`apps/api`**: The backend API service.
- **`apps/web`**: The frontend web application.

## Core Technologies

- **Monorepo Manager**: Turborepo
- **Package Manager**: pnpm
- **Language**: TypeScript

## Agent Documentation

For detailed information about specific applications, please refer to their respective `AGENTS.md` files:

- [**API Service**](./apps/api/AGENTS.md)
- [**Web Application**](./apps/web/AGENTS.md)

## Quick Start (Root)

- **Build**: `pnpm build` (runs `turbo build`)
- **Dev**: `pnpm dev` (runs `turbo dev`)
- **Lint**: `pnpm lint` (runs `turbo lint`)
