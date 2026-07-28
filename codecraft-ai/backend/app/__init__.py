"""
CodeCraft AI - Backend Application

This package contains the main FastAPI application for the CodeCraft AI
code review platform. It handles authentication, code review processing,
and AI integration with OpenAI's GPT-4 model.

Developer: Abdulrahman Adeeyo
Hackathon: Prometheus July AI Challenge
Repository: https://github.com/abdulboyprogramming-arch/codecraft-ai.git
"""

__version__ = "0.1.0"
__author__ = "Abdulrahman Adeeyo"

from .main import app

__all__ = ["app"]

