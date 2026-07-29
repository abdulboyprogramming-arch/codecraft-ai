"""
CodeCraft AI - Rate Limiter Service

This module provides rate limiting functionality for API endpoints.
"""

import time
from collections import defaultdict
from threading import Lock
from typing import Dict, Tuple

class RateLimiter:
    def __init__(self):
        self._requests: Dict[str, list] = defaultdict(list)
        self._lock = Lock()

    def is_allowed(self, key: str, limit: int, period: int) -> Tuple[bool, int]:
        now = time.time()
        with self._lock:
            self._requests[key] = [
                t for t in self._requests[key] if t > now - period
            ]
            if len(self._requests[key]) >= limit:
                return False, 0
            self._requests[key].append(now)
            return True, limit - len(self._requests[key])

    def check_limit(self, key: str) -> bool:
        allowed, _ = self.is_allowed(key, 100, 60)
        return allowed

rate_limiter = RateLimiter()

__all__ = ["RateLimiter", "rate_limiter"]
