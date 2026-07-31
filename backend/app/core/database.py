"""
CodeCraft AI - Database Configuration

This module handles database connection, session management,
and provides the base class for SQLAlchemy models.

Developer: Abdulrahman Adeeyo
Hackathon: Prometheus July AI Challenge
"""

from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from sqlalchemy.exc import SQLAlchemyError
from typing import Generator
import logging

from .config import settings

logger = logging.getLogger(__name__)

# ============================================
# Database Engine
# ============================================
engine = create_engine(
    settings.DATABASE_URL,
    poolclass=QueuePool,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=settings.DATABASE_ECHO,
    future=True,
)

# ============================================
# Session Factory
# ============================================
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    future=True,
)

# ============================================
# Base Class for Models
# ============================================
Base = declarative_base()
metadata = Base.metadata

# ============================================
# Dependency for Database Sessions
# ============================================
def get_db() -> Generator[Session, None, None]:
    """
    Dependency that provides a database session.
    
    Yields:
        Session: SQLAlchemy database session
    """
    db = SessionLocal()
    try:
        yield db
    except SQLAlchemyError as e:
        logger.error(f"Database error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

# ============================================
# Database Utilities
# ============================================
def init_db() -> None:
    """
    Initialize the database by creating all tables.
    """
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created successfully")
    except Exception as e:
        logger.error(f"❌ Failed to create database tables: {e}")
        raise

def drop_db() -> None:
    """
    Drop all tables (use with caution!).
    """
    try:
        Base.metadata.drop_all(bind=engine)
        logger.warning("⚠️ All database tables dropped")
    except Exception as e:
        logger.error(f"❌ Failed to drop database tables: {e}")
        raise

# ============================================
# Export
# ============================================
__all__ = [
    "engine",
    "SessionLocal",
    "Base",
    "get_db",
    "init_db",
    "drop_db",
]

