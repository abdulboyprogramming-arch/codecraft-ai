# CodeCraft AI - Deployment Guide

## Overview

This guide covers deployment options for CodeCraft AI in various environments.

---

## Prerequisites

### Required
- Docker & Docker Compose (for containerized deployment)
- Node.js 18+ (for manual frontend deployment)
- Python 3.10+ (for manual backend deployment)
- PostgreSQL 15+ (for database)
- OpenAI API Key
- Domain name (optional, recommended)

### Recommended
- Git for version control
- CI/CD pipeline (GitHub Actions, GitLab CI)
- Monitoring tools (Sentry, Prometheus)

---

## Option 1: Docker Deployment (Recommended)

### Development Environment

```bash
# Clone repository
git clone https://github.com/abdulboyprogramming-arch/codecraft-ai.git
cd codecraft-ai

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Edit .env files with your values
# Especially OPENAI_API_KEY

# Build and start containers
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop containers
docker-compose down
```

Production Environment

```bash
# Set production environment variables
export APP_ENV=production
export SECRET_KEY=$(openssl rand -hex 32)
export OPENAI_API_KEY=your_openai_key_here

# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production containers
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

---

Option 2: Manual Deployment

Backend Deployment

1. Setup Python Environment

```bash
# Create and activate virtual environment
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

2. Configure Environment

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your values
# Required: DATABASE_URL, OPENAI_API_KEY, SECRET_KEY
```

3. Initialize Database

```bash
# Run migrations
alembic upgrade head

# Create superuser (optional)
python scripts/create_superuser.py
```

4. Run the Application

Development:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Production with Gunicorn:

```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
```

Frontend Deployment

1. Install Dependencies

```bash
cd frontend
npm install
```

2. Configure Environment

```bash
# Copy environment file
cp .env.local.example .env.local

# Edit .env.local with your API URL
```

3. Build the Application

```bash
# Build for production
npm run build

# Test the build
npm start
```

4. Serve the Application

Option A: Next.js Server

```bash
npm start
```

Option B: Static Export

```bash
npm run build
# Output in .next/ directory, serve with any static server
```

---

Option 3: Cloud Deployment

Render.com

Backend (Web Service)

1. Connect GitHub repository
2. Create New Web Service
3. Settings:
   · Environment: Python
   · Build Command: pip install -r requirements.txt
   · Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
4. Add Environment Variables:
   · DATABASE_URL: Your PostgreSQL URL
   · OPENAI_API_KEY: Your OpenAI key
   · SECRET_KEY: Generate with openssl rand -hex 32

Frontend (Static Site)

1. Connect GitHub repository
2. Create New Static Site
3. Settings:
   · Build Command: npm run build
   · Publish Directory: .next
4. Environment Variables:
   · NEXT_PUBLIC_API_URL: Your backend URL

Database

1. Create New PostgreSQL Database
2. Copy connection string to backend environment

Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Follow prompts
# Set environment variables:
# NEXT_PUBLIC_API_URL = https://your-backend-url.com/api
```

Heroku

Backend:

```bash
# Create Procfile
echo "web: gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app" > Procfile

# Deploy
heroku create codecraft-ai-backend
heroku config:set DATABASE_URL=your_db_url
heroku config:set OPENAI_API_KEY=your_key
heroku config:set SECRET_KEY=your_secret
git push heroku main
```

Frontend:

```bash
# Create Heroku buildpack for Next.js
heroku create codecraft-ai-frontend --buildpack https://github.com/heroku/heroku-buildpack-nodejs
heroku config:set NEXT_PUBLIC_API_URL=backend_url
git subtree push --prefix frontend heroku main
```

AWS (EC2 + RDS)

1. Database (RDS)

```bash
# Create PostgreSQL instance
# Note: Security group must allow access from EC2
```

2. Backend (EC2)

```bash
# SSH into EC2 instance
ssh -i key.pem ec2-user@instance-ip

# Install Docker
sudo yum install docker
sudo service docker start

# Run backend container
docker run -d \
  -p 8000:8000 \
  -e DATABASE_URL=postgresql://user:pass@rds-host:5432/db \
  -e OPENAI_API_KEY=your_key \
  -e SECRET_KEY=your_secret \
  codecraft-ai-backend
```

3. Frontend (S3 + CloudFront)

```bash
# Build frontend
cd frontend
npm run build

# Sync to S3 bucket
aws s3 sync .next/ s3://your-bucket/

# Configure CloudFront distribution
# Origin: S3 bucket
# Error pages: 200 for index.html
```

---

Environment Variables Reference

Backend (.env)

Variable Required Description Default
DATABASE_URL Yes PostgreSQL connection string -
SECRET_KEY Yes JWT signing key -
OPENAI_API_KEY Yes OpenAI API key -
OPENAI_MODEL No OpenAI model gpt-4-turbo
OPENAI_MAX_TOKENS No Max tokens per request 2000
OPENAI_TEMPERATURE No Response creativity 0.3
ACCESS_TOKEN_EXPIRE_MINUTES No Token expiration 30
APP_ENV No Environment development
CORS_ORIGINS No Allowed CORS origins http://localhost:3000

Frontend (.env.local)

Variable Required Description Default
NEXT_PUBLIC_API_URL Yes Backend API URL http://localhost:8000/api
NEXT_PUBLIC_APP_NAME No Application name CodeCraft AI

---

Docker Images

Build Images

```bash
# Build backend image
docker build -t codecraft-ai-backend ./backend

# Build frontend image
docker build -t codecraft-ai-frontend ./frontend

# Push to registry (optional)
docker tag codecraft-ai-backend username/codecraft-ai-backend:latest
docker push username/codecraft-ai-backend:latest
```

Docker Compose Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Rebuild services
docker-compose up -d --build

# Clean up
docker-compose down -v
```

---

Post-Deployment Steps

1. Health Check

```bash
# Check backend health
curl http://your-domain/health

# Check frontend
curl http://your-domain
```

2. SSL Certificate (HTTPS)

Using Let's Encrypt:

```bash
# Install certbot
sudo apt-get install certbot

# Generate certificate
certbot certonly --standalone -d your-domain.com

# Configure Nginx to use certificate
```

3. Monitoring

Sentry (Error Tracking):

```bash
# Add to backend
pip install sentry-sdk

# Configure in main.py
import sentry_sdk
sentry_sdk.init(dsn="your_sentry_dsn")
```

Uptime Monitoring:

· Use UptimeRobot or similar service
· Monitor /health endpoint

4. Backups

```bash
# Database backup
pg_dump -U postgres -d codecraft_db > backup.sql

# Automated backups (cron job)
0 2 * * * pg_dump -U postgres -d codecraft_db > /backups/$(date +%Y%m%d).sql
```

---

Troubleshooting

Common Issues

1. Database Connection Failed

· Check DATABASE_URL format
· Ensure database is running
· Check network/firewall rules

2. OpenAI API Key Invalid

· Verify key is correct
· Check account has credits
· Try other models

3. CORS Errors

· Add your domain to CORS_ORIGINS
· Check frontend API URL

4. Rate Limiting

· Increase limits in settings
· Add Redis for distributed rate limiting

Logging

```bash
# View application logs
docker-compose logs -f backend

# View error logs
docker-compose logs backend | grep ERROR

# Access logs (if using Nginx)
tail -f /var/log/nginx/access.log
```

---

Security Best Practices

1. Never commit .env files
2. Use strong SECRET_KEY (openssl rand -hex 32)
3. Enable HTTPS in production
4. Set secure CORS policies
5. Implement rate limiting
6. Keep dependencies updated
7. Use environment-specific configs

---

**Developer:** Abdulrahman Adeeyo

**Hackathon:** Prometheus July AI Challenge

**Repository:** https://github.com/abdulboyprogramming-arch/codecraft-ai.git
