# ============================================
# CodeCraft AI - Frontend Dockerfile
# ============================================
# Multi-stage build for production

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:18-alpine AS deps

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# ============================================
# Stage 2: Builder
# ============================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ============================================
# Stage 3: Development
# ============================================
FROM node:18-alpine AS development

WORKDIR /app

# Install all dependencies for development
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Run in development mode
CMD ["npm", "run", "dev"]

# ============================================
# Stage 4: Production
# ============================================
FROM node:18-alpine AS production

WORKDIR /app

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Create non-root user
RUN adduser -D -H -u 1001 codecraft && \
    chown -R codecraft:codecraft /app

USER codecraft

# Expose port
EXPOSE 3000

# Run in production mode
CMD ["npm", "start"]

