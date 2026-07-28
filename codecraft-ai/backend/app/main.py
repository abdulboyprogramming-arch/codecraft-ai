"""
CodeCraft AI - FastAPI Application Entry Point

This module initializes the FastAPI application, configures middleware,
and includes all API routers. It serves as the main entry point for
the backend service.

Developer: Abdulrahman Adeeyo
Hackathon: Prometheus July AI Challenge
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from .core.config import settings
from .core.database import engine, Base
from .api import auth, reviews
from .utils.logger import setup_logging

# ============================================
# Configure Logging
# ============================================
setup_logging()
logger = logging.getLogger(__name__)

# ============================================
# Database Initialization
# ============================================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup
    logger.info("🚀 Starting CodeCraft AI API...")
    logger.info(f"📦 Environment: {settings.APP_ENV}")
    logger.info(f"📦 Version: {settings.APP_VERSION}")
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Database tables created/verified")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down CodeCraft AI API...")

# ============================================
# Create FastAPI Application
# ============================================
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered code review assistant API",
    docs_url="/docs" if settings.APP_ENV != "production" else None,
    redoc_url="/redoc" if settings.APP_ENV != "production" else None,
    lifespan=lifespan,
)

# ============================================
# Middleware Configuration
# ============================================

# Trusted Hosts
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS or ["*"],
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS or ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# API Routes
# ============================================

@app.get("/")
async def root():
    """
    Root endpoint - API status and information.
    """
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "environment": settings.APP_ENV,
        "docs": "/docs" if settings.APP_ENV != "production" else None,
    }

@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring.
    """
    return {
        "status": "healthy",
        "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
    }

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")

# ============================================
# Error Handlers
# ============================================

@app.exception_handler(404)
async def not_found_handler(request, exc):
    """
    Custom 404 handler.
    """
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=404,
        content={"detail": "Endpoint not found", "path": request.url.path}
    )

@app.exception_handler(500)
async def internal_server_error_handler(request, exc):
    """
    Custom 500 handler.
    """
    from fastapi.responses import JSONResponse
    logger.error(f"Internal server error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error occurred"}
    )

# ============================================
# Export
# ============================================
__all__ = ["app"]

