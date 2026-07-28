"""
CodeCraft AI - AI Service

This module handles integration with OpenAI's GPT-4 API for code review,
including prompt engineering, response parsing, and error handling.

Developer: Abdulrahman Adeeyo
Hackathon: Prometheus July AI Challenge
"""

import json
import logging
from typing import Dict, Any, Optional, List
from openai import AsyncOpenAI, OpenAIError
from tenacity import retry, stop_after_attempt, wait_exponential
import tiktoken

from ..core.config import settings
from ..schemas.review import FeedbackResponse, FeedbackItem

logger = logging.getLogger(__name__)

# ============================================
# Prompt Templates
# ============================================

SYSTEM_PROMPT = """You are CodeCraft AI, a Senior Software Engineer with 20+ years of experience in software development, code quality, architecture, and security best practices.

Your task is to review the provided code and provide constructive, educational feedback.

Analyze the code for:
1. LOGIC ERRORS: Bugs, edge cases, and logical flaws
2. EFFICIENCY: Performance bottlenecks, algorithmic improvements, and resource usage
3. CODE STYLE: Readability, naming conventions, adherence to language best practices, and overall cleanliness
4. SECURITY: Potential vulnerabilities, injection risks, and insecure practices

For each issue, provide:
- A clear description of the issue
- The line number if applicable
- Severity level (info, warning, error)
- A specific suggestion for improvement

Provide your feedback as a JSON object with this structure:
{
    "logic": [
        {"message": "The function doesn't handle the case where the input is None.", "line": 5, "severity": "error", "suggestion": "Add a check at the beginning: if input is None: return None"}
    ],
    "efficiency": [
        {"message": "The nested loop has O(n^2) complexity.", "line": 12, "severity": "warning", "suggestion": "This could be optimized to O(n) by using a hash map."}
    ],
    "style": [
        {"message": "Variable names like 'x' and 'y' are not descriptive.", "line": 3, "severity": "info", "suggestion": "Use more meaningful names like 'user_input' and 'processed_data'."}
    ],
    "security": [
        {"message": "The SQL query is built using string concatenation.", "line": 20, "severity": "error", "suggestion": "Use parameterized queries to prevent SQL injection."}
    ],
    "summary": "Overall, the code has some issues that need attention. The logic is sound but there are performance and security concerns.",
    "score": 75
}

Be thorough but concise. Focus on issues that matter. If the code is good, say so.
"""

class AIService:
    """
    Service for interacting with OpenAI's API for code review.
    """
    
    def __init__(self):
        """Initialize the AI service with OpenAI client."""
        self.client = AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY,
            timeout=settings.OPENAI_TIMEOUT,
        )
        self.model = settings.OPENAI_MODEL
        self.max_tokens = settings.OPENAI_MAX_TOKENS
        self.temperature = settings.OPENAI_TEMPERATURE
        self.encoding = tiktoken.encoding_for_model("gpt-4")
        
    def _count_tokens(self, text: str) -> int:
        """Count the number of tokens in a text string."""
        try:
            return len(self.encoding.encode(text))
        except Exception as e:
            logger.warning(f"Failed to count tokens: {e}")
            return len(text) // 4  # Rough estimate
    
    def _truncate_code(self, code: str, max_tokens: int = 12000) -> str:
        """Truncate code to fit within token limits."""
        tokens = self._count_tokens(code)
        if tokens <= max_tokens:
            return code
        
        # Keep first 80% and last 20%
        chars_per_token = len(code) / tokens
        keep_chars = int(max_tokens * chars_per_token)
        first_part = code[:int(keep_chars * 0.8)]
        last_part = code[-int(keep_chars * 0.2):]
        
        return f"{first_part}\n... [TRUNCATED] ...\n{last_part}"
    
    def _build_prompt(self, code: str, language: Optional[str] = None) -> str:
        """Build the user prompt for the AI."""
        truncated_code = self._truncate_code(code)
        
        lang_info = f"Language: {language}\n" if language else ""
        
        return f"""{lang_info}Review the following code and provide detailed feedback:

{truncated_code}
```"""
    
    def _parse_response(self, response_text: str) -> Dict[str, Any]:
        """Parse the AI response and extract structured feedback."""
        try:
            # Try to parse as JSON
            data = json.loads(response_text)
            
            # Ensure all required fields exist
            feedback = {
                "logic": data.get("logic", []),
                "efficiency": data.get("efficiency", []),
                "style": data.get("style", []),
                "security": data.get("security", []),
                "summary": data.get("summary", ""),
                "score": data.get("score", None),
            }
            
            # Validate feedback items
            for category in ["logic", "efficiency", "style", "security"]:
                items = feedback[category]
                if isinstance(items, list):
                    validated_items = []
                    for item in items:
                        if isinstance(item, str):
                            # Convert string to FeedbackItem format
                            validated_items.append({
                                "message": item,
                                "line": None,
                                "severity": "info",
                                "suggestion": None,
                            })
                        elif isinstance(item, dict):
                            # Use as-is if it's already a dict
                            validated_items.append({
                                "message": item.get("message", str(item)),
                                "line": item.get("line"),
                                "severity": item.get("severity", "info"),
                                "suggestion": item.get("suggestion"),
                            })
                    feedback[category] = validated_items
            
            return feedback
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response as JSON: {e}")
            logger.debug(f"Response text: {response_text[:500]}...")
            
            # Try to extract JSON from markdown code block
            import re
            json_match = re.search(r"```json\s*([\s\S]*?)\s*```", response_text)
            if json_match:
                try:
                    data = json.loads(json_match.group(1))
                    return self._parse_response(json.dumps(data))
                except:
                    pass
            
            # Return a fallback response
            return {
                "logic": [{
                    "message": "We encountered an issue analyzing your code. Please try again.",
                    "severity": "error",
                }],
                "efficiency": [],
                "style": [],
                "security": [],
                "summary": "Unable to complete full analysis due to a parsing error.",
                "score": None,
            }
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True,
    )
    async def review_code(
        self,
        code: str,
        language: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Review code using OpenAI's API.
        
        Args:
            code: The source code to review
            language: Optional programming language
            
        Returns:
            Dict[str, Any]: Structured feedback
            
        Raises:
            OpenAIError: If the API call fails
        """
        try:
            # Build the prompt
            user_prompt = self._build_prompt(code, language)
            
            # Make the API call
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=self.temperature,
                max_tokens=self.max_tokens,
                response_format={"type": "json_object"},
            )
            
            # Extract and parse the response
            response_text = response.choices[0].message.content
            feedback = self._parse_response(response_text)
            
            # Log success
            logger.info(
                f"Code review successful: "
                f"logic={len(feedback.get('logic', []))}, "
                f"efficiency={len(feedback.get('efficiency', []))}, "
                f"style={len(feedback.get('style', []))}, "
                f"security={len(feedback.get('security', []))}"
            )
            
            return feedback
            
        except OpenAIError as e:
            logger.error(f"OpenAI API error: {e}")
            raise
            
        except Exception as e:
            logger.error(f"Unexpected error in AI service: {e}")
            return {
                "logic": [{
                    "message": f"An error occurred: {str(e)[:100]}",
                    "severity": "error",
                }],
                "efficiency": [],
                "style": [],
                "security": [],
                "summary": "An unexpected error occurred during code review.",
                "score": None,
            }
    
    async def get_code_metrics(self, code: str, language: str) -> Dict[str, Any]:
        """
        Get code metrics and statistics.
        
        Args:
            code: The code to analyze
            language: Programming language
            
        Returns:
            Dict[str, Any]: Code metrics
        """
        lines = code.split("\n")
        effective_lines = len([l for l in lines if l.strip() and not l.strip().startswith("//") and not l.strip().startswith("#")])
        
        return {
            "total_lines": len(lines),
            "effective_lines": effective_lines,
            "characters": len(code),
            "language": language,
        }

# Create singleton instance
ai_service = AIService()

# ============================================
# Export
# ============================================
__all__ = ["AIService", "ai_service"]

