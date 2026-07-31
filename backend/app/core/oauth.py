"""
CodeCraft AI - OAuth2 Client Utilities

This module provides OAuth2 client implementations for Google and GitHub
authentication providers using direct HTTP calls with httpx.

Developer: Abdulrahman Adeeyo
Hackathon: Prometheus July AI Challenge
"""

import httpx
from fastapi import HTTPException
from typing import Dict
import logging

from .config import settings

logger = logging.getLogger(__name__)

# ============================================
# OAuth2 Endpoints
# ============================================
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"

# ============================================
# OAuth Client Class
# ============================================
class OAuthClient:
    """OAuth2 client for external authentication providers."""

    # ============================================
    # Token Exchange
    # ============================================
    @staticmethod
    async def exchange_code_for_token(provider: str, code: str, redirect_uri: str) -> Dict:
        """
        Exchange authorization code for access token.
        
        Args:
            provider: OAuth provider name (google or github)
            code: Authorization code from provider
            redirect_uri: Registered redirect URI
            
        Returns:
            Dict: Token response containing access_token
            
        Raises:
            HTTPException: If token exchange fails
        """
        async with httpx.AsyncClient() as client:
            if provider == "google":
                response = await client.post(
                    GOOGLE_TOKEN_URL,
                    data={
                        "code": code,
                        "client_id": settings.GOOGLE_CLIENT_ID,
                        "client_secret": settings.GOOGLE_CLIENT_SECRET,
                        "redirect_uri": redirect_uri,
                        "grant_type": "authorization_code",
                    },
                    headers={"Accept": "application/json"},
                )
            elif provider == "github":
                response = await client.post(
                    GITHUB_TOKEN_URL,
                    json={
                        "code": code,
                        "client_id": settings.GITHUB_CLIENT_ID,
                        "client_secret": settings.GITHUB_CLIENT_SECRET,
                    },
                    headers={"Accept": "application/json"},
                )
            else:
                raise HTTPException(status_code=400, detail="Unsupported OAuth provider")

            if response.status_code != 200:
                logger.error(f"OAuth token exchange failed for {provider}: {response.text}")
                raise HTTPException(status_code=400, detail="OAuth authentication failed")

            return response.json()

    # ============================================
    # User Info Fetching
    # ============================================
    @staticmethod
    async def get_user_info(provider: str, access_token: str) -> Dict:
        """
        Fetch user information from OAuth provider.
        
        Args:
            provider: OAuth provider name (google or github)
            access_token: Valid access token
            
        Returns:
            Dict: User information
            
        Raises:
            HTTPException: If fetching user info fails
        """
        async with httpx.AsyncClient() as client:
            if provider == "google":
                response = await client.get(
                    GOOGLE_USERINFO_URL,
                    headers={"Authorization": f"Bearer {access_token}"},
                )
            elif provider == "github":
                response = await client.get(
                    GITHUB_USER_URL,
                    headers={"Authorization": f"Bearer {access_token}"},
                )
            else:
                raise HTTPException(status_code=400, detail="Unsupported OAuth provider")

            if response.status_code != 200:
                logger.error(f"Failed to fetch {provider} user info: {response.text}")
                raise HTTPException(status_code=400, detail="Failed to retrieve user information")

            return response.json()

# ============================================
# Exports
# ============================================
__all__ = ["OAuthClient"]
