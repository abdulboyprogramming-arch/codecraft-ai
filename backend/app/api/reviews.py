"""
CodeCraft AI - Code Review API Endpoints

This module handles code review submissions, retrieval of review history,
and management of review feedback.

Developer: Abdulrahman Adeeyo
Hackathon: Prometheus July AI Challenge
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
import uuid

from ..core.database import get_db
from ..core.auth import get_current_user
from ..models.user import User
from ..models.review import Review
from ..schemas.review import (
    ReviewRequest,
    ReviewResponse,
    ReviewHistoryResponse,
    FeedbackResponse,
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
    
    # Calculate average issues per review
    reviews = db.query(Review).filter(Review.user_id == current_user.id).all()
    total_issues = 0
    for review in reviews:
        feedback = review.feedback_data
        total_issues += (
            len(feedback.get("logic", [])) +
            len(feedback.get("efficiency", [])) +
            len(feedback.get("style", [])) +
            len(feedback.get("security", []))
        )
    
    avg_issues = total_issues / total_reviews if total_reviews > 0 else 0
    
    return {
        "total_reviews": total_reviews,
        "total_issues": total_issues,
        "average_issues_per_review": round(avg_issues, 2),
        "languages": ["python", "javascript", "java", "cpp", "typescript"],
    }

