"""
CodeCraft AI - Helper Functions

This module provides utility functions for common operations.

Developer: Abdulrahman Adeeyo
Hackathon: Prometheus July AI Challenge
"""

import re
from typing import Optional, Dict, Any
from datetime import datetime
import hashlib
import json

# ============================================
# Code Utilities
# ============================================

def sanitize_code(code: str) -> str:
    """
    Sanitize code input to prevent injection attacks.
    
    Args:
        code: Raw code string
        
    Returns:
        str: Sanitized code
    """
    # Remove null bytes
    code = code.replace('\x00', '')
    
    # Remove control characters except newline and tab
    code = re.sub(r'[\x01-\x08\x0b-\x0c\x0e-\x1f\x7f]', '', code)
    
    # Trim leading/trailing whitespace
    code = code.strip()
    
    return code

def extract_language_from_code(code: str) -> Optional[str]:
    """
    Attempt to detect programming language from code.
    
    Args:
        code: Source code
        
    Returns:
        Optional[str]: Detected language or None
    """
    code_lower = code.lower()
    
    # Python
    if any(keyword in code_lower for keyword in ['def ', 'class ', 'import ', 'from ', 'if __name__']):
        if ':' in code and 'self' in code:
            return 'python'
    
    # JavaScript/TypeScript
    if any(keyword in code_lower for keyword in ['function', 'const ', 'let ', 'var ', '=>']):
        if any(keyword in code_lower for keyword in [': string', ': number', ': boolean', 'interface']):
            return 'typescript'
        return 'javascript'
    
    # Java
    if any(keyword in code_lower for keyword in ['public class', 'private class', 'void main', 'import java']):
        return 'java'
    
    # C++
    if any(keyword in code_lower for keyword in ['#include', 'int main', 'std::', 'cout']):
        return 'cpp'
    
    # Go
    if any(keyword in code_lower for keyword in ['package main', 'func main', 'go ']):
        return 'go'
    
    # Rust
    if any(keyword in code_lower for keyword in ['fn main', 'use std', 'let mut', 'println!']):
        return 'rust'
    
    # Ruby
    if any(keyword in code_lower for keyword in ['def ', 'end', 'puts', 'require ']):
        return 'ruby'
    
    # PHP
    if any(keyword in code_lower for keyword in ['<?php', 'echo', '$this->']):
        return 'php'
    
    return None

def format_issue_for_display(issue: Dict[str, Any]) -> str:
    """
    Format an issue for display in the UI.
    
    Args:
        issue: Issue dictionary
        
    Returns:
        str: Formatted issue string
    """
    message = issue.get('message', '')
    line = issue.get('line')
    severity = issue.get('severity', 'info')
    suggestion = issue.get('suggestion')
    
    parts = []
    if line is not None:
        parts.append(f"Line {line}")
    if severity:
        emoji = '⚠️' if severity == 'warning' else '🚫' if severity == 'error' else 'ℹ️'
        parts.append(emoji)
    parts.append(message)
    
    result = ' '.join(parts)
    if suggestion:
        result += f"\n  💡 Suggestion: {suggestion}"
    
    return result

def truncate_text(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """
    Truncate text to a maximum length.
    
    Args:
        text: Text to truncate
        max_length: Maximum length
        suffix: Suffix to add when truncated
        
    Returns:
        str: Truncated text
    """
    if len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)] + suffix

def validate_email(email: str) -> bool:
    """
    Validate email format.
    
    Args:
        email: Email address
        
    Returns:
        bool: True if valid, False otherwise
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

# ============================================
# Time Utilities
# ============================================

def get_current_year() -> str:
    """
    Get the current year.
    
    Returns:
        str: Current year as string
    """
    return str(datetime.now().year)

def format_timestamp(timestamp: datetime, format: str = "%Y-%m-%d %H:%M:%S") -> str:
    """
    Format a timestamp.
    
    Args:
        timestamp: Datetime object
        format: Output format
        
    Returns:
        str: Formatted timestamp
    """
    return timestamp.strftime(format)

# ============================================
# Hash Utilities
# ============================================

def generate_hash(text: str, algorithm: str = "sha256") -> str:
    """
    Generate a hash of text.
    
    Args:
        text: Text to hash
        algorithm: Hash algorithm
        
    Returns:
        str: Hex digest
    """
    hash_func = hashlib.new(algorithm)
    hash_func.update(text.encode('utf-8'))
    return hash_func.hexdigest()

# ============================================
# JSON Utilities
# ============================================

def safe_json_loads(text: str, default: Any = None) -> Any:
    """
    Safely parse JSON.
    
    Args:
        text: JSON string
        default: Default value if parsing fails
        
    Returns:
        Any: Parsed JSON or default
    """
    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError):
        return default

def safe_json_dumps(obj: Any, default: str = "{}") -> str:
    """
    Safely serialize to JSON.
    
    Args:
        obj: Object to serialize
        default: Default value if serialization fails
        
    Returns:
        str: JSON string
    """
    try:
        return json.dumps(obj, default=str)
    except (TypeError, ValueError):
        return default

# ============================================
# Export
# ============================================
__all__ = [
    "sanitize_code",
    "extract_language_from_code",
    "format_issue_for_display",
    "truncate_text",
    "validate_email",
    "get_current_year",
    "format_timestamp",
    "generate_hash",
    "safe_json_loads",
    "safe_json_dumps",
]

