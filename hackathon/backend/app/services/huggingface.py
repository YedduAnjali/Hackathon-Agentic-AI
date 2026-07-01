"""Hugging Face LLM service for generating text and structured responses."""
import httpx
import json
import re
import logging
from typing import Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)


class HuggingFaceService:
    """Service for interacting with Hugging Face Inference API."""
    
    def __init__(self):
        self.api_key = settings.HF_API_KEY or settings.HUGGINGFACE_API_KEY
        self.model = settings.HF_MODEL
        self.base_url = "https://router.huggingface.co/v1"
        
        if not self.api_key:
            logger.warning("⚠️  HF_API_KEY not set. LLM calls will fail.")
    
    def _remove_json_comments(self, text: str) -> str:
        """
        Remove JSON comments (// and /* */ style) while preserving strings.
        
        Args:
            text: JSON text with potential comments
            
        Returns:
            JSON text with comments removed
        """
        result = []
        i = 0
        in_string = False
        escape_next = False
        
        while i < len(text):
            char = text[i]
            
            # Handle escape sequences in strings
            if escape_next:
                result.append(char)
                escape_next = False
                i += 1
                continue
            
            if char == '\\' and in_string:
                escape_next = True
                result.append(char)
                i += 1
                continue
            
            # Toggle string state
            if char == '"':
                in_string = not in_string
                result.append(char)
                i += 1
                continue
            
            # Outside strings, check for comments
            if not in_string:
                # Check for single-line comment
                if i + 1 < len(text) and text[i:i+2] == '//':
                    # Skip until end of line
                    while i < len(text) and text[i] != '\n':
                        i += 1
                    continue
                
                # Check for multi-line comment
                if i + 1 < len(text) and text[i:i+2] == '/*':
                    # Skip until */
                    i += 2
                    while i + 1 < len(text) and text[i:i+2] != '*/':
                        i += 1
                    if i + 1 < len(text):
                        i += 2
                    continue
            
            result.append(char)
            i += 1
        
        return ''.join(result)
    
    async def generate(
        self,
        prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        top_p: float = 0.9,
        retry_count: int = 0
    ) -> Dict[str, Any]:
        """
        Call Hugging Face Router API (OpenAI-compatible).
        
        Args:
            prompt: The prompt to send
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            top_p: Nucleus sampling parameter
            retry_count: Internal retry counter
            
        Returns:
            Dictionary with 'text' and 'raw' keys
        """
        if not self.api_key:
            raise ValueError("Hugging Face API key is not configured")
        
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    json={
                        "model": self.model,
                        "messages": [
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "temperature": temperature,
                        "max_tokens": max_tokens,
                        "top_p": top_p
                    },
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    }
                )
                response.raise_for_status()
                data = response.json()
                
                # Handle OpenAI-compatible response format
                if data.get("choices") and len(data["choices"]) > 0:
                    content = (
                        data["choices"][0].get("message", {}).get("content") or
                        data["choices"][0].get("text") or
                        ""
                    )
                    return {
                        "text": content.strip(),
                        "raw": data
                    }
                elif isinstance(data, str):
                    return {
                        "text": data.strip(),
                        "raw": data
                    }
                else:
                    return {
                        "text": json.dumps(data).strip(),
                        "raw": data
                    }
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 503 and retry_count < 1:
                # Model is loading, wait and retry
                logger.info("⏳ Model is loading, waiting 10 seconds...")
                import asyncio
                await asyncio.sleep(10)
                return await self.generate(prompt, temperature, max_tokens, top_p, retry_count + 1)
            logger.error(f"LLM API Error: {e.response.text if e.response else e}")
            raise Exception(f"LLM generation failed: {str(e)}")
        except Exception as e:
            logger.error(f"LLM generation error: {e}")
            raise Exception(f"LLM generation failed: {str(e)}")
    
    async def generate_json(
        self,
        prompt: str,
        schema: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate structured JSON response.
        
        Args:
            prompt: The prompt
            schema: Expected JSON schema description (for guidance)
            
        Returns:
            Parsed JSON object
        """
        json_prompt = prompt
        if schema:
            json_prompt += f"\n\nRespond with ONLY valid JSON matching this schema: {json.dumps(schema)}. Do not include any markdown code blocks, explanations, comments, or additional text before or after the JSON object."
        else:
            json_prompt += "\n\nRespond with ONLY valid JSON. Do not include any markdown code blocks, comments, explanations, or additional text before or after the JSON."
        
        response = await self.generate(json_prompt, temperature=0.3)
        
        try:
            json_text = response["text"].strip()
            
            # Remove markdown code blocks (```json ... ``` or ``` ... ```)
            json_text = re.sub(r'^```(?:json)?\s*\n?', '', json_text, flags=re.IGNORECASE)
            json_text = re.sub(r'\n?```\s*$', '', json_text, flags=re.IGNORECASE)
            json_text = json_text.strip()
            
            # Remove JSON comments (// ... and /* ... */)
            json_text = self._remove_json_comments(json_text)
            
            # Try parsing the cleaned text directly first
            try:
                return json.loads(json_text)
            except json.JSONDecodeError:
                # If direct parse fails, try to extract JSON object
                # Find the first { and match it with the corresponding }
                first_brace = json_text.find('{')
                if first_brace == -1:
                    raise ValueError("No JSON object found in response")
                
                # Find the matching closing brace by counting braces and ignoring strings
                brace_count = 0
                last_brace = -1
                in_string = False
                escape_next = False
                
                for i in range(first_brace, len(json_text)):
                    char = json_text[i]
                    
                    # Handle escape sequences
                    if escape_next:
                        escape_next = False
                        continue
                    
                    if char == '\\':
                        escape_next = True
                        continue
                    
                    # Handle strings
                    if char == '"' and not escape_next:
                        in_string = not in_string
                        continue
                    
                    # Only count braces outside of strings
                    if not in_string:
                        if char == '{':
                            brace_count += 1
                        if char == '}':
                            brace_count -= 1
                            if brace_count == 0:
                                last_brace = i
                                break
                
                # If we couldn't find a complete JSON object, try to fix truncated response
                if last_brace == -1:
                    # Try to extract what we can and close unclosed arrays/strings
                    partial_json = json_text[first_brace:]
                    
                    # Count unclosed structures
                    open_braces = 0
                    open_brackets = 0
                    in_str = False
                    esc = False
                    
                    for char in partial_json:
                        if esc:
                            esc = False
                            continue
                        if char == '\\':
                            esc = True
                            continue
                        if char == '"' and not esc:
                            in_str = not in_str
                            continue
                        if in_str:
                            continue
                        
                        if char == '{':
                            open_braces += 1
                        if char == '}':
                            open_braces -= 1
                        if char == '[':
                            open_brackets += 1
                        if char == ']':
                            open_brackets -= 1
                    
                    # Try to close the string if it's incomplete
                    if in_str:
                        partial_json += '"'
                    
                    # Close arrays and braces
                    partial_json += ']' * max(0, open_brackets)
                    partial_json += '}' * max(0, open_braces)
                    
                    try:
                        return json.loads(partial_json)
                    except json.JSONDecodeError as repair_error:
                        raise ValueError(f"Incomplete JSON object in response: {repair_error}")
                
                extracted_json = json_text[first_brace:last_brace + 1]
                return json.loads(extracted_json)
        except Exception as e:
            logger.error(f"Failed to parse JSON response: {e}")
            logger.error(f"Original response: {response.get('text', '')}")
            raise ValueError(f"Invalid JSON response from LLM: {str(e)}")
    
    async def chat(
        self,
        messages: list,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        top_p: float = 0.9
    ) -> Dict[str, Any]:
        """
        Chain multiple prompts together.
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            top_p: Nucleus sampling parameter
            
        Returns:
            LLM response dictionary
        """
        # Convert messages to prompt format
        prompt_parts = []
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role == "system":
                prompt_parts.append(f"System: {content}")
            elif role == "user":
                prompt_parts.append(f"User: {content}")
            elif role == "assistant":
                prompt_parts.append(f"Assistant: {content}")
            else:
                prompt_parts.append(content)
        
        prompt = "\n\n".join(prompt_parts) + "\n\nAssistant:"
        return await self.generate(prompt, temperature, max_tokens, top_p)


# Singleton instance
huggingface_service = HuggingFaceService()
