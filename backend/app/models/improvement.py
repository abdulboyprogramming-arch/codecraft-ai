"""
CodeCraft AI - Code Improvement Model

This module defines the CodeImprovement database model for storing
AI-generated code improvements and refactoring suggestions.

Developer: Abdulrahman Adeeyo
Hackathon: Prometheus July AI Challenge
"""

import uuid
from sqlalchemy import Column, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..core.database import Base

class CodeImprovement(Base):
    """
    CodeImprovement model for storing AI-generated code improvements.
    """
    __tablename__ = "code_improvements"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    original_code = Column(
        Text,
        nullable=False,
    )
    improved_code = Column(
        Text,
        nullable=False,
    )
    language = Column(
        String(50),
        nullable=True,
    )
    focus_area = Column(
        String(100),
        nullable=True,
    )
    explanation = Column(
        Text,
        nullable=True,
    )
    changes_summary = Column(
        JSON,
        nullable=False,
        default=dict,
    )
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="improvements",
    )

    def __repr__(self) -> str:
        return f"<CodeImprovement {self.id[:8]}>"

    def __str__(self) -> str:
        return f"Improvement by {self.user_id} at {self.created_at}"

    def to_dict(self) -> dict:
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "original_code": self.original_code,
            "improved_code": self.improved_code,
            "language": self.language,
            "focus_area": self.focus_area,
            "explanation": self.explanation,
            "changes_summary": self.changes_summary,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
