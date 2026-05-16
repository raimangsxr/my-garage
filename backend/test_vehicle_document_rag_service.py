from types import SimpleNamespace

from app.core.gemini_service import GeminiService
from app.services.vehicle_document_rag_service import ParsedDocumentPage, VehicleDocumentRAGService


def test_answer_question_returns_spanish_fallback_when_no_sources(monkeypatch):
    service = VehicleDocumentRAGService()
    vehicle = SimpleNamespace(brand="Ducati", model="Panigale 1299 S", year=2015, license_plate="TEST123")

    monkeypatch.setattr(
        service,
        "expand_query_for_retrieval",
        lambda **kwargs: {
            "retrieval_query": kwargs["question"],
            "detected_language": "es",
        },
    )
    monkeypatch.setattr(service, "retrieve_sources", lambda **kwargs: [])

    response = service.answer_question(
        session=None,
        vehicle=vehicle,
        question="Que par de apriete se le pone a la tuerca de la rueda trasera?",
        source_scope="all",
        include_invoice_docs=False,
        api_key="fake-key",
    )

    assert response["citations"] == []
    assert response["used_documents"] == []
    assert "No encontr" in response["answer"]
    assert response["confidence_note"] == "Ninguna fuente indexada coincidió con esta pregunta."


def test_answer_question_falls_back_to_english_when_language_is_unknown(monkeypatch):
    service = VehicleDocumentRAGService()
    vehicle = SimpleNamespace(brand="Ducati", model="Panigale 1299 S", year=2015, license_plate="TEST123")

    monkeypatch.setattr(
        service,
        "expand_query_for_retrieval",
        lambda **kwargs: {
            "retrieval_query": kwargs["question"],
            "detected_language": "unknown",
        },
    )
    monkeypatch.setattr(service, "retrieve_sources", lambda **kwargs: [])

    response = service.answer_question(
        session=None,
        vehicle=vehicle,
        question="What torque should I use on the rear wheel nut?",
        source_scope="all",
        include_invoice_docs=False,
        api_key="fake-key",
    )

    assert response["answer"].startswith("I couldn't find enough indexed documentation")
    assert response["confidence_note"] == "No indexed sources matched this question."


def test_expand_query_uses_gemini_service_fallback_payload(monkeypatch):
    service = VehicleDocumentRAGService()

    def fake_generate_json_payload(**kwargs):
        return kwargs["fallback_resolver"](ValueError("boom"))

    monkeypatch.setattr(service.gemini_service, "generate_json_payload", fake_generate_json_payload)

    response = service.expand_query_for_retrieval(question="rear wheel torque?", api_key="fake-key")

    assert response == {
        "retrieval_query": "rear wheel torque?",
        "detected_language": "unknown",
    }


def test_extract_knowledge_facts_uses_gemini_service_fallback_payload(monkeypatch):
    service = VehicleDocumentRAGService()
    document = SimpleNamespace(id=1, vehicle_id=99)

    def fake_generate_json_payload(**kwargs):
        return kwargs["fallback_resolver"](ValueError("boom"))

    monkeypatch.setattr(service.gemini_service, "generate_json_payload", fake_generate_json_payload)

    facts = service.extract_knowledge_facts(document=document, extracted_text="spec text", api_key="fake-key")

    assert facts == []


def test_distance_to_similarity_clamps_invalid_values():
    service = VehicleDocumentRAGService()

    assert service._distance_to_similarity(0.2) == 0.8
    assert service._distance_to_similarity(1.4) == 0.0
    assert service._distance_to_similarity(None) == 0.0


def test_gemini_service_generate_json_content_falls_back_after_rate_limit(monkeypatch):
    service = GeminiService()
    calls: list[str] = []

    class FakeModel:
        def __init__(self, model_name):
            self.model_name = model_name

        def generate_content(self, content, generation_config=None):
            calls.append(self.model_name)
            if self.model_name == "model-a":
                raise Exception("429 ResourceExhausted")
            return SimpleNamespace(text='{"answer":"ok"}')

    monkeypatch.setattr("app.core.gemini_service.genai.GenerativeModel", FakeModel)

    raw_text = service.generate_json_content(
        prompt="prompt",
        content=[],
        models=["model-a", "model-b"],
        api_key="fake-key",
    )

    assert raw_text == '{"answer":"ok"}'
    assert calls == ["model-a", "model-b"]


def test_gemini_service_generate_json_content_falls_back_after_invalid_json(monkeypatch):
    service = GeminiService()
    calls: list[str] = []

    class FakeModel:
        def __init__(self, model_name):
            self.model_name = model_name

        def generate_content(self, content, generation_config=None):
            calls.append(self.model_name)
            if self.model_name == "model-a":
                return SimpleNamespace(text='{"answer": ')
            return SimpleNamespace(text='{"answer":"ok"}')

    monkeypatch.setattr("app.core.gemini_service.genai.GenerativeModel", FakeModel)

    raw_text = service.generate_json_content(
        prompt="prompt",
        content=[],
        models=["model-a", "model-b"],
        api_key="fake-key",
    )

    assert raw_text == '{"answer":"ok"}'
    assert calls == ["model-a", "model-b"]


class FakeExecResult:
    def all(self):
        return []


class FakeSession:
    def __init__(self, document):
        self.document = document
        self.deleted = False

    def get(self, model, document_id):
        if self.deleted:
            return None
        return self.document if self.document.id == document_id else None

    def add(self, obj):
        return None

    def commit(self):
        return None

    def refresh(self, obj):
        return None

    def rollback(self):
        return None

    def delete(self, obj):
        return None

    def exec(self, statement):
        return FakeExecResult()


def test_process_document_stops_cleanly_when_document_is_deleted_mid_processing(monkeypatch):
    service = VehicleDocumentRAGService()
    document = SimpleNamespace(
        id=7,
        vehicle_id=5,
        file_url="/media/vehicle-documents/manual.pdf",
        mime_type="application/pdf",
        status="uploaded",
        error_message=None,
        updated_at=None,
        extracted_text=None,
        chunk_count=0,
        indexed_at=None,
        processing_progress=0,
        processing_stage="uploaded",
        processing_detail="Upload complete. Waiting for indexing to start.",
        title="Manual",
        file_name="manual.pdf",
    )
    session = FakeSession(document)

    monkeypatch.setattr(service, "resolve_file_path", lambda file_url: "/tmp/manual.pdf")

    def fake_parse_document(**kwargs):
        session.deleted = True
        return [ParsedDocumentPage(page_number=1, text="Torque spec 120 Nm")]

    monkeypatch.setattr(service, "parse_document", fake_parse_document)
    monkeypatch.setattr(service, "extract_knowledge_facts", lambda **kwargs: [])

    result = service.process_document(session=session, document_id=document.id, gemini_api_key="fake-key")

    assert result is None
