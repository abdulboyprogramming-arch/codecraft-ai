"""
CodeCraft AI - User Model

This module defines the User database model for authentication and user management.

Developer: Abdulrahman Adeeyo
Hackathon: Prometheus July AI Challenge
"""

import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..core.database import Base

class User(Base):
    """
    User model for authentication and user management.
    """
    __tablename__ = "users"
    
    # ============================================
    # Columns
    # ============================================
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    email = Column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    hashed_password = Column(
        String(255),
        nullable=False,
    )
    full_name = Column(
        String(255),
        nullable=True,
    )
    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
    )
    is_admin = Column(
        Boolean,
        default=False,
        nullable=False,
    )
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        onupdate=func.now(),
    )
    last_login = Column(
        DateTime(timezone=True),
        nullable=True,
    )
    login_count = Column(
        Integer,
        default=0,
        nullable=False,
    )
    
    # ============================================
    # Relationships
    # ============================================
    reviews = relationship(
        "Review",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="dynamic",
    )
    
    # ============================================
    # Methods
    # ============================================
    def __repr__(self) -> str:
        """String representation of user."""
        return f"<User {self.email}>"
    
    def __str__(self) -> str:
        """Human-readable string representation."""
        return self.email or str(self.id)
    
    def to_dict(self) -> dict:
        """Convert user to dictionary."""
        return {
            "id": str(self.id),
            "email": self.email,
            "full_name": self.full_name,
            "is_active": self.is_active,
            "is_admin": self.is_admin,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "login_count": self.login_count,
        }

