"""
CodeCraft AI - Review Schemas

This module defines Pydantic models for code review-related
request/response validation.

Developer: Abdulrahman Adeeyo
Hackathon: Prometheus July AI Challenge
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
import re

# ============================================
# Feedback Schemas
# ============================================

class FeedbackItem(BaseModel):
    """Schema for a single feedback item."""
    message: str = Field(..., description="Feedback message")
    line: Optional[int] = Field(None, description="Line number in code")
    severity: str = Field("info", description="Severity level: info, warning, error")
    suggestion: Optional[str] = Field(None, description="Suggested fix")

class FeedbackResponse(BaseModel):
    """Schema for AI feedback response."""
    logic: List[FeedbackItem] = Field(default_factory=list, description="Logical errors and bugs")
    efficiency: List[FeedbackItem] = Field(default_factory=list, description="Performance and efficiency suggestions")
    style: List[FeedbackItem] = Field(default_factory=list, description="Code style and readability improvements")
    security: List[FeedbackItem] = Field(default_factory=list, description="Security vulnerabilities found")
    summary: Optional[str] = Field(None, description="Overall summary of the review")
    score: Optional[int] = Field(None, ge=0, le=100, description="Code quality score (0-100)")

    def get_total_issues(self) -> int:
        """Get total number of issues across all categories."""
        return (
            len(self.logic) +
            len(self.efficiency) +
            len(self.style) +
            len(self.security)
        )

    def get_issue_summary(self) -> Dict[str, int]:
        """Get summary of issues by category."""
        return {
            "logic": len(self.logic),
            "efficiency": len(self.efficiency),
            "style": len(self.style),
            "security": len(self.security),
        }

# ============================================
# Review Request Schemas
# ============================================

class ReviewRequest(BaseModel):
    """Schema for submitting code for review."""
    code: str = Field(..., description="The source code to review", max_length=50000)
    language: Optional[str] = Field(None, description="Programming language")
    title: Optional[str] = Field(None, max_length=255, description="Review title")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context about the code")

    @validator("code")
    def validate_code(cls, v):
        """Validate code content."""
        if not v or not v.strip():
            raise ValueError("Code cannot be empty")
        if len(v) > 50000:
            raise ValueError("Code exceeds maximum length of 50,000 characters")
        return v

    @validator("language")
    def validate_language(cls, v):
        """Validate programming language."""
        if v is not None:
            valid_languages = ["python", "javascript", "java", "cpp", "typescript", "go", "rust", "ruby", "php"]
            if v.lower() not in valid_languages:
                raise ValueError(f"Language must be one of: {', '.join(valid_languages)}")
            return v.lower()
        return v

class ReviewResponse(BaseModel):
    """Schema for review response."""
    id: str = Field(..., description="Review ID")
    title: Optional[str] = Field(None, description="Review title")
    code: str = Field(..., description="Reviewed code")
    language: Optional[str] = Field(None, description="Programming language")
    feedback: FeedbackResponse = Field(..., description="AI feedback")
    created_at: datetime = Field(..., description="Review creation timestamp")

    class Config:
        from_attributes = True

class ReviewHistoryResponse(BaseModel):
    """Schema for review history list item."""
    id: str = Field(..., description="Review ID")
    title: Optional[str] = Field(None, description="Review title")
    code: str = Field(..., description="Preview of code")
    created_at: datetime = Field(..., description="Review creation timestamp")
    feedback: FeedbackResponse = Field(..., description="AI feedback summary")
    total_issues: int = Field(0, description="Total number of issues found")

    class Config:
        from_attributes = True

    @validator("total_issues", pre=True, always=True)
    def calculate_total_issues(cls, v, values):
        """Calculate total issues from feedback."""
        feedback = values.get("feedback")
        if feedback:
            return feedback.get_total_issues()
        return 0

# ============================================
# Review Statistics Schemas
# ============================================

class ReviewStatsResponse(BaseModel):
    """Schema for review statistics."""
    total_reviews: int = Field(..., description="Total number of reviews")
    total_issues: int = Field(..., description="Total issues found")
    average_issues_per_review: float = Field(..., description="Average issues per review")
    languages: List[str] = Field(default_factory=list, description="Languages used")
    most_common_issues: Dict[str, int] = Field(default_factory=dict, description="Most common issue types")

# ============================================
# Code Improvement Schemas
# ============================================

class CodeImprovementRequest(BaseModel):
    """Schema for requesting code improvement."""
    code: str = Field(..., description="The source code to improve", max_length=50000)
    language: Optional[str] = Field(None, description="Programming language")
    focus_area: Optional[str] = Field(None, description="Focus area: readability, performance, security, all")
    save: bool = Field(False, description="Whether to save this improvement to history")

    @validator("code")
    def validate_code(cls, v):
        if not v or not v.strip():
            raise ValueError("Code cannot be empty")
        if len(v) > 50000:
            raise ValueError("Code exceeds maximum length of 50,000 characters")
        return v

    @validator("focus_area")
    def validate_focus_area(cls, v):
        if v is not None:
            valid_areas = ["readability", "performance", "security", "all", "maintainability", "python", "javascript"]
            if v.lower() not in valid_areas:
                raise ValueError(f"Focus area must be one of: {', '.join(valid_areas)}")
            return v.lower()
        return v

class ChangeSummaryItem(BaseModel):
    """Schema for a single change in the improvement."""
    file: str = Field("main", description="File or section name")
    line: Optional[int] = Field(None, description="Line number")
    change_type: str = Field(..., description="Type: added, removed, modified, refactored")
    description: str = Field(..., description="Description of the change")
    impact: str = Field("medium", description="Impact: low, medium, high")

class CodeImprovementResponse(BaseModel):
    """Schema for code improvement response."""
    id: str = Field(..., description="Improvement ID")
    original_code: str = Field(..., description="Original code")
    improved_code: str = Field(..., description="Improved code")
    language: Optional[str] = Field(None, description="Programming language")
    focus_area: Optional[str] = Field(None, description="Focus area used")
    explanation: Optional[str] = Field(None, description="Explanation of changes")
    changes_summary: List[ChangeSummaryItem] = Field(default_factory=list, description="Summary of changes")
    created_at: datetime = Field(..., description="Creation timestamp")

    class Config:
        from_attributes = True

# ============================================
# Export
# ============================================
__all__ = [
    "FeedbackItem",
    "FeedbackResponse",
    "ReviewRequest",
    "ReviewResponse",
    "ReviewHistoryResponse",
    "ReviewStatsResponse",
    "CodeImprovementRequest",
    "CodeImprovementResponse",
    "ChangeSummaryItem",
]

