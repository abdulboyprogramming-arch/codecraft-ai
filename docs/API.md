# CodeCraft AI - API Documentation

## Overview

CodeCraft AI provides a RESTful API for AI-powered code review. All endpoints are prefixed with `/api`.

**Base URL:** `http://localhost:8000/api`

**Authentication:** JWT Bearer token required for protected endpoints.

---

## Authentication Endpoints

### POST /auth/signup

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe"
}
```

Response (201 Created):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "full_name": "John Doe",
  "created_at": "2024-01-01T12:00:00Z"
}
```

Errors:

· 400: Email already registered
· 422: Validation error

---

### POST /auth/login

Login and receive authentication tokens.

Request Body:

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

Response (200 OK):

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

Errors:

· 401: Invalid credentials

---

### GET /auth/me

Get current user information.

Headers:

```
Authorization: Bearer <access_token>
```

Response (200 OK):

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "full_name": "John Doe",
  "created_at": "2024-01-01T12:00:00Z",
  "last_login": "2024-01-02T10:00:00Z"
}
```

---

### POST /auth/refresh

Refresh access token using refresh token.

Request Body:

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

Response (200 OK):

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

---

### POST /auth/logout

Logout user (client-side token removal).

Headers:

```
Authorization: Bearer <access_token>
```

Response (200 OK):

```json
{
  "message": "Logged out successfully"
}
```

---

## Review Endpoints

### POST /reviews

Submit code for AI review.

Headers:

```
Authorization: Bearer <access_token>
```

Request Body:

```json
{
  "code": "def hello(): print('Hello World')",
  "language": "python",
  "title": "My First Review"
}
```

Response (201 Created):

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "title": "My First Review",
  "code": "def hello(): print('Hello World')",
  "language": "python",
  "feedback": {
    "logic": [
      {
        "message": "Function doesn't handle edge cases",
        "line": 1,
        "severity": "warning",
        "suggestion": "Add type hints and error handling"
      }
    ],
    "efficiency": [],
    "style": [
      {
        "message": "Add docstring for better documentation",
        "line": 1,
        "severity": "info",
        "suggestion": "Add a docstring explaining the function"
      }
    ],
    "security": [],
    "summary": "Overall, the code is functional but could be improved with better documentation and error handling.",
    "score": 75
  },
  "created_at": "2024-01-01T12:00:00Z"
}
```

Errors:

· 400: Code too long or invalid
· 429: Rate limit exceeded
· 500: Server error

---

### GET /reviews/history

Get user's review history.

Headers:

```
Authorization: Bearer <access_token>
```

Query Parameters:

· skip (int, optional): Number of records to skip
· limit (int, optional): Maximum records to return (default: 50)

Response (200 OK):

```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "My First Review",
    "code": "def hello(): print('Hello World')",
    "created_at": "2024-01-01T12:00:00Z",
    "feedback": {
      "logic": [],
      "efficiency": [],
      "style": [],
      "security": [],
      "summary": "Good code!",
      "score": 85
    },
    "total_issues": 0
  }
]
```

---

### GET /reviews/{review_id}

Get a specific review by ID.

Headers:

```
Authorization: Bearer <access_token>
```

Response (200 OK):
Same as POST /reviews response.

Errors:

· 404: Review not found

---

### DELETE /reviews/{review_id}

Delete a specific review.

Headers:

```
Authorization: Bearer <access_token>
```

Response (204 No Content)

Errors:

· 404: Review not found

---

### GET /reviews/stats/summary

Get review statistics for the current user.

Headers:

```
Authorization: Bearer <access_token>
```

Response (200 OK):

```json
{
  "total_reviews": 10,
  "total_issues": 25,
  "average_issues_per_review": 2.5,
  "languages": ["python", "javascript", "java"]
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "detail": "Human-readable error message"
}
```

Common HTTP Status Codes:

· 200: Success
· 201: Created
· 204: No Content
· 400: Bad Request
· 401: Unauthorized
· 404: Not Found
· 422: Validation Error
· 429: Too Many Requests
· 500: Internal Server Error

---

## Rate Limiting

· Requests per minute: 60
  
· Requests per hour: 1000
  
· Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset

---

## Versioning

API version is included in the base URL. Current version: v1.

---

**Developer:** Abdulrahman Adeeyo
  
**Hackathon:** Prometheus July AI Challenge
  
**Repository:** https://github.com/abdulboyprogramming-arch/codecraft-ai.git
