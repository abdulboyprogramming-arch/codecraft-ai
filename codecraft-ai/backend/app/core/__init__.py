"""
CodeCraft AI - Core Module

This package contains core functionality including:
- Configuration management
- Database setup
- Authentication logic
- Security utilities

Developer: Abdulrahman Adeeyo
Hackathon: Prometheus July AI Challenge
"""

from .config import settings
from .database import Base, engine, get_db
from .security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)
from .auth import get_current_user, get_current_user_dependency

__all__ = [
    "settings",
    "Base",
    "engine",
    "get_db",
    "hash_password",
    "verify_password",
    "create_access_token",
    "decode_access_token",
    "get_current_user",
    "get_current_user_dependency",
]

