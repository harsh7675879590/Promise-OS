"""
PromiseOS — LLM & Embedding Service
Interfaces with open-weight models (Llama 3.1 8B-Instruct) served via vLLM on AMD ROCm,
OpenAI-compatible endpoints, or local fallback engine.
"""

import os
import json
import logging
import httpx
from typing import Dict, Any, Optional, List

logger = logging.getLogger("promiseos.llm")

# AMD ROCm / vLLM endpoint configuration
VLLM_ROCM_URL = os.getenv("VLLM_ROCM_URL", "http://localhost:8000/v1")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
DEFAULT_MODEL = os.getenv("PROMISEOS_MODEL", "meta-llama/Meta-Llama-3.1-8B-Instruct")


class LLMService:
    def __init__(self, base_url: str = VLLM_ROCM_URL, api_key: str = OPENAI_API_KEY):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key or "sk-dummy-token"
        self.model = DEFAULT_MODEL

    async def generate_json(self, prompt: str, system_prompt: str = "") -> Optional[Dict[str, Any]]:
        """
        Attempts to call the vLLM / OpenAI-compatible endpoint with JSON mode.
        If unavailable or failing, returns None to allow heuristic fallback.
        """
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.1,
            "response_format": {"type": "json_object"}
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    content = data["choices"][0]["message"]["content"]
                    return json.loads(content)
                else:
                    logger.info(f"LLM API returned status {res.status_code}, using fallback heuristics.")
        except Exception as e:
            logger.debug(f"LLM endpoint not reachable ({e}). Using deterministic agent heuristics.")
        return None

    async def generate_text(self, prompt: str, system_prompt: str = "") -> Optional[str]:
        """Calls LLM for structured phrasing or text generation."""
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": 512
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data["choices"][0]["message"]["content"].strip()
        except Exception:
            pass
        return None


llm_service = LLMService()
