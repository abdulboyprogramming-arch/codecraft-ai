#!/bin/bash
# ============================================
# CodeCraft AI - Production Deployment Script
# ============================================
# This script deploys CodeCraft AI to production.
# 
# Developer: Abdulrahman Adeeyo
# Hackathon: Prometheus July AI Challenge
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}CodeCraft AI - Production Deployment${NC}"
echo -e "${BLUE}============================================${NC}"

# Load environment variables
if [ -f ".env.production" ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Check required variables
REQUIRED_VARS=("DATABASE_URL" "OPENAI_API_KEY" "SECRET_KEY")
MISSING_VARS=()

for VAR in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
        MISSING_VARS+=("$VAR")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${RED}❌ Missing required environment variables:${NC}"
    for VAR in "${MISSING_VARS[@]}"; do
        echo "  - $VAR"
    done
    echo -e "\nSet them in .env.production or export them."
    exit 1
fi

echo -e "${GREEN}✅ Environment variables validated${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    exit 1
fi

# Pull latest changes
echo -e "\n${YELLOW}Updating code...${NC}"
git pull origin main

# Build production images
echo -e "\n${YELLOW}Building production images...${NC}"
docker-compose -f docker-compose.prod.yml build

# Stop old containers
echo -e "\n${YELLOW}Stopping old containers...${NC}"
docker-compose -f docker-compose.prod.yml down

# Start new containers
echo -e "\n${YELLOW}Starting new containers...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo -e "\n${YELLOW}Waiting for services to be ready...${NC}"
sleep 15

# Run database migrations
echo -e "\n${YELLOW}Running database migrations...${NC}"
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Check services
echo -e "\n${YELLOW}Checking services...${NC}"

# Check backend
if curl -s http://localhost:8000/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
fi

# Check frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
else
    echo -e "${RED}❌ Frontend is not responding${NC}"
fi

# Show container status
echo -e "\n${YELLOW}Container status:${NC}"
docker-compose -f docker-compose.prod.yml ps

echo -e "\n${BLUE}============================================${NC}"
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${BLUE}============================================${NC}"

echo -e "\nView logs:"
echo -e "  ${YELLOW}docker-compose -f docker-compose.prod.yml logs -f${NC}"

echo -e "\nRollback:"
echo -e "  ${YELLOW}docker-compose -f docker-compose.prod.yml down${NC}"
echo -e "  ${YELLOW}git reset --hard HEAD^${NC}"
echo -e "  ${YELLOW}docker-compose -f docker-compose.prod.yml up -d${NC}"
