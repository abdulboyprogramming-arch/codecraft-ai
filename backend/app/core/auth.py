"""
CodeCraft AI - Authentication Logic

This module handles authentication dependencies, JWT validation,
and current user extraction.

Developer: Abdulrahman Adeeyo
Hackathon: Prometheus July AI Challenge
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any

from .database import get_db
from .security import decode_access_token
from ..models.user import User
from ..schemas.auth import TokenData

import logging

logger = logging.getLogger(__name__)

# ============================================
# OAuth2 Configuration
# ============================================
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login",
    auto_error=True,
)

# ============================================
# Current User Dependencies
# ============================================
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Get the current authenticated user from JWT token.
    
    Args:
        token: JWT access token
        db: Database session
        
    Returns:
        User: Current user object
        
    Raises:
        HTTPException: If authentication fails
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode token
        payload = decode_access_token(token)
        if payload is None:
            raise credentials_exception
        
        # Extract user ID
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        
        # Validate token data
        token_data = TokenData(user_id=user_id)
        
    except JWTError as e:
        logger.error(f"JWT validation error: {e}")
        raise credentials_exception
    
    # Get user from database
    try:
        user = db.query(User).filter(User.id == token_data.user_id).first()
        if user is None:
            raise credentials_exception
    except Exception as e:
        logger.error(f"Database error fetching user: {e}")
        raise credentials_exception
    
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Get the current active user.
    
    Args:
        current_user: Current user from get_current_user
        
    Returns:
        User: Current active user
        
    Raises:
        HTTPException: If user is inactive
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user

async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """
    Get current user if authenticated, otherwise None.
    
    Args:
        token: Optional JWT token
        db: Database session
        
    Returns:
        Optional[User]: Current user or None
    """
    if token is None:
        return None
    
    try:
        return await get_current_user(token, db)
    except HTTPException:
        return None

# ============================================
# Legacy Support
# ============================================
def get_current_user_dependency(*args, **kwargs):
    """
    Legacy wrapper for get_current_user.
    
    Returns:
        Function: get_current_user function
    """
    return get_current_user

# ============================================
# Export
# ============================================
__all__ = [
    "oauth2_scheme",
    "get_current_user",
    "get_current_active_user",
    "get_current_user_optional",
    "get_current_user_dependency",
]

