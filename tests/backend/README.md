# CodeCraft AI - Backend Tests

## Overview

This directory contains tests for the CodeCraft AI backend application.

---

## 📋 Table of Contents

1. [Setup](#setup)
2. [Test Structure](#test-structure)
3. [Writing Tests](#writing-tests)
4. [Running Tests](#running-tests)
5. [Test Database](#test-database)
6. [Mocking](#mocking)
7. [Running Tests in CI](#running-tests-in-ci)
8. [Coverage Requirements](#coverage-requirements)
9. [Debugging Tests](#debugging-tests)

---

## Setup

### Install Dependencies

```bash
# Navigate to backend directory
cd backend

# Install test dependencies
pip install -r requirements.txt

# Install additional test dependencies (if not in requirements)
pip install pytest pytest-asyncio pytest-cov httpx
```

### Configure Test Environment

```bash
# Set environment variables for testing
export APP_ENV=testing
export DATABASE_URL=sqlite:///./test.db

# Or create a .env.test file
cat > .env.test << EOF
APP_ENV=testing
DATABASE_URL=sqlite:///./test.db
EOF
```

---

## Test Structure

```
tests/backend/
├── __init__.py                      # Package initialization
├── test_auth.py                     # Authentication tests
├── test_reviews.py                  # Code review tests
├── test_models.py                   # Database model tests (add if needed)
├── test_services.py                 # Service layer tests (add if needed)
├── conftest.py                      # Shared fixtures (add if needed)
└── README.md                        # This file
```

---

## Writing Tests

### Test Example: Authentication

```python
"""
tests/backend/test_auth.py

Authentication API endpoint tests.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from backend.app.main import app
from backend.app.core.database import Base, get_db
from backend.app.models.user import User
from backend.app.core.security import hash_password

# Test database setup
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

@pytest.fixture
def client():
    """Create a test client."""
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as test_client:
        yield test_client
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def test_user():
    """Create a test user."""
    return {
        "email": "test@example.com",
        "password": "TestPassword123",
        "full_name": "Test User",
    }

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
        client.post("/api/auth/signup", json=test_user)
        response = client.post("/api/auth/signup", json=test_user)
        assert response.status_code == 400
        assert "Email already registered" in response.text

    def test_login_success(self, client, test_user):
        """Test successful login."""
        client.post("/api/auth/signup", json=test_user)
        response = client.post("/api/auth/login", json={
            "email": test_user["email"],
            "password": test_user["password"],
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_login_invalid_credentials(self, client, test_user):
        """Test login with invalid credentials."""
        response = client.post("/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "WrongPassword123",
        })
        assert response.status_code == 401
        assert "Incorrect email or password" in response.text
```

### Test Example: Code Reviews

```python
"""
tests/backend/test_reviews.py

Code review API endpoint tests.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from unittest.mock import patch, AsyncMock

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from backend.app.main import app
from backend.app.core.database import Base, get_db

# Test database setup
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
    client.post("/api/auth/signup", json={
        "email": "test@example.com",
        "password": "TestPassword123",
        "full_name": "Test User",
    })
    response = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "TestPassword123",
    })
    return response.json()["access_token"]

class TestReviews:
    """Code review tests."""

    @patch("backend.app.services.ai_service.ai_service.review_code")
    def test_submit_review_success(self, mock_review, client, auth_token):
        """Test successful code review submission."""
        mock_review.return_value = {
            "logic": [{"message": "Test issue", "severity": "error"}],
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
```

### Test Example: Shared Fixtures (conftest.py)

```python
"""
tests/backend/conftest.py

Shared fixtures for all backend tests.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from backend.app.main import app
from backend.app.core.database import Base, get_db

# Test database
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
    client.post("/api/auth/signup", json={
        "email": "test@example.com",
        "password": "TestPassword123",
        "full_name": "Test User",
    })
    response = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "TestPassword123",
    })
    return response.json()["access_token"]

@pytest.fixture
def test_user():
    """Create a test user."""
    return {
        "email": "test@example.com",
        "password": "TestPassword123",
        "full_name": "Test User",
    }
```

---

## Running Tests

### Run All Tests

```bash
# From project root
python -m pytest tests/backend/

# From backend directory
cd backend
pytest tests/backend/
```

### Run Specific Test File

```bash
python -m pytest tests/backend/test_auth.py -v
```

### Run Specific Test Function

```bash
python -m pytest tests/backend/test_auth.py::TestAuth::test_login_success -v
```

### Run with Coverage

```bash
# Run with coverage report
python -m pytest tests/backend/ --cov=app --cov-report=term

# Generate HTML coverage report
python -m pytest tests/backend/ --cov=app --cov-report=html

# Open coverage report
# Open htmlcov/index.html in browser
```

### Run with Verbose Output

```bash
python -m pytest tests/backend/ -v
```

### Run Specific Markers

```bash
# Run only auth tests
python -m pytest tests/backend/ -m auth

# Run only review tests
python -m pytest tests/backend/ -m reviews

# Skip slow tests
python -m pytest tests/backend/ -m "not slow"
```

---

## Test Database

### Using SQLite (Recommended for Testing)

```python
# tests/backend/conftest.py

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
```

### Using PostgreSQL (For Integration Tests)

```python
# tests/backend/conftest.py

# Use a separate test database
import os
SQLALCHEMY_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/codecraft_test_db"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
```

### Clean Up After Tests

```python
# tests/backend/conftest.py

@pytest.fixture(scope="session")
def db_setup():
    """Set up and clean up test database."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    # Remove test database file
    if os.path.exists("test.db"):
        os.remove("test.db")
```

---

## Mocking

### Mock OpenAI API

```python
from unittest.mock import patch, AsyncMock

@patch("backend.app.services.ai_service.ai_service.review_code")
def test_ai_review(self, mock_review):
    """Test AI review functionality."""
    mock_review.return_value = {
        "logic": [{"message": "Test issue", "severity": "error"}],
        "efficiency": [],
        "style": [],
        "security": [],
        "summary": "Test summary",
        "score": 75,
    }

    # Test code that calls ai_service.review_code
    # ... assertions ...
```

### Mock Database

```python
from unittest.mock import MagicMock

def test_with_mock_db():
    """Test with mocked database."""
    mock_db = MagicMock()
    mock_db.query.return_value.filter.return_value.first.return_value = None

    # Test with mock_db
    # ... assertions ...
```

### Mock External API

```python
import httpx
from unittest.mock import patch

@patch("httpx.AsyncClient.post")
async def test_external_api(mock_post):
    """Test external API call."""
    mock_post.return_value = AsyncMock()
    mock_post.return_value.status_code = 200
    mock_post.return_value.json.return_value = {"data": "test"}

    # Test code that calls external API
    # ... assertions ...
```

---

## Running Tests in CI

### GitHub Actions

```yaml
# .github/workflows/backend-tests.yml
name: Backend Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: codecraft_test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'

      - name: Install dependencies
        run: |
          cd backend
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install pytest pytest-cov

      - name: Run tests
        run: |
          cd backend
          pytest tests/backend/ --cov=app --cov-report=xml

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: backend/coverage.xml
          flags: backend-tests
```

### GitLab CI

```yaml
# .gitlab-ci.yml
backend-tests:
  stage: test
  image: python:3.10

  services:
    - postgres:15

  variables:
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
    POSTGRES_DB: codecraft_test_db

  script:
    - cd backend
    - pip install -r requirements.txt
    - pip install pytest pytest-cov
    - pytest tests/backend/ --cov=app --cov-report=xml

  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: backend/coverage.xml
```

---

## Coverage Requirements

| Metric | Requirement |
|--------|-------------|
| Statements | 80% |
| Branches | 75% |
| Functions | 80% |
| Lines | 80% |

### Generate Coverage Report

```bash
# Run tests with coverage
pytest tests/backend/ --cov=app --cov-report=html

# Open coverage report
# On Windows
start htmlcov/index.html

# On macOS/Linux
open htmlcov/index.html
```

### Exclude Files from Coverage

```ini
# In .coveragerc or pyproject.toml

[run]
omit =
    */tests/*
    */migrations/*
    */venv/*
    */__init__.py
```

---

## Debugging Tests

### Show Detailed Output

```bash
# Show all output (including print statements)
pytest tests/backend/ -v -s

# Show failing tests only
pytest tests/backend/ -v -x
```

### Use Python Debugger

```python
# Add this where you want to debug
import pdb; pdb.set_trace()

# Then run
pytest tests/backend/test_auth.py -s
```

### Debug with ipdb

```bash
# Install ipdb
pip install ipdb

# Use in test
import ipdb; ipdb.set_trace()
```

### Common Debugging Commands

| Command | Description |
|---------|-------------|
| `pytest -v` | Verbose output |
| `pytest -x` | Stop on first failure |
| `pytest --maxfail=2` | Stop after 2 failures |
| `pytest -k "test_name"` | Run test by name |
| `pytest --pdb` | Enter debugger on failure |
| `pytest --trace` | Trace execution |

---

## 📝 Quick Reference

| Command | Description |
|---------|-------------|
| `pytest tests/backend/` | Run all backend tests |
| `pytest tests/backend/test_auth.py -v` | Run specific test file |
| `pytest tests/backend/ --cov=app` | Run with coverage |
| `pytest tests/backend/ -v -s` | Run with verbose output |
| `pytest tests/backend/ -k "login"` | Run tests matching pattern |
| `pytest tests/backend/ --pdb` | Enter debugger on failure |

---

## 🔧 Troubleshooting

### Common Issues

1. **Import Errors**

```bash
# Make sure Python path includes the project root
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))
```

2. **Database Connection Issues**

```bash
# Use SQLite for tests instead of PostgreSQL
DATABASE_URL=sqlite:///./test.db
```

3. **Mock Not Working**

```python
# Ensure correct import path for mock
@patch("backend.app.services.ai_service.ai_service.review_code")
```

---

**Developer:** Abdulrahman Adeeyo  
**Hackathon:** Prometheus July AI Challenge  
**Repository:** https://github.com/abdulboyprogramming-arch/codecraft-ai.git
