# Stage 1: Build
FROM node:24-alpine AS builder
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
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

# Copy package files for dependency installation
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/api/package.json ./apps/api/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built artifacts
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/generated ./apps/api/generated

EXPOSE 3000
CMD ["node", "apps/api/dist/index.js"]
