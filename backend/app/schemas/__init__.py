"""
CodeCraft AI - Pydantic Schemas

This package contains all Pydantic models for request/response validation.

Developer: Abdulrahman Adeeyo
Hackathon: Prometheus July AI Challenge
"""

from .auth import (
    UserCreate,
    UserLogin,
    UserResponse,
    UserUpdate,
    Token,
    RefreshToken,
    TokenData,
    PasswordReset,
    PasswordResetConfirm,
)
from .review import (
    ReviewRequest,
    ReviewResponse,
    ReviewHistoryResponse,
    FeedbackResponse,
    FeedbackItem,
)

__all__ = [
    # Auth schemas
    "UserCreate",
    "UserLogin",
    "UserResponse",
    "UserUpdate",
    "Token",
    "RefreshToken",
    "TokenData",
    "PasswordReset",
    "PasswordResetConfirm",
    # Review schemas
    "ReviewRequest",
    "ReviewResponse",
    "ReviewHistoryResponse",
    "FeedbackResponse",
    "FeedbackItem",
]

