"""
CodeCraft AI - Authentication API Endpoints

This module handles user authentication including registration,
login, token refresh, and user profile management.

Developer: Abdulrahman Adeeyo
Hackathon: Prometheus July AI Challenge
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import logging

from ..core.database import get_db
from ..core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_access_token,
)
from ..core.auth import get_current_user
from ..models.user import User
from ..schemas.auth import (
    UserCreate,
    UserLogin,
    UserResponse,
    Token,
    RefreshToken,
    UserUpdate,
    PasswordReset,
    PasswordResetConfirm,
)

logger = logging.getLogger(__name__)

# ============================================
# Router
# ============================================
router = APIRouter(prefix="/auth", tags=["Authentication"])

# ============================================
# Registration
# ============================================
@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    user_data: UserCreate,
    db: Session = Depends(get_db),
) -> UserResponse:
    """
    Register a new user account.
    
    Args:
        user_data: User registration data
        db: Database session
        
    Returns:
        UserResponse: Created user information
        
    Raises:
        HTTPException: If email already exists
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    logger.info(f"New user registered: {new_user.email}")
    
    return UserResponse(
        id=str(new_user.id),
        email=new_user.email,
        full_name=new_user.full_name,
        created_at=new_user.created_at,
    )

# ============================================
# Login
# ============================================
@router.post("/login", response_model=Token)
async def login(
    user_data: UserLogin,
    db: Session = Depends(get_db),
) -> Token:
    """
    Login user and return access token.
    
    Args:
        user_data: User login credentials
        db: Database session
        
    Returns:
        Token: Access and refresh tokens
        
    Raises:
        HTTPException: If credentials are invalid
    """
    # Find user by email
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    # Verify password
    if not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    # Update last login
    user.last_login = __import__("datetime").datetime.utcnow()
    db.commit()
    
    # Create tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    logger.info(f"User logged in: {user.email}")
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )

# ============================================
# Token Refresh
# ============================================
@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_data: RefreshToken,
    db: Session = Depends(get_db),
) -> Token:
    """
    Refresh access token using refresh token.
    
    Args:
        refresh_data: Refresh token
        db: Database session
        
    Returns:
        Token: New access and refresh tokens
        
    Raises:
        HTTPException: If refresh token is invalid
    """
    # Decode refresh token
    payload = decode_access_token(refresh_data.refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
    
    # Validate token type
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )
    
    # Get user
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    # Create new tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )

# ============================================
# User Profile
# ============================================
@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """
    Get current user information.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        UserResponse: User information
    """
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        created_at=current_user.created_at,
        last_login=current_user.last_login,
    )

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserResponse:
    """
    Update current user information.
    
    Args:
        user_update: Updated user data
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        UserResponse: Updated user information
    """
    if user_update.full_name:
        current_user.full_name = user_update.full_name
    
    if user_update.email:
        # Check if email is already taken
        existing_user = db.query(User).filter(
            User.email == user_update.email,
            User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already taken"
            )
        current_user.email = user_update.email
    
    db.commit()
    db.refresh(current_user)
    
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        created_at=current_user.created_at,
        last_login=current_user.last_login,
    )

# ============================================
# Password Management
# ============================================
@router.post("/password/reset")
async def request_password_reset(
    request: PasswordReset,
    db: Session = Depends(get_db),
):
    """
    Request password reset email.
    
    Args:
        request: Email address for password reset
        db: Database session
    """
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # Don't reveal if user exists or not
        return {"message": "If email exists, reset link has been sent"}
    
    # In production, send email with reset link
    # For hackathon, just return success
    logger.info(f"Password reset requested for: {request.email}")
    
    return {"message": "If email exists, reset link has been sent"}

@router.post("/password/reset/confirm")
async def confirm_password_reset(
    request: PasswordResetConfirm,
    db: Session = Depends(get_db),
):
    """
    Confirm password reset with token.
    
    Args:
        request: Reset token and new password
        db: Database session
        
    Raises:
        HTTPException: If token is invalid
    """
    # Decode reset token
    payload = decode_access_token(request.token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token",
        )
    
    # Get user
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token",
        )
    
    # Update password
    user.hashed_password = hash_password(request.new_password)
    db.commit()
    
    logger.info(f"Password reset confirmed for: {user.email}")
    
    return {"message": "Password reset successful"}

# ============================================
# Logout
# ============================================
@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
):
    """
    Logout user (client-side token removal).
    
    Args:
        current_user: Current authenticated user
    """
    # Client should remove tokens
    # Server-side token blacklisting can be implemented with Redis
    return {"message": "Logged out successfully"}

