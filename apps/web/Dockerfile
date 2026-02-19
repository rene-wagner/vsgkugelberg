# ===============================
# Stage 1: Builder
# ===============================
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate

WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/web ./apps/web

# Build argument for API URL (baked into the build)
ARG VITE_API_BASE_URL=https://vsgapi.rwgnr.de
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the Vue application
WORKDIR /app/apps/web
RUN pnpm build

# ===============================
# Stage 2: Production Runner (Nginx)
# ===============================
FROM nginx:alpine AS runner

# Copy built static files
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Copy nginx configuration
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
