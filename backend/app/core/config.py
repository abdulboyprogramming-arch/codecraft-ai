"""
CodeCraft AI - Configuration Management

This module handles environment variables and application configuration
using Pydantic Settings.

Developer: Abdulrahman Adeeyo
Hackathon: Prometheus July AI Challenge
"""

import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator, model_validator
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """
    
    # ============================================
    # Application Settings
    # ============================================
    APP_NAME: str = Field(default="CodeCraft AI API")
    APP_VERSION: str = Field(default="0.1.0")
    APP_ENV: str = Field(default="development")
    DEBUG: bool = Field(default=True)
    LOG_LEVEL: str = Field(default="INFO")
    
    # ============================================
    # Server Settings
    # ============================================
    HOST: str = Field(default="0.0.0.0")
    PORT: int = Field(default=8000)
    ALLOWED_HOSTS: List[str] = Field(default=["localhost", "127.0.0.1"])
    
    # ============================================
    # Database Settings
    # ============================================
    DATABASE_URL: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/codecraft_db"
    )
    DATABASE_POOL_SIZE: int = Field(default=5)
    DATABASE_MAX_OVERFLOW: int = Field(default=10)
    DATABASE_ECHO: bool = Field(default=False)
    
    # ============================================
    # JWT Authentication Settings
    # ============================================
    SECRET_KEY: str = Field(default="your-secret-key-change-in-production")
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7)
    
    # ============================================
    # OpenAI Settings
    # ============================================
    OPENAI_API_KEY: str = Field(default="")
    OPENAI_MODEL: str = Field(default="gpt-4-turbo")
    OPENAI_MAX_TOKENS: int = Field(default=2000)
    OPENAI_TEMPERATURE: float = Field(default=0.3)
    OPENAI_TIMEOUT: int = Field(default=60)
    
    # ============================================
    # CORS Settings
    # ============================================
    CORS_ORIGINS: List[str] = Field(default=["http://localhost:3000", "http://localhost:8000"])
    CORS_CREDENTIALS: bool = Field(default=True)
    CORS_METHODS: List[str] = Field(default=["*"])
    CORS_HEADERS: List[str] = Field(default=["*"])
    
    # ============================================
    # Rate Limiting Settings
    # ============================================
    RATE_LIMIT_ENABLED: bool = Field(default=True)
    RATE_LIMIT_REQUESTS: int = Field(default=100)
    RATE_LIMIT_PERIOD: int = Field(default=60)
    
    # ============================================
    # Cache Settings
    # ============================================
    CACHE_ENABLED: bool = Field(default=True)
    CACHE_TTL: int = Field(default=3600)
    REDIS_URL: Optional[str] = Field(default=None)
    
    # ============================================
    # Security Settings
    # ============================================
    MAX_REQUEST_SIZE: int = Field(default=10 * 1024 * 1024)  # 10MB
    ALLOWED_EXTENSIONS: List[str] = Field(default=[".py", ".js", ".java", ".cpp", ".ts"])
    MAX_CODE_LENGTH: int = Field(default=50000)
    
    # ============================================
    # Email Settings (Optional)
    # ============================================
    SMTP_HOST: Optional[str] = Field(default=None)
    SMTP_PORT: Optional[int] = Field(default=None)
    SMTP_USER: Optional[str] = Field(default=None)
    SMTP_PASSWORD: Optional[str] = Field(default=None)
    
    # ============================================
    # OAuth2 Settings
    # ============================================
    GOOGLE_CLIENT_ID: Optional[str] = Field(default=None)
    GOOGLE_CLIENT_SECRET: Optional[str] = Field(default=None)
    GITHUB_CLIENT_ID: Optional[str] = Field(default=None)
    GITHUB_CLIENT_SECRET: Optional[str] = Field(default=None)
    FRONTEND_URL: str = Field(default="http://localhost:3000")
    BACKEND_URL: str = Field(default="http://localhost:8000")
    
    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
        "extra": "ignore",
    }

    @field_validator("SECRET_KEY", mode="before")
    @classmethod
    def validate_secret_key(cls, v):
        """Validate that SECRET_KEY is set in production."""
        if os.getenv("APP_ENV") == "production" and v == "your-secret-key-change-in-production":
            raise ValueError("SECRET_KEY must be set in production")
        return v
    
    @field_validator("OPENAI_API_KEY", mode="before")
    @classmethod
    def validate_openai_key(cls, v):
        """Validate that OPENAI_API_KEY is set."""
        if os.getenv("APP_ENV") == "production" and not v:
            raise ValueError("OPENAI_API_KEY must be set in production")
        return v

    @field_validator("ALLOWED_HOSTS", "CORS_ORIGINS", "CORS_METHODS", "CORS_HEADERS", "ALLOWED_EXTENSIONS", mode="before")
    @classmethod
    def parse_comma_separated_list(cls, v):
        if isinstance(v, str):
            return [item.strip() for item in v.split(",") if item.strip()]
        return v

# Create singleton instance
settings = Settings()

# ============================================
# Export
# ============================================
__all__ = ["settings"]

