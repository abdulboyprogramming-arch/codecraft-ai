# 🚀 CodeCraft AI

<div align="center">

**AI-Powered Code Review & Feedback Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 18+](https://img.shields.io/badge/node.js-18+-green.svg)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.0-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black.svg)](https://nextjs.org/)

</div>

---

## 📖 Overview

**CodeCraft AI** is a revolutionary AI-powered code review assistant that helps developers of all levels learn, improve, and write better code. Leveraging the power of OpenAI's GPT-4, it provides instant, detailed, and educational feedback on code submissions across multiple programming languages.

### 🎯 The Problem We Solve

Every developer has experienced the frustration of writing code that works but could be better. Traditional code reviews are:
- **Time-consuming**: Waiting for peer reviews slows down development
- **Inconsistent**: Review quality depends on the reviewer's expertise
- **Limited**: Not everyone has access to senior developers
- **Reactive**: Issues are caught late in the development cycle

### 💡 Our Solution

CodeCraft AI acts as your personal Senior Software Engineer, providing:
- **Instant Feedback**: Get reviews in seconds, not hours
- **Comprehensive Analysis**: Logic, efficiency, style, and security
- **Educational Approach**: Learn why something is wrong and how to fix it
- **24/7 Availability**: Review code anytime, anywhere

---

## ✨ Features

### Core Features

| Feature | Description |
|---------|-------------|
| 🔍 **Logic Analysis** | Detect bugs, edge cases, and logical flaws |
| ⚡ **Efficiency Review** | Identify performance bottlenecks and optimize algorithms |
| 🎨 **Code Style Check** | Ensure clean, readable, and maintainable code |
| 🔒 **Security Audit** | Find vulnerabilities and security risks |
| 📚 **Review History** | Track your progress and revisit past reviews |
| 🌐 **Multi-Language** | Support for JavaScript, Python, Java, C++, TypeScript |

### Advanced Features

- **Personalized Feedback**: Tailored suggestions based on code context
- **Educational Explanations**: Understand the "why" behind each suggestion
- **Code Quality Metrics**: Track your improvement over time
- **Export Reports**: Share reviews with team members

---

## 🏗️ Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.10+ | Core language |
| FastAPI | 0.104.0 | API framework |
| PostgreSQL | 15+ | Database |
| SQLAlchemy | 2.0.23 | ORM |
| OpenAI API | Latest | AI integration |
| JWT | - | Authentication |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.0.4 | React framework |
| React | 18.2.0 | UI library |
| Tailwind CSS | 3.3.6 | Styling |
| react-simple-code-editor | 0.13.1 | Code editor |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| Render.com | Cloud deployment |
| GitHub Actions | CI/CD (optional) |

---

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for manual setup)
- Python 3.10+ (for manual setup)
- OpenAI API Key ([Get one here](https://platform.openai.com/api-keys))

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/abdulboyprogramming-arch/codecraft-ai.git
cd codecraft-ai

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Edit .env files with your API keys
# Make sure to set OPENAI_API_KEY in backend/.env

# Start the application
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
Option 2: Manual Setup
Backend Setup
bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your values

# Run migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload
Frontend Setup
bash
cd frontend

# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local

# Start development server
npm run dev
📁 Project Structure
text
codecraft-ai/
├── backend/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── core/          # Core configuration
│   │   ├── models/        # Database models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   ├── migrations/        # Alembic migrations
│   ├── tests/             # Backend tests
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React Context
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Next.js pages
│   │   ├── services/      # API services
│   │   └── styles/        # CSS styles
│   ├── public/            # Static assets
│   ├── package.json
│   ├── next.config.js
│   └── Dockerfile
├── docs/                  # Documentation
├── scripts/               # Utility scripts
├── docker-compose.yml
└── README.md
📚 API Documentation
Once the backend is running, visit:

Swagger UI: http://localhost:8000/docs

ReDoc: http://localhost:8000/redoc

Key Endpoints
Method	Endpoint	Description
POST	/api/auth/signup	Create a new account
POST	/api/auth/login	Login and get JWT token
POST	/api/reviews	Submit code for review
GET	/api/reviews/history	Get review history
GET	/api/reviews/{id}	Get specific review
🧪 Testing
Backend Tests
bash
cd backend
pytest
Frontend Tests
bash
cd frontend
npm test
��� Deployment
Deploy to Render.com
Backend: Create a new Web Service

Build Command: pip install -r requirements.txt

Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT

Environment Variables: DATABASE_URL, OPENAI_API_KEY, SECRET_KEY

Frontend: Create a new Static Site

Build Command: npm run build

Publish Directory: .next

Database: Use Render's PostgreSQL service

For detailed deployment instructions, see docs/DEPLOYMENT.md.

🤝 Contributing
Contributions are welcome! Please read our contributing guidelines before submitting a pull request.

Fork the repository

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
OpenAI for their incredible APIs

The FastAPI and Next.js communities

All hackathon participants and judges

Special thanks to the Prometheus July AI Challenge organizers

📞 Support
Issues: GitHub Issues

Email: support@codecraft-ai.com

Documentation: docs/

🏆 Hackathon Submission
This project was built for the Prometheus July AI Challenge (Deadline: July 31, 2026).

Submission Checklist
☑ Working prototype
☑ 2-minute demo video
☑ Source code (GitHub)
☑ Documentation
☑ Deployment link
Built with ❤️ by Abdulrahman Adeeyo for the Prometheus July AI Challenge

<div align="center"> <sub>Copyright © <span id="year"></span> CodeCraft AI. All Rights Reserved.</sub> </div><script> document.getElementById('year').textContent = new Date().getFullYear(); </script>
