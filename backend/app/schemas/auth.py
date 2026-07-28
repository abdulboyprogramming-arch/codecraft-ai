"""
CodeCraft AI - Authentication Schemas

This module defines Pydantic models for authentication-related
request/response validation.

Developer: Abdulrahman Adeeyo
Hackathon: Prometheus July AI Challenge
"""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime
import re

# ============================================
# User Schemas
# ============================================

class UserCreate(BaseModel):
    """Schema for user registration."""
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=8, description="User's password")
    full_name: str = Field(..., min_length=1, max_length=100, description="User's full name")
    
    @validator("password")
    def validate_password(cls, v):
        """Validate password strength."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        return v
    
    @validator("full_name")
    def validate_full_name(cls, v):
        """Validate full name."""
        if not re.match(r"^[a-zA-Z\s\-']+$", v):
            raise ValueError("Full name can only contain letters, spaces, hyphens, and apostrophes")
        return v.strip()

class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")

class UserUpdate(BaseModel):
    """Schema for updating user information."""
    email: Optional[EmailStr] = Field(None, description="New email address")
    full_name: Optional[str] = Field(None, min_length=1, max_length=100, description="New full name")
    
    @validator("full_name")
    def validate_full_name(cls, v):
        """Validate full name."""
        if v is not None:
            if not re.match(r"^[a-zA-Z\s\-']+$", v):
                raise ValueError("Full name can only contain letters, spaces, hyphens, and apostrophes")
            return v.strip()
        return v

class UserResponse(BaseModel):
    """Schema for user response."""
    id: str = Field(..., description="User ID")
    email: str = Field(..., description="User's email address")
    full_name: Optional[str] = Field(None, description="User's full name")
    created_at: Optional[datetime] = Field(None, description="Account creation timestamp")
    last_login: Optional[datetime] = Field(None, description="Last login timestamp")
    
    class Config:
        from_attributes = True

# ============================================
# Token Schemas
# ============================================

class Token(BaseModel):
    """Schema for authentication token response."""
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field("bearer", description="Token type")

class RefreshToken(BaseModel):
    """Schema for refreshing token."""
    refresh_token: str = Field(..., description="Refresh token")

class TokenData(BaseModel):
    """Schema for token payload data."""
    user_id: str = Field(..., description="User ID")
    exp: Optional[datetime] = Field(None, description="Token expiration time")
    type: Optional[str] = Field("access", description="Token type")

# ============================================
# Password Reset Schemas
# ============================================

class PasswordReset(BaseModel):
    """Schema for password reset request."""
    email: EmailStr = Field(..., description="User's email address")

class PasswordResetConfirm(BaseModel):
    """Schema for confirming password reset."""
    token: str = Field(..., description="Password reset token")
    new_password: str = Field(..., min_length=8, description="New password")
    
    @validator("new_password")
    def validate_password(cls, v):
        """Validate password strength."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        return v

