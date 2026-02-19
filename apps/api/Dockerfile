# ===============================
# Stage 1: Builder
# ===============================
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate

WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api ./apps/api

# Generate Prisma client
# DATABASE_URL is required by prisma.config.ts at parse time, but prisma generate
# never connects to the database - a placeholder is sufficient for code generation.
ARG DATABASE_URL=postgresql://placeholder:placeholder@placeholder:5432/placeholder
ENV DATABASE_URL=${DATABASE_URL}
RUN pnpm --filter api prisma:generate

# Build TypeScript
RUN pnpm --filter api build

# ===============================
# Stage 2: Production Runner
# ===============================
FROM node:22-alpine AS runner

# Install pnpm for production dependencies
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 expressjs

WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built files from builder stage
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Create uploads directory with proper permissions
RUN mkdir -p /app/apps/api/uploads \
    && chown -R expressjs:nodejs /app

# Switch to non-root user
USER expressjs

WORKDIR /app/apps/api

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Run migrations and start the server
CMD ["sh", "-c", "node dist/index.js"]
