"""
CodeCraft AI - Review Tests

This module contains tests for the code review API endpoints.

Developer: Abdulrahman Adeeyo
Hackathon: Prometheus July AI Challenge
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from unittest.mock import patch, AsyncMock

# Updated imports - now referencing from the correct path
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.app.main import app
from backend.app.core.database import Base, get_db
from backend.app.models.user import User
from backend.app.core.security import hash_password

# ============================================
# Test Database Setup
# ============================================

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# ============================================
# Test Fixtures
# ============================================

@pytest.fixture
def client():
    """Create a test client."""
    Base.metadata.create_all(bind=engine)
    
    with TestClient(app) as test_client:
        yield test_client
    
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def auth_token(client):
    """Create a test user and return auth token."""
    # Register user
    client.post("/api/auth/signup", json={
        "email": "test@example.com",
        "password": "TestPassword123",
        "full_name": "Test User",
    })
    
    # Login
    response = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "TestPassword123",
    })
    return response.json()["access_token"]

# ============================================
# Tests
# ============================================

class TestReviews:
    """Code review tests."""
    
    @patch("backend.app.services.ai_service.ai_service.review_code")
    def test_submit_review_success(self, mock_review, client, auth_token):
        """Test successful code review submission."""
        # Mock AI service response
        mock_review.return_value = {
            "logic": [{"message": "Test logic issue", "severity": "error"}],
            "efficiency": [],
            "style": [],
            "security": [],
            "summary": "Test summary",
            "score": 75,
        }
        
        response = client.post(
            "/api/reviews/",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "code": "def test(): print('Hello')",
                "language": "python",
                "title": "Test Review",
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["code"] == "def test(): print('Hello')"
        assert data["language"] == "python"
        assert data["title"] == "Test Review"
        assert "feedback" in data
    
    def test_submit_review_unauthorized(self, client):
        """Test submitting review without authentication."""
        response = client.post(
            "/api/reviews/",
            json={
                "code": "def test(): print('Hello')",
                "language": "python",
            }
        )
        assert response.status_code == 401
    
    def test_submit_review_empty_code(self, client, auth_token):
        """Test submitting review with empty code."""
        response = client.post(
            "/api/reviews/",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "code": "",
                "language": "python",
            }
        )
        assert response.status_code == 422  # Validation error
    
    def test_submit_review_code_too_long(self, client, auth_token):
        """Test submitting review with very long code."""
        long_code = "x" * 60000  # Exceeds 50,000 character limit
        
        response = client.post(
            "/api/reviews/",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "code": long_code,
                "language": "python",
            }
        )
        assert response.status_code == 422  # Validation error
    
    @patch("backend.app.services.ai_service.ai_service.review_code")
    def test_get_review_history(self, mock_review, client, auth_token):
        """Test getting review history."""
        # Mock AI service response
        mock_review.return_value = {
            "logic": [],
            "efficiency": [],
            "style": [],
            "security": [],
            "summary": "Test",
            "score": 100,
        }
        
        # Submit a review
        client.post(
            "/api/reviews/",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "code": "def test(): print('Hello')",
                "language": "python",
            }
        )
        
        # Get history
        response = client.get(
            "/api/reviews/history",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 1
    
    @patch("backend.app.services.ai_service.ai_service.review_code")
    def test_get_review_by_id(self, mock_review, client, auth_token):
        """Test getting a specific review by ID."""
        # Mock AI service response
        mock_review.return_value = {
            "logic": [],
            "efficiency": [],
            "style": [],
            "security": [],
            "summary": "Test",
            "score": 100,
        }
        
        # Submit a review
        response = client.post(
            "/api/reviews/",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "code": "def test(): print('Hello')",
                "language": "python",
            }
        )
        review_id = response.json()["id"]
        
        # Get the review
        response = client.get(
            f"/api/reviews/{review_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == review_id
        assert data["code"] == "def test(): print('Hello')"
    
    @patch("backend.app.services.ai_service.ai_service.review_code")
    def test_delete_review(self, mock_review, client, auth_token):
        """Test deleting a review."""
        # Mock AI service response
        mock_review.return_value = {
            "logic": [],
            "efficiency": [],
            "style": [],
            "security": [],
            "summary": "Test",
            "score": 100,
        }
        
        # Submit a review
        response = client.post(
            "/api/reviews/",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "code": "def test(): print('Hello')",
                "language": "python",
            }
        )
        review_id = response.json()["id"]
        
        # Delete the review
        response = client.delete(
            f"/api/reviews/{review_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 204
        
        # Verify it's gone
        response = client.get(
            f"/api/reviews/{review_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 404
