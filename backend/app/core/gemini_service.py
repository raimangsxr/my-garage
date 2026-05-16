from __future__ import annotations

import json
import logging
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Callable, Iterator, Optional

import google.generativeai as genai
from PIL import Image

logger = logging.getLogger(__name__)

PayloadValidator = Callable[[dict[str, Any]], bool]
FallbackResolver = Callable[[Exception], dict[str, Any]]


class GeminiService:
    """Shared integration layer for Gemini generation and multimodal content."""

    def __init__(self, default_api_key: Optional[str] = None):
        self.default_api_key = default_api_key

    def configure(self, *, api_key: Optional[str] = None) -> None:
        resolved_api_key = api_key or self.default_api_key
        if not resolved_api_key:
            raise ValueError("Gemini API key not configured")
        genai.configure(api_key=resolved_api_key)

    @contextmanager
    def multimodal_content(
        self,
        *,
        file_path: str,
        api_key: str,
        mime_type: Optional[str] = None,
    ) -> Iterator[list[Any]]:
        self.configure(api_key=api_key)

        suffix = Path(file_path).suffix.lower()
        resolved_mime_type = mime_type or ("application/pdf" if suffix == ".pdf" else "image/jpeg")
        uploaded_file = None
        image = None

        try:
            if suffix == ".pdf":
                uploaded_file = genai.upload_file(file_path, mime_type=resolved_mime_type)
                yield [uploaded_file]
            else:
                image = Image.open(file_path)
                yield [image]
        finally:
            if image is not None:
                try:
                    image.close()
                except Exception:
                    logger.warning("Failed to close local image", exc_info=True)
            if uploaded_file is not None:
                try:
                    uploaded_file.delete()
                except Exception:
                    logger.warning("Failed to delete temporary Gemini file", exc_info=True)

    def generate_json_payload(
        self,
        *,
        prompt: str,
        content: list[Any],
        models: list[str],
        api_key: str,
        temperature: float = 0.1,
        validator: Optional[PayloadValidator] = None,
        fallback_resolver: Optional[FallbackResolver] = None,
    ) -> dict[str, Any]:
        try:
            raw_text = self.generate_json_content(
                prompt=prompt,
                content=content,
                models=models,
                api_key=api_key,
                temperature=temperature,
            )
            payload = self.parse_json_payload(raw_text)
            if validator and not validator(payload):
                raise ValueError("Gemini payload failed domain validation")
            return payload
        except Exception as exc:
            if fallback_resolver is None:
                raise
            logger.warning("Gemini fallback resolver activated", extra={"error": str(exc)})
            return fallback_resolver(exc)

    def generate_json_content(
        self,
        *,
        prompt: str,
        content: list[Any],
        models: list[str],
        api_key: str,
        temperature: float = 0.1,
    ) -> str:
        return self._generate_content(
            prompt=prompt,
            content=content,
            models=models,
            api_key=api_key,
            temperature=temperature,
            expect_json=True,
        )

    def generate_text_content(
        self,
        *,
        prompt: str,
        content: list[Any],
        models: list[str],
        api_key: str,
        temperature: float = 0.1,
    ) -> str:
        return self._generate_content(
            prompt=prompt,
            content=content,
            models=models,
            api_key=api_key,
            temperature=temperature,
            expect_json=False,
        )

    def _generate_content(
        self,
        *,
        prompt: str,
        content: list[Any],
        models: list[str],
        api_key: str,
        temperature: float,
        expect_json: bool,
    ) -> str:
        self.configure(api_key=api_key)

        last_error: Optional[Exception] = None
        for model_name in models:
            try:
                model = genai.GenerativeModel(model_name)
                generation_config = genai.types.GenerationConfig(
                    temperature=temperature,
                    response_mime_type="application/json" if expect_json else None,
                )
                response = model.generate_content(
                    [prompt, *content],
                    generation_config=generation_config,
                )
                raw_text = (response.text or "").strip()
                if not raw_text:
                    raise ValueError("Gemini returned an empty response")
                if expect_json:
                    self.parse_json_payload(raw_text)
                return raw_text
            except Exception as exc:
                last_error = exc
                if self._is_rate_limit_error(exc):
                    logger.warning("Gemini model rate limited", extra={"model": model_name, "error": str(exc)})
                elif expect_json and self._is_invalid_json_error(exc):
                    logger.warning("Gemini model returned invalid JSON", extra={"model": model_name, "error": str(exc)})
                else:
                    logger.warning("Gemini model failed", extra={"model": model_name, "error": str(exc)})

        raise ValueError(f"All Gemini models failed. Last error: {last_error}")

    def parse_json_payload(self, raw_text: str) -> dict[str, Any]:
        candidate = raw_text.strip()
        if candidate.startswith("```json"):
            candidate = candidate.split("```json", 1)[1].rsplit("```", 1)[0]
        elif candidate.startswith("```"):
            candidate = candidate.split("```", 1)[1].rsplit("```", 1)[0]
        payload = json.loads(candidate.strip())
        if not isinstance(payload, dict):
            raise ValueError("Expected a JSON object")
        return payload

    def _is_rate_limit_error(self, error: Exception) -> bool:
        message = str(error)
        lowered = message.lower()
        return "429" in message or "quota" in lowered or "resourceexhausted" in lowered

    def _is_invalid_json_error(self, error: Exception) -> bool:
        if isinstance(error, json.JSONDecodeError):
            return True
        message = str(error)
        return "Expected a JSON object" in message or "empty response" in message.lower()
