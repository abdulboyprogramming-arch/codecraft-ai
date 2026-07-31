"""
CodeCraft AI - Code Review API Endpoints

This module handles code review submissions, retrieval of review history,
and management of review feedback.

Developer: Abdulrahman Adeeyo
Hackathon: Prometheus July AI Challenge
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
import uuid
from sqlalchemy import func, case

from ..core.database import get_db
from ..core.auth import get_current_user
from ..models.user import User
from ..models.review import Review
from ..models.improvement import CodeImprovement
from ..utils.helpers import extract_language_from_code
from ..schemas.review import (
    ReviewRequest,
    ReviewResponse,
    ReviewHistoryResponse,
    FeedbackResponse,
    CodeImprovementRequest,
    CodeImprovementResponse,
)
from ..services.ai_service import ai_service
from ..services.rate_limiter import rate_limiter

logger = logging.getLogger(__name__)

# ============================================
# Router
# ============================================
router = APIRouter(prefix="/reviews", tags=["Code Reviews"])

# ============================================
# Submit Code Review
# ============================================
@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def submit_review(
    review_data: ReviewRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReviewResponse:
    """
    Submit code for AI review.
    
    Args:
        review_data: Code and optional language
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        ReviewResponse: Review details with AI feedback
        
    Raises:
        HTTPException: If code is too long or review fails
    """
    # Rate limiting
    if not rate_limiter.check_limit(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please wait before submitting another review.",
        )
    
    # Validate code length
    if len(review_data.code) > 50000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code exceeds maximum length of 50,000 characters.",
        )
    
    try:
        # Get AI feedback
        feedback = await ai_service.review_code(
            review_data.code,
            review_data.language,
        )
        
        # Save to database
        db_review = Review(
            user_id=current_user.id,
            code=review_data.code,
            language=review_data.language,
            feedback_data=feedback,
            title=review_data.title,
        )
        db.add(db_review)
        db.commit()
        db.refresh(db_review)
        
        logger.info(f"Review submitted: {db_review.id} by {current_user.email}")
        
        return ReviewResponse(
            id=str(db_review.id),
            title=db_review.title,
            code=db_review.code,
            language=db_review.language,
            feedback=FeedbackResponse(**feedback),
            created_at=db_review.created_at,
        )
        
    except Exception as e:
        logger.error(f"Review submission error: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process code review. Please try again.",
        )

# ============================================
# Get Review History
# ============================================
@router.get("/history", response_model=List[ReviewHistoryResponse])
async def get_review_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
) -> List[ReviewHistoryResponse]:
    """
    Get current user's review history.
    
    Args:
        current_user: Current authenticated user
        db: Database session
        skip: Number of records to skip (pagination)
        limit: Maximum number of records to return
        
    Returns:
        List[ReviewHistoryResponse]: List of user's reviews
    """
    reviews = (
        db.query(Review)
        .filter(Review.user_id == current_user.id)
        .order_by(Review.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return [
        ReviewHistoryResponse(
            id=str(review.id),
            title=review.title,
            code=review.code[:100] + "..." if len(review.code) > 100 else review.code,
            created_at=review.created_at,
            feedback=FeedbackResponse(**review.feedback_data),
        )
        for review in reviews
    ]

# ============================================
# Get Specific Review
# ============================================
@router.get("/{review_id}", response_model=ReviewResponse)
async def get_review(
    review_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReviewResponse:
    """
    Get a specific review by ID.
    
    Args:
        review_id: Review ID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        ReviewResponse: Review details
        
    Raises:
        HTTPException: If review not found or not owned by user
    """
    try:
        review_uuid = uuid.UUID(review_id)
        review = db.query(Review).filter(
            Review.id == review_uuid,
            Review.user_id == current_user.id,
        ).first()
        
        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found or you don't have permission to view it.",
            )
        
        return ReviewResponse(
            id=str(review.id),
            title=review.title,
            code=review.code,
            language=review.language,
            feedback=FeedbackResponse(**review.feedback_data),
            created_at=review.created_at,
        )
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid review ID format.",
        )

# ============================================
# Delete Review
# ============================================
@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """
    Delete a specific review.
    
    Args:
        review_id: Review ID
        current_user: Current authenticated user
        db: Database session
        
    Raises:
        HTTPException: If review not found or not owned by user
    """
    try:
        review_uuid = uuid.UUID(review_id)
        review = db.query(Review).filter(
            Review.id == review_uuid,
            Review.user_id == current_user.id,
        ).first()
        
        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found or you don't have permission to delete it.",
            )
        
        db.delete(review)
        db.commit()
        
        logger.info(f"Review deleted: {review_id} by {current_user.email}")
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid review ID format.",
        )

# ============================================
# Improve Code
# ============================================
@router.post("/improve", response_model=CodeImprovementResponse, status_code=status.HTTP_200_OK)
async def improve_code(
    request: CodeImprovementRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CodeImprovementResponse:
    """
    Submit code for AI improvement and refactoring.
    
    Args:
        request: Code and optional focus area
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        CodeImprovementResponse: Improved code with explanation
        
    Raises:
        HTTPException: If code is too long or improvement fails
    """
    if not rate_limiter.check_limit(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please wait before submitting another request.",
        )
    
    if len(request.code) > 50000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code exceeds maximum length of 50,000 characters.",
        )
    
    try:
        result = await ai_service.improve_code(
            request.code,
            request.language,
            request.focus_area,
        )
        
        improvement = CodeImprovement(
            user_id=current_user.id,
            original_code=request.code,
            improved_code=result.get("improved_code", request.code),
            language=request.language,
            focus_area=request.focus_area,
            explanation=result.get("explanation"),
            changes_summary=result.get("changes_summary", []),
        )
        db.add(improvement)
        db.commit()
        db.refresh(improvement)
        
        logger.info(f"Code improvement created: {improvement.id} by {current_user.email}")
        
        return CodeImprovementResponse(
            id=str(improvement.id),
            original_code=improvement.original_code,
            improved_code=improvement.improved_code,
            language=improvement.language,
            focus_area=improvement.focus_area,
            explanation=improvement.explanation,
            changes_summary=improvement.changes_summary,
            created_at=improvement.created_at,
        )
        
    except Exception as e:
        logger.error(f"Code improvement error: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to improve code. Please try again.",
        )

# ============================================
# Export Review as Markdown
# ============================================
@router.get("/{review_id}/export", response_class=PlainTextResponse)
async def export_review(
    review_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> str:
    """
    Export a review as Markdown.
    
    Args:
        review_id: Review ID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        str: Markdown formatted review
        
    Raises:
        HTTPException: If review not found or not owned by user
    """
    try:
        review_uuid = uuid.UUID(review_id)
        review = db.query(Review).filter(
            Review.id == review_uuid,
            Review.user_id == current_user.id,
        ).first()
        
        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found or you don't have permission to export it.",
            )
        
        feedback = review.feedback_data or {}
        total_issues = (
            len(feedback.get("logic", [])) +
            len(feedback.get("efficiency", [])) +
            len(feedback.get("style", [])) +
            len(feedback.get("security", []))
        )
        
        lines = []
        lines.append(f"# Code Review: {review.title or 'Untitled Review'}")
        lines.append("")
        lines.append(f"**Language:** {review.language or 'Not specified'}")
        lines.append(f"**Date:** {review.created_at.strftime('%Y-%m-%d %H:%M:%S') if review.created_at else 'N/A'}")
        lines.append(f"**Overall Score:** {feedback.get('score', 'N/A')}/100")
        lines.append(f"**Total Issues:** {total_issues}")
        lines.append("")
        lines.append("## Code")
        lines.append("```")
        lines.append(review.code)
        lines.append("```")
        lines.append("")
        
        if feedback.get("summary"):
            lines.append("## Summary")
            lines.append(feedback["summary"])
            lines.append("")
        
        categories = [
            ("logic", "Logic Errors", "🔍"),
            ("efficiency", "Efficiency", "⚡"),
            ("style", "Code Style", "🎨"),
            ("security", "Security", "🔒"),
        ]
        
        for key, label, icon in categories:
            items = feedback.get(key, [])
            lines.append(f"## {icon} {label}")
            if not items:
                lines.append("No issues found in this category.")
            else:
                for item in items:
                    severity = item.get("severity", "info")
                    message = item.get("message", "")
                    line = item.get("line")
                    suggestion = item.get("suggestion")
                    
                    lines.append(f"- **{severity.upper()}**: {message}")
                    if line:
                        lines.append(f"  - Line: {line}")
                    if suggestion:
                        lines.append(f"  - Suggestion: {suggestion}")
            lines.append("")
        
        return "\n".join(lines)
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid review ID format.",
        )

# ============================================
# Detect Programming Language
# ============================================
@router.post("/detect-language")
async def detect_language(
    request: dict,
) -> dict:
    """
    Detect programming language from code snippet.
    
    Args:
        request: JSON body with "code" field
        
    Returns:
        dict: Detected language or null
    """
    code = request.get("code", "")
    if not code or not code.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code is required for language detection.",
        )
    
    detected = extract_language_from_code(code)
    return {"language": detected}

# ============================================
# Get Review Statistics
# ============================================
@router.get("/stats/summary")
async def get_review_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """
    Get review statistics for current user.
    
    Args:
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        dict: Review statistics
    """
    total_reviews = db.query(Review).filter(Review.user_id == current_user.id).count()
    
    if total_reviews == 0:
        return {
            "total_reviews": 0,
            "total_issues": 0,
            "average_issues_per_review": 0,
            "languages": [],
        }
    
    reviews = db.query(Review).filter(Review.user_id == current_user.id).all()
    total_issues = 0
    languages = set()
    for review in reviews:
        feedback = review.feedback_data or {}
        total_issues += (
            len(feedback.get("logic", [])) +
            len(feedback.get("efficiency", [])) +
            len(feedback.get("style", [])) +
            len(feedback.get("security", []))
        )
        if review.language:
            languages.add(review.language)
    
    avg_issues = round(total_issues / total_reviews, 2)
    
    return {
        "total_reviews": total_reviews,
        "total_issues": total_issues,
        "average_issues_per_review": avg_issues,
        "languages": sorted(list(languages)),
    }

# ============================================
# Export Improvement as Markdown
# ============================================
@router.get("/improvements/{improvement_id}/export", response_class=PlainTextResponse)
async def export_improvement(
    improvement_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> str:
    """
    Export an improvement as Markdown.
    
    Args:
        improvement_id: Improvement ID
        current_user: Current authenticated user
        db: Database session
        
    Returns:
        str: Markdown formatted improvement
        
    Raises:
        HTTPException: If improvement not found or not owned by user
    """
    try:
        improvement_uuid = uuid.UUID(improvement_id)
        improvement = db.query(CodeImprovement).filter(
            CodeImprovement.id == improvement_uuid,
            CodeImprovement.user_id == current_user.id,
        ).first()
        
        if not improvement:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Improvement not found or you don't have permission to export it.",
            )
        
        lines = []
        lines.append(f"# Code Improvement")
        lines.append("")
        lines.append(f"**Language:** {improvement.language or 'Not specified'}")
        lines.append(f"**Focus Area:** {improvement.focus_area or 'All'}")
        lines.append(f"**Date:** {improvement.created_at.strftime('%Y-%m-%d %H:%M:%S') if improvement.created_at else 'N/A'}")
        lines.append("")
        lines.append("## Original Code")
        lines.append("```")
        lines.append(improvement.original_code)
        lines.append("```")
        lines.append("")
        lines.append("## Improved Code")
        lines.append("```")
        lines.append(improvement.improved_code)
        lines.append("```")
        lines.append("")
        
        if improvement.explanation:
            lines.append("## Explanation")
            lines.append(improvement.explanation)
            lines.append("")
        
        if improvement.changes_summary:
            lines.append("## Changes Summary")
            for change in improvement.changes_summary:
                lines.append(f"- **{change.get('change_type', 'modified')}**: {change.get('description', '')}")
                if change.get('impact'):
                    lines.append(f"  - Impact: {change.get('impact')}")
            lines.append("")
        
        return "\n".join(lines)
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid improvement ID format.",
        )

