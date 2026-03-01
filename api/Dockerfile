# Production Dockerfile for OneSAM API with Bun Runtime
# Optimized for Koyeb deployment

# Use Bun as base image
FROM oven/bun:1 AS builder

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package.json bun.lockb* ./

# Install dependencies (production + dev for build)
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production stage - use slim image
FROM oven/bun:1-slim AS production

# Set working directory
WORKDIR /app

# Install system dependencies needed for the app
RUN apt-get update && \
    apt-get install -y \
        curl \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

# Create app user for security
RUN groupadd -r appuser && \
    useradd -r -g appuser appuser && \
    mkdir -p /app/logs /app/uploads && \
    chown -R appuser:appuser /app

# Copy built application and dependencies from builder stage
COPY --from=builder --chown=appuser:appuser /app/dist ./dist
COPY --from=builder --chown=appuser:appuser /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appuser /app/package.json ./

# Copy public assets if they exist
COPY --from=builder --chown=appuser:appuser /app/public ./public 2>/dev/null || true

# Switch to non-root user
USER appuser

# Expose the port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["bun", "run", "start"]