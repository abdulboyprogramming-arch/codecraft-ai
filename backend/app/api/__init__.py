"""
CodeCraft AI - API Module

This package contains all API route handlers for the CodeCraft AI
application.

Developer: Abdulrahman Adeeyo
Hackathon: Prometheus July AI Challenge
"""

from . import auth
from . import reviews

__all__ = ["auth", "reviews"]

