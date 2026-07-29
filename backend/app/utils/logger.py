"""
CodeCraft AI - Logger Utility

This module provides logging configuration for the application.
"""

import logging
import sys
from typing import Optional

def setup_logging(level: Optional[str] = None) -> None:
    """Set up application logging."""
    log_level = level or "INFO"
    logging.basicConfig(
        level=getattr(logging, log_level.upper(), logging.INFO),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        stream=sys.stdout,
    )

def get_logger(name: str) -> logging.Logger:
    """Get a logger instance."""
    return logging.getLogger(name)

__all__ = ["setup_logging", "get_logger"]
