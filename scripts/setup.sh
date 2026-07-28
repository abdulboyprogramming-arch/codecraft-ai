#!/bin/bash
# ============================================
# CodeCraft AI - Setup Script
# ============================================
# This script sets up the CodeCraft AI development environment.
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
echo -e "${BLUE}CodeCraft AI - Development Setup${NC}"
echo -e "${BLUE}============================================${NC}"

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    echo "Please install Docker: https://docs.docker.com/get-docker/"
    exit 1
fi
echo -e "${GREEN}✅ Docker installed${NC}"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose installed${NC}"

# Check Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed${NC}"
    echo "Please install Git: https://git-scm.com/downloads"
    exit 1
fi
echo -e "${GREEN}✅ Git installed${NC}"

# Create environment files
echo -e "\n${YELLOW}Setting up environment files...${NC}"

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✅ Created backend/.env${NC}"
else
    echo -e "${YELLOW}⚠️  backend/.env already exists${NC}"
fi

if [ ! -f "frontend/.env.local" ]; then
    cp frontend/.env.local.example frontend/.env.local
    echo -e "${GREEN}✅ Created frontend/.env.local${NC}"
else
    echo -e "${YELLOW}⚠️  frontend/.env.local already exists${NC}"
fi

# Prompt for OpenAI API Key
echo -e "\n${YELLOW}OpenAI API Key Required${NC}"
echo "Get your API key from: https://platform.openai.com/api-keys"
read -p "Enter your OpenAI API Key (or press Enter to skip): " OPENAI_KEY

if [ ! -z "$OPENAI_KEY" ]; then
    # Update backend .env with OpenAI key
    sed -i "s/OPENAI_API_KEY=.*/OPENAI_API_KEY=$OPENAI_KEY/" backend/.env
    echo -e "${GREEN}✅ OpenAI API Key set in backend/.env${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping OpenAI API Key. You'll need to set it manually.${NC}"
fi

# Generate SECRET_KEY
echo -e "\n${YELLOW}Generating JWT secret key...${NC}"
SECRET_KEY=$(openssl rand -hex 32)
sed -i "s/SECRET_KEY=.*/SECRET_KEY=$SECRET_KEY/" backend/.env
echo -e "${GREEN}✅ Secret key generated and set in backend/.env${NC}"

# Build and start containers
echo -e "\n${YELLOW}Building Docker images...${NC}"
docker-compose build

echo -e "\n${YELLOW}Starting services...${NC}"
docker-compose up -d

# Wait for services to be ready
echo -e "\n${YELLOW}Waiting for services to be ready...${NC}"
sleep 10

# Check services
echo -e "\n${YELLOW}Checking services...${NC}"

# Check backend
if curl -s http://localhost:8000/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is running on http://localhost:8000${NC}"
else
    echo -e "${RED}❌ Backend is not responding${NC}"
fi

# Check frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend is running on http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Frontend is not responding${NC}"
fi

echo -e "\n${BLUE}============================================${NC}"
echo -e "${GREEN}✅ Setup complete!${NC}"
echo -e "${BLUE}============================================${NC}"
echo -e "\nAccess your application:"
echo -e "  Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "  Backend API: ${GREEN}http://localhost:8000${NC}"
echo -e "  API Documentation: ${GREEN}http://localhost:8000/docs${NC}"
echo -e "  Database Admin (pgAdmin): ${GREEN}http://localhost:5050${NC}"
echo -e "\nUseful commands:"
echo -e "  ${YELLOW}docker-compose logs -f${NC} - View logs"
echo -e "  ${YELLOW}docker-compose down${NC} - Stop services"
echo -e "  ${YELLOW}docker-compose up -d${NC} - Start services"
echo -e "\nHappy coding! 🚀"
