import asyncio
import os
import pytest
from dotenv import load_dotenv

from app.core.gemini_service import GeminiService


def test_processing():
    """
    Optional integration test for Gemini invoice extraction.
    Run only when explicitly enabled:
    ENABLE_GEMINI_INTEGRATION_TEST=true pytest -q
    """
    if os.getenv("ENABLE_GEMINI_INTEGRATION_TEST", "").lower() != "true":
        pytest.skip("Set ENABLE_GEMINI_INTEGRATION_TEST=true to run this integration test.")

    load_dotenv()

    api_key = os.getenv("GEMINI_API_KEY")
    image_path = os.getenv("GEMINI_TEST_IMAGE_PATH")

    if not api_key:
        pytest.skip("GEMINI_API_KEY is not configured.")
    if not image_path:
        pytest.skip("GEMINI_TEST_IMAGE_PATH is not configured.")
    if not os.path.exists(image_path):
        pytest.skip(f"Image path not found: {image_path}")

    service = GeminiService(api_key=api_key)
    result = asyncio.run(service.extract_invoice_data(image_path))

    assert result is not None
    assert getattr(result, "items", None) is not None
