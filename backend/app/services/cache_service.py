"""
CodeCraft AI - Cache Service

This module provides caching functionality for the application.
"""

from typing import Any, Optional
import time

class CacheService:
    def __init__(self):
        self._cache: dict = {}

    def get(self, key: str) -> Optional[Any]:
        return self._cache.get(key)

    def set(self, key: str, value: Any, ttl: int = 3600) -> None:
        self._cache[key] = {"value": value, "expires": time.time() + ttl}

    def delete(self, key: str) -> None:
        self._cache.pop(key, None)

    def clear(self) -> None:
        self._cache.clear()

cache_service = CacheService()

__all__ = ["CacheService", "cache_service"]
