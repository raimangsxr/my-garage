import os
import pytest
from contextlib import contextmanager
from dotenv import load_dotenv

from app.core.gemini_service import GeminiService
from app.services.invoice_service import InvoiceService


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

    service = InvoiceService(GeminiService())
    result = service.extract_invoice_data(file_path=image_path, api_key=api_key)

    assert result is not None
    assert result.total_amount is not None


def test_invoice_service_keeps_prompt_in_domain_and_delegates_generation():
    captured = {}

    class FakeGeminiService:
        @contextmanager
        def multimodal_content(self, *, file_path: str, api_key: str, mime_type=None):
            captured["file_path"] = file_path
            captured["api_key"] = api_key
            captured["mime_type"] = mime_type
            yield ["fake-content"]

        def generate_json_payload(self, *, prompt, content, models, api_key, temperature=0.1):
            captured["prompt"] = prompt
            captured["content"] = content
            captured["models"] = models
            captured["generation_api_key"] = api_key
            captured["temperature"] = temperature
            return {
                "invoice_number": "INV-1",
                "invoice_date": None,
                "supplier_name": "Supplier",
                "supplier_address": None,
                "supplier_tax_id": None,
                "is_maintenance": False,
                "is_parts_only": True,
                "vehicle_plate": None,
                "vehicle_vin": None,
                "mileage": None,
                "maintenances": [],
                "parts_only": [],
                "subtotal": None,
                "tax_amount": None,
                "total_amount": 42.0,
                "confidence": 0.9,
            }

    service = InvoiceService(FakeGeminiService())

    result = service.extract_invoice_data(file_path="/tmp/invoice.jpg", api_key="fake-key", detailed_mode=True)

    assert result.invoice_number == "INV-1"
    assert result.total_amount == 42.0
    assert "Analiza esta factura" in captured["prompt"]
    assert "MODO DETALLADO" in captured["prompt"]
    assert captured["content"] == ["fake-content"]
    assert captured["api_key"] == "fake-key"
    assert captured["generation_api_key"] == "fake-key"


def test_gemini_service_can_resolve_json_fallback_from_proxy():
    service = GeminiService()

    def fake_generate_json_content(**kwargs):
        raise ValueError("provider failed")

    service.generate_json_content = fake_generate_json_content  # type: ignore[method-assign]

    payload = service.generate_json_payload(
        prompt="prompt",
        content=[],
        models=["model-a"],
        api_key="fake-key",
        fallback_resolver=lambda _exc: {"ok": True},
    )

    assert payload == {"ok": True}
