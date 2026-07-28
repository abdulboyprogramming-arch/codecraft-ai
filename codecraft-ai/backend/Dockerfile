# ============================================
# CodeCraft AI - Backend Dockerfile
# ============================================
# Multi-stage build for production

# ============================================
# Stage 1: Builder
# ============================================
FROM python:3.10-slim AS builder

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ============================================
# Stage 2: Development
# ============================================
FROM python:3.10-slim AS development

WORKDIR /app

# Install system dependencies for development
RUN apt-get update && apt-get install -y \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy dependencies from builder
COPY --from=builder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY . .

# Install development dependencies
RUN pip install --no-cache-dir pytest pytest-asyncio httpx

# Expose port
EXPOSE 8000

# Run in development mode
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# ============================================
# Stage 3: Production
# ============================================
FROM python:3.10-slim AS production

WORKDIR /app

# Install system dependencies for production
RUN apt-get update && apt-get install -y \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy dependencies from builder
COPY --from=builder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY . .

# Create non-root user
RUN adduser --disabled-password --gecos '' codecraft && \
    chown -R codecraft:codecraft /app

USER codecraft

# Expose port
EXPOSE 8000

# Run in production mode
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

