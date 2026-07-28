"""
CodeCraft AI - Review Model

This module defines the Review database model for storing code review history.

Developer: Abdulrahman Adeeyo
Hackathon: Prometheus July AI Challenge
"""

import uuid
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, JSON, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..core.database import Base

class Review(Base):
    """
    Review model for storing code review history.
    """
    __tablename__ = "reviews"
    __table_args__ = {"schema": "public"}
    
    # ============================================
    # Columns
    # ============================================
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("public.users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    title = Column(
        String(255),
        nullable=True,
    )
    code = Column(
        Text,
        nullable=False,
    )
    language = Column(
        String(50),
        nullable=True,
    )
    feedback_data = Column(
        JSON,
        nullable=False,
        default=dict,
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
    
    # ============================================
    # Relationships
    # ============================================
    user = relationship(
        "User",
        back_populates="reviews",
    )
    
    # ============================================
    # Methods
    # ============================================
    def __repr__(self) -> str:
        """String representation of review."""
        return f"<Review {self.id[:8]}>"
    
    def __str__(self) -> str:
        """Human-readable string representation."""
        return f"Review by {self.user_id} at {self.created_at}"
    
    def to_dict(self) -> dict:
        """Convert review to dictionary."""
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "title": self.title,
            "code": self.code,
            "language": self.language,
            "feedback_data": self.feedback_data,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
    
    def get_issue_count(self) -> int:
        """Get total number of issues found in this review."""
        if not self.feedback_data:
            return 0
        
        total = 0
        for category in ["logic", "efficiency", "style", "security"]:
            total += len(self.feedback_data.get(category, []))
        return total
    
    def get_summary(self) -> dict:
        """Get summary of review findings."""
        return {
            "total_issues": self.get_issue_count(),
            "logic": len(self.feedback_data.get("logic", [])),
            "efficiency": len(self.feedback_data.get("efficiency", [])),
            "style": len(self.feedback_data.get("style", [])),
            "security": len(self.feedback_data.get("security", [])),
        }

