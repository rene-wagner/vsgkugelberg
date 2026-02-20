# ===============================
# Migration Tool Dockerfile
# ===============================
FROM node:22-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate

WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY tools/migrate/package.json ./tools/migrate/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy migration tool source code
COPY apps/api ./apps/api
COPY tools/migrate ./tools/migrate

RUN pnpm --filter api prisma:deploy

# Run migration
CMD ["sh", "-c", "pnpm --filter migrate migrate"]
