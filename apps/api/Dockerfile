# Stage 1: Build
FROM node:24-alpine AS builder
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate

# Copy workspace files
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api ./apps/api

# Generate Prisma client and build
RUN pnpm --filter api prisma:generate
RUN pnpm --filter api build

# Stage 2: Production
FROM node:24-alpine AS production
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.28.0 --activate

# Copy built artifacts
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/node_modules/.pnpm ./node_modules/.pnpm

# Install production deps only
RUN pnpm install --prod --frozen-lockfile

EXPOSE 3000
CMD ["node", "dist/index.js"]
