from types import SimpleNamespace

from app.services.vehicle_document_rag_service import VehicleDocumentRAGService


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
