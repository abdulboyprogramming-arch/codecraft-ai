# CodeCraft AI - System Architecture

## Overview

CodeCraft AI is a full-stack web application built with a modern, scalable architecture. The system consists of a React/Next.js frontend, a FastAPI backend, and a PostgreSQL database, with OpenAI integration for AI-powered code review.

## Architecture Diagram

```

┌─────────────────────────────────────────────────────────────┐
│                        Client Browser                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Next.js Frontend (React)               │   │
│  │  - Dashboard, Code Editor, Feedback Display         │   │
│  │  - State Management (Context API)                   │   │
│  │  - Styling (Tailwind CSS)                           │   │
│  └────────────────────┬────────────────────────────────┘   │
│                       │ HTTPS                              │
└───────────────────────┼─────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  API Layer (RESTful)                                │   │
│  │  - Authentication (JWT)                             │   │
│  │  - Code Review Endpoints                            │   │
│  │  - User Management                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Service Layer                                      │   │
│  │  - AI Service (OpenAI Integration)                  │   │
│  │  - Rate Limiting                                    │   │
│  │  - Cache Service                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Data Layer                                         │   │
│  │  - SQLAlchemy ORM                                   │   │
│  │  - PostgreSQL Database                              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              OpenAI API                             │   │
│  │  - GPT-4 Model for Code Review                      │   │
│  │  - Structured JSON Responses                        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

```

## Component Breakdown

### 1. Frontend (Next.js + React)

**Purpose:** User interface and client-side logic

**Key Features:**
- **Code Editor:** Syntax-highlighted editor for code input
- **Feedback Display:** Categorized display of AI feedback
- **Review History:** List of past reviews with search/filter
- **Authentication:** Login, signup, and session management
- **Responsive Design:** Works on desktop, tablet, and mobile

**Technologies:**
- Next.js 14 (App Router)
- React 18 with Hooks
- Tailwind CSS for styling
- react-simple-code-editor
- Prism.js for syntax highlighting
- Axios for API calls

### 2. Backend (FastAPI)

**Purpose:** API server, business logic, and data management

**Key Features:**
- **Authentication:** JWT-based authentication with bcrypt
- **Code Review:** Integration with OpenAI for code analysis
- **Rate Limiting:** Protect API from abuse
- **Caching:** Improve performance with Redis (optional)
- **Database:** PostgreSQL with SQLAlchemy ORM

**Technologies:**
- FastAPI (Python)
- Pydantic for validation
- SQLAlchemy ORM
- PostgreSQL
- OpenAI API
- python-jose (JWT)
- bcrypt (Password hashing)

### 3. Database (PostgreSQL)

**Purpose:** Persistent data storage

**Schema:**

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0
);
```

#### Reviews Table

```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    code TEXT NOT NULL,
    language VARCHAR(50),
    feedback_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);
```

### 4. AI Service (OpenAI)

**Purpose:** Code analysis and feedback generation

**Workflow:**

1. User submits code
2. Backend sends code to OpenAI with structured prompt
3. GPT-4 analyzes code for logic, efficiency, style, security
4. OpenAI returns structured JSON feedback
5. Backend parses, saves, and returns feedback to frontend

Prompt Engineering:

```python
SYSTEM_PROMPT = """
You are CodeCraft AI, a Senior Software Engineer...
Provide feedback as JSON with:
- logic: list of issues
- efficiency: list of issues
- style: list of issues
- security: list of issues
- summary: overall assessment
- score: 0-100 quality score
"""
```

## Data Flow

**Authentication Flow**

```
1. User submits email/password
2. Backend validates credentials
3. Backend generates JWT tokens
4. Frontend stores tokens in localStorage
5. Frontend includes token in subsequent requests
6. Backend validates token on protected routes
```

**Code Review Flow**

```
1. User pastes code in editor
2. Frontend sends code + language to /api/reviews
3. Backend validates and rate limits
4. Backend calls OpenAI API with prompt
5. OpenAI returns structured feedback
6. Backend saves review to database
7. Backend returns feedback to frontend
8. Frontend displays categorized feedback
```

## Security Considerations

**Authentication**

· JWT tokens with 30-minute expiration

· Refresh tokens for extended sessions

· bcrypt password hashing

· HTTPS in production

**Data Protection**

· CORS configured for allowed origins

· Input validation with Pydantic

· SQL injection prevention with ORM

· CSRF protection for forms

**Rate Limiting**

· 60 requests per minute per user

· 1000 requests per hour per user

· Returns 429 Too Many Requests

## Performance Optimization

**Frontend**

· Next.js automatic code splitting

· Image optimization with next/image

· Lazy loading of components

· Static page generation for public pages

**Backend**

· Database connection pooling

· Async/await for concurrent operations

· Caching with Redis (optional)

· Gunicorn for production serving

## Deployment Architecture

**Development**

· Docker Compose for local development

· Hot reloading for both frontend and backend

· PostgreSQL in Docker container

**Production (Recommended)**

```
┌─────────────────────────────────────────┐
│          Load Balancer (Nginx)          │
├─────────────────────────────────────────┤
│         CDN (CloudFront/Cloudflare)     │
├─────────────────────────────────────────┤
│         Application Servers             │
│  ┌──────────────────────────────┐       │
│  │  Next.js (Vercel/Node.js)    │       │
│  └──────────────────────────────┘       │
│  ┌──────────────────────────────┐       │
│  │  FastAPI (Gunicorn/Uvicorn)  │       │
│  └──────────────────────────────┘       │
├─────────────────────────────────────────┤
│         Database (RDS/PostgreSQL)       │
├─────────────────────────────────────────┤
│         Redis (ElastiCache)             │
└─────────────────────────────────────────┘
```

## Monitoring & Logging

**Logging**

· Structured logging with Loguru

· Log levels: DEBUG, INFO, WARNING, ERROR

· Logs stored in files and cloud services

**Monitoring**

· Health check endpoint: `/health`

· Prometheus metrics for performance

· Error tracking with Sentry (optional)

· Application performance monitoring

## Future Improvements

1. **Real-time Collaboration:** Add WebSocket support for pair programming
2. **Code Execution:** Run code in sandbox to test functionality
3. **Team Features:** Organizations, team reviews, and shared history
4. **CI/CD Integration:** GitHub Actions for automated reviews
5. **IDE Plugin:** VS Code extension for seamless integration
6. **Custom Models:** Fine-tuned models for specific languages/frameworks

---

**Developer:** Abdulrahman Adeeyo

**Hackathon:** Prometheus July AI Challenge

**Repository:** https://github.com/abdulboyprogramming-arch/codecraft-ai.git
