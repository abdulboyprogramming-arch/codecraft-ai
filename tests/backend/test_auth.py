"""
CodeCraft AI - Authentication Tests

This module contains tests for the authentication API endpoints.

Developer: Abdulrahman Adeeyo
Hackathon: Prometheus July AI Challenge
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

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
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    with TestClient(app) as test_client:
        yield test_client
    
    # Clean up
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def test_user():
    """Create a test user."""
    return {
        "email": "test@example.com",
        "password": "TestPassword123",
        "full_name": "Test User",
    }

# ============================================
# Tests
# ============================================

class TestAuth:
    """Authentication tests."""
    
    def test_signup_success(self, client, test_user):
        """Test successful user registration."""
        response = client.post("/api/auth/signup", json=test_user)
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == test_user["email"]
        assert data["full_name"] == test_user["full_name"]
        assert "id" in data
    
    def test_signup_duplicate_email(self, client, test_user):
        """Test registration with duplicate email."""
        # First registration
        client.post("/api/auth/signup", json=test_user)
        
        # Second registration with same email
        response = client.post("/api/auth/signup", json=test_user)
        assert response.status_code == 400
        assert "Email already registered" in response.text
    
    def test_signup_invalid_email(self, client, test_user):
        """Test registration with invalid email."""
        test_user["email"] = "invalid-email"
        response = client.post("/api/auth/signup", json=test_user)
        assert response.status_code == 422  # Validation error
    
    def test_signup_weak_password(self, client, test_user):
        """Test registration with weak password."""
        test_user["password"] = "weak"
        response = client.post("/api/auth/signup", json=test_user)
        assert response.status_code == 422  # Validation error
    
    def test_login_success(self, client, test_user):
        """Test successful login."""
        # Register user first
        client.post("/api/auth/signup", json=test_user)
        
        # Login
        response = client.post("/api/auth/login", json={
            "email": test_user["email"],
            "password": test_user["password"],
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
    
    def test_login_invalid_password(self, client, test_user):
        """Test login with invalid password."""
        # Register user first
        client.post("/api/auth/signup", json=test_user)
        
        # Login with wrong password
        response = client.post("/api/auth/login", json={
            "email": test_user["email"],
            "password": "WrongPassword123",
        })
        assert response.status_code == 401
        assert "Incorrect email or password" in response.text
    
    def test_login_invalid_email(self, client, test_user):
        """Test login with invalid email."""
        response = client.post("/api/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "SomePassword123",
        })
        assert response.status_code == 401
        assert "Incorrect email or password" in response.text
    
    def test_get_current_user(self, client, test_user):
        """Test getting current user information."""
        # Register and login
        client.post("/api/auth/signup", json=test_user)
        login_response = client.post("/api/auth/login", json={
            "email": test_user["email"],
            "password": test_user["password"],
        })
        token = login_response.json()["access_token"]
        
        # Get current user
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user["email"]
        assert data["full_name"] == test_user["full_name"]
    
    def test_get_current_user_unauthorized(self, client):
        """Test getting current user without authentication."""
        response = client.get("/api/auth/me")
        assert response.status_code == 401
        assert "Not authenticated" in response.text
