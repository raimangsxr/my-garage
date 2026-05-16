from __future__ import annotations

import hashlib
import json
import logging
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, List, Optional

from pypdf import PdfReader
from sqlmodel import Session, select

from app.core.config import settings
from app.core.gemini_service import GeminiService
from app.core.storage import StorageService
from app.models import Invoice, Vehicle, VehicleDocument, VehicleDocumentChunk, VehicleKnowledgeFact

logger = logging.getLogger(__name__)


class DocumentDeletedError(Exception):
    """Raised when a document disappears while an async processor is still running."""


@dataclass
class ParsedDocumentPage:
    page_number: int
    text: str


@dataclass
class RetrievedSource:
    source_id: str
    source_type: str
    source_label: str
    page_number: Optional[int]
    content: str
    file_url: Optional[str]
    similarity: float


class VehicleDocumentRAGService:
    TRANSCRIPTION_MODELS = [
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
    ]
    ANSWER_MODELS = [
        "gemini-3.1-flash-lite",
        "gemini-2.5-pro",
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
    ]
    EMBEDDING_DIMENSION = 256
    MAX_FACTS = 10
    CHUNK_SIZE = 1400
    CHUNK_OVERLAP = 180
    FALLBACK_MESSAGES = {
        "en": {
            "answer": "I couldn't find enough indexed documentation for that question yet. Upload a manual or include invoice sources and try again.",
            "confidence_note": "No indexed sources matched this question.",
        },
        "es": {
            "answer": "No encontré suficiente documentación indexada para esa pregunta todavía. Sube un manual o incluye facturas como fuente y vuelve a intentarlo.",
            "confidence_note": "Ninguna fuente indexada coincidió con esta pregunta.",
        },
    }

    def __init__(self, gemini_service: Optional[GeminiService] = None) -> None:
        self.storage_service = StorageService(upload_dir="media/vehicle-documents")
        self.gemini_service = gemini_service or GeminiService()

    def resolve_gemini_api_key(self, current_user: Any) -> str:
        user_settings = getattr(current_user, "settings", None)
        if user_settings and user_settings.gemini_api_key:
            return user_settings.gemini_api_key
        return settings.GEMINI_API_KEY

    def process_document(self, *, session: Session, document_id: int, gemini_api_key: str) -> VehicleDocument | None:
        try:
            document = self._update_document_processing_state(
                session=session,
                document_id=document_id,
                status="indexing",
                progress=5,
                stage="starting",
                detail="Preparing document for indexing.",
                error_message=None,
            )
            file_path = self.resolve_file_path(document.file_url)
            pages = self.parse_document(file_path=file_path, mime_type=document.mime_type, api_key=gemini_api_key)
            self._update_document_processing_state(
                session=session,
                document_id=document_id,
                status="indexing",
                progress=45,
                stage="extracting_text",
                detail="Text extracted. Preparing chunks for retrieval.",
            )
            extracted_text = "\n\n".join(
                f"[Page {page.page_number}]\n{page.text.strip()}" for page in pages if page.text.strip()
            ).strip()
            if not extracted_text:
                raise ValueError("No usable text extracted from document")

            self._delete_existing_chunks_and_facts(session=session, document_id=document.id)

            document = self._get_document_or_raise(session=session, document_id=document_id)
            chunks = self._build_chunks(document=document, pages=pages)
            for chunk in chunks:
                session.add(chunk)
            session.commit()

            self._update_document_processing_state(
                session=session,
                document_id=document_id,
                status="indexing",
                progress=78,
                stage="chunking",
                detail=f"{len(chunks)} chunks indexed. Finalizing document knowledge.",
            )

            document = self._get_document_or_raise(session=session, document_id=document_id)
            document.extracted_text = extracted_text
            document.chunk_count = len(chunks)
            session.add(document)
            session.commit()

            if gemini_api_key:
                self._update_document_processing_state(
                    session=session,
                    document_id=document_id,
                    status="indexing",
                    progress=90,
                    stage="knowledge",
                    detail="Extracting derived knowledge facts.",
                )
                facts = self.extract_knowledge_facts(
                    document=document,
                    extracted_text=extracted_text,
                    api_key=gemini_api_key,
                )
                self._get_document_or_raise(session=session, document_id=document_id)
                for fact in facts:
                    session.add(fact)

                session.commit()
            else:
                logger.info(
                    "Skipping knowledge fact extraction because Gemini API key is not configured",
                    extra={"document_id": document.id},
                )
            document = self._update_document_processing_state(
                session=session,
                document_id=document_id,
                status="ready",
                progress=100,
                stage="ready",
                detail="Document indexed and ready for chat.",
            )
            document = self._get_document_or_raise(session=session, document_id=document_id)
            document.indexed_at = self._utcnow()
            session.add(document)
            session.commit()
            session.refresh(document)
            return document
        except DocumentDeletedError:
            session.rollback()
            logger.info(
                "Vehicle document processing aborted because the document was deleted",
                extra={"document_id": document_id},
            )
            return None
        except Exception as exc:
            session.rollback()
            document = session.get(VehicleDocument, document_id)
            if document:
                document.status = "failed"
                document.error_message = str(exc)
                document.processing_stage = "failed"
                document.processing_detail = "Processing failed. Review the error message and retry."
                document.updated_at = self._utcnow()
                session.add(document)
                session.commit()
            logger.exception("Vehicle document processing failed", extra={"document_id": document_id})
            raise

    def parse_document(self, *, file_path: str, mime_type: Optional[str], api_key: str) -> List[ParsedDocumentPage]:
        suffix = Path(file_path).suffix.lower()
        if suffix in {".txt", ".md"}:
            text = Path(file_path).read_text(encoding="utf-8", errors="ignore")
            return [ParsedDocumentPage(page_number=1, text=text)]
        if suffix == ".pdf":
            pages = self._parse_pdf_locally(file_path)
            if pages:
                return pages

        prompt = """
Convierte este documento del vehículo en texto estructurado y limpio.
Responde SOLO con JSON válido con este formato:
{
  "pages": [
    {
      "page_number": 1,
      "text": "texto completo y legible de la página"
    }
  ]
}

Reglas:
- Conserva términos técnicos, medidas, fluidos, pares de apriete, intervalos y referencias.
- No inventes contenido que no aparezca en el documento.
- Si una página es casi ilegible, devuelve el texto más fiable posible.
"""
        with self.gemini_service.multimodal_content(
            file_path=file_path,
            api_key=api_key,
            mime_type=mime_type,
        ) as content:
            payload = self.gemini_service.generate_json_payload(
                prompt=prompt,
                content=content,
                models=self.TRANSCRIPTION_MODELS,
                api_key=api_key,
                validator=self._has_non_empty_page_text,
                fallback_resolver=(
                    lambda _exc: self._image_transcription_fallback_payload(content=content, api_key=api_key)
                    if suffix != ".pdf"
                    else self._empty_pages_payload()
                ),
            )
            pages = payload.get("pages") or []
            parsed_pages = [
                ParsedDocumentPage(
                    page_number=max(1, int(page.get("page_number") or index + 1)),
                    text=str(page.get("text") or "").strip(),
                )
                for index, page in enumerate(pages)
                if str(page.get("text") or "").strip()
            ]
            return parsed_pages

    def _parse_pdf_locally(self, file_path: str) -> List[ParsedDocumentPage]:
        reader = PdfReader(file_path)
        pages: list[ParsedDocumentPage] = []
        for index, page in enumerate(reader.pages, start=1):
            try:
                text = page.extract_text() or ""
            except Exception:
                logger.warning("Failed to extract text from PDF page", extra={"file_path": file_path, "page": index}, exc_info=True)
                text = ""
            cleaned = text.strip()
            if cleaned:
                pages.append(ParsedDocumentPage(page_number=index, text=cleaned))
        return pages

    def extract_knowledge_facts(
        self,
        *,
        document: VehicleDocument,
        extracted_text: str,
        api_key: str,
    ) -> List[VehicleKnowledgeFact]:
        if not extracted_text.strip():
            return []

        trimmed_text = extracted_text[:24000]
        prompt = f"""
Analiza esta documentación de vehículo y extrae hasta {self.MAX_FACTS} facts útiles y accionables.
Responde SOLO con JSON válido:
{{
  "facts": [
    {{
      "title": "string",
      "category": "fluids|maintenance|torque|specs|procedure|safety|parts|other",
      "content": "string",
      "source_excerpt": "string",
      "confidence": 0.0
    }}
  ]
}}

Solo incluye facts realmente respaldados por el texto.
Texto:
{trimmed_text}
"""
        payload = self.gemini_service.generate_json_payload(
            prompt=prompt,
            content=[],
            models=self.ANSWER_MODELS,
            api_key=api_key,
            fallback_resolver=lambda _exc: {"facts": []},
        )
        facts = []
        for item in payload.get("facts") or []:
            title = str(item.get("title") or "").strip()
            content = str(item.get("content") or "").strip()
            if not title or not content:
                continue
            facts.append(
                VehicleKnowledgeFact(
                    vehicle_id=document.vehicle_id,
                    document_id=document.id,
                    title=title[:160],
                    category=(str(item.get("category") or "other").strip() or "other")[:64],
                    content=content,
                    source_excerpt=str(item.get("source_excerpt") or "").strip() or None,
                    confidence=self._safe_float(item.get("confidence")),
                )
            )
        return facts

    def answer_question(
        self,
        *,
        session: Session,
        vehicle: Vehicle,
        question: str,
        source_scope: str,
        include_invoice_docs: bool,
        api_key: str,
    ) -> dict[str, Any]:
        expanded_query = self.expand_query_for_retrieval(question=question, api_key=api_key)
        sources = self.retrieve_sources(
            session=session,
            vehicle=vehicle,
            question=expanded_query["retrieval_query"],
            source_scope=source_scope,
            include_invoice_docs=include_invoice_docs,
        )
        if not sources:
            localized_fallback = self._localized_no_sources_response(expanded_query.get("detected_language"), question)
            return {
                "answer": localized_fallback["answer"],
                "citations": [],
                "used_documents": [],
                "confidence_note": localized_fallback["confidence_note"],
            }

        context_blocks = []
        for source in sources[:6]:
            page_text = f"page {source.page_number}" if source.page_number else "unpaged"
            context_blocks.append(
                f"[{source.source_id}] {source.source_label} ({page_text})\n{source.content}"
            )

        prompt = f"""
You are answering questions about a specific vehicle using only the retrieved sources below.
If the answer is uncertain, say so clearly.
Return ONLY valid JSON with this shape:
{{
  "answer": "string",
  "citations": [
    {{
      "source_id": "string",
      "quote": "short supporting quote"
    }}
  ],
  "confidence_note": "string"
}}

Vehicle:
- Brand: {vehicle.brand}
- Model: {vehicle.model}
- Year: {vehicle.year}
- Plate: {vehicle.license_plate}

Question:
{question}

Respond in the same language as the user's question. Do not switch to the source language unless quoting.

Sources:
{chr(10).join(context_blocks)}
"""
        payload = self.gemini_service.generate_json_payload(
            prompt=prompt,
            content=[],
            models=self.ANSWER_MODELS,
            api_key=api_key,
        )
        source_map = {source.source_id: source for source in sources}
        citations = []
        used_documents = []
        seen_doc_labels: set[str] = set()
        for citation in payload.get("citations") or []:
            source_id = str(citation.get("source_id") or "").strip()
            source = source_map.get(source_id)
            if not source:
                continue
            citations.append(
                {
                    "source_id": source.source_id,
                    "source_label": source.source_label,
                    "page_number": source.page_number,
                    "quote": str(citation.get("quote") or "").strip(),
                    "file_url": source.file_url,
                    "source_type": source.source_type,
                }
            )
            if source.source_label not in seen_doc_labels:
                used_documents.append(
                    {
                        "source_label": source.source_label,
                        "file_url": source.file_url,
                        "source_type": source.source_type,
                    }
                )
                seen_doc_labels.add(source.source_label)

        return {
            "answer": str(payload.get("answer") or "").strip(),
            "citations": citations,
            "used_documents": used_documents,
            "confidence_note": str(payload.get("confidence_note") or "").strip(),
        }

    def retrieve_sources(
        self,
        *,
        session: Session,
        vehicle: Vehicle,
        question: str,
        source_scope: str,
        include_invoice_docs: bool,
    ) -> List[RetrievedSource]:
        query_embedding = self.embed_text(question)

        statement = (
            select(
                VehicleDocumentChunk,
                VehicleDocument,
                VehicleDocumentChunk.embedding.cosine_distance(query_embedding).label("distance"),
            )
            .join(VehicleDocument, VehicleDocumentChunk.document_id == VehicleDocument.id)
            .where(
                VehicleDocument.vehicle_id == vehicle.id,
                VehicleDocument.status == "ready",
                VehicleDocument.included_in_rag == True,  # noqa: E712
            )
        )
        if source_scope == "manuals_only":
            statement = statement.where(
                VehicleDocument.document_type.in_(["owner_manual", "workshop_manual"])
            )
        statement = statement.order_by(
            VehicleDocumentChunk.embedding.cosine_distance(query_embedding)
        ).limit(8)

        retrieved: list[RetrievedSource] = []
        rows = session.exec(statement).all()
        for chunk, document, distance in rows:
            similarity = self._distance_to_similarity(distance)
            if similarity <= 0:
                continue
            retrieved.append(
                RetrievedSource(
                    source_id=f"document:{document.id}:chunk:{chunk.id}",
                    source_type="document",
                    source_label=document.title or document.file_name or f"Document #{document.id}",
                    page_number=chunk.page_number,
                    content=chunk.content,
                    file_url=document.file_url,
                    similarity=similarity,
                )
            )

        if include_invoice_docs:
            retrieved.extend(self._retrieve_invoice_sources(session=session, vehicle=vehicle, question=question))

        retrieved.sort(key=lambda item: item.similarity, reverse=True)
        return retrieved[:8]

    def embed_text(self, text: str) -> List[float]:
        vector = [0.0] * self.EMBEDDING_DIMENSION
        tokens = self.tokenize(text)
        for token in tokens:
            digest = hashlib.sha256(token.encode("utf-8")).digest()
            index = int.from_bytes(digest[:2], "big") % self.EMBEDDING_DIMENSION
            vector[index] += 1.0

        norm = sum(value * value for value in vector) ** 0.5
        if norm == 0:
            return vector
        return [value / norm for value in vector]

    def resolve_file_path(self, file_url: str) -> str:
        return self.storage_service.resolve_file_path(file_url)

    def delete_document_artifacts(self, *, session: Session, document_id: int) -> None:
        self._delete_existing_chunks_and_facts(session=session, document_id=document_id)

    def tokenize(self, text: str) -> List[str]:
        return re.findall(r"[a-zA-Z0-9]{2,}", text.lower())

    def _build_chunks(self, *, document: VehicleDocument, pages: List[ParsedDocumentPage]) -> List[VehicleDocumentChunk]:
        chunks: list[VehicleDocumentChunk] = []
        chunk_index = 0
        for page in pages:
            page_text = re.sub(r"\s+", " ", page.text).strip()
            if not page_text:
                continue
            start = 0
            while start < len(page_text):
                end = min(len(page_text), start + self.CHUNK_SIZE)
                slice_text = page_text[start:end].strip()
                if slice_text:
                    chunks.append(
                        VehicleDocumentChunk(
                            document_id=document.id or 0,
                            vehicle_id=document.vehicle_id,
                            chunk_index=chunk_index,
                            page_number=page.page_number,
                            source_label=document.title or document.file_name,
                            content=slice_text,
                            embedding=self.embed_text(slice_text),
                        )
                    )
                    chunk_index += 1
                if end >= len(page_text):
                    break
                start = max(end - self.CHUNK_OVERLAP, start + 1)
        return chunks

    def _delete_existing_chunks_and_facts(self, *, session: Session, document_id: int) -> None:
        chunk_rows = session.exec(
            select(VehicleDocumentChunk).where(VehicleDocumentChunk.document_id == document_id)
        ).all()
        fact_rows = session.exec(
            select(VehicleKnowledgeFact).where(VehicleKnowledgeFact.document_id == document_id)
        ).all()
        for row in chunk_rows + fact_rows:
            session.delete(row)
        session.commit()

    def _get_document_or_raise(self, *, session: Session, document_id: int) -> VehicleDocument:
        document = session.get(VehicleDocument, document_id)
        if not document or getattr(document, "deletion_requested", False):
            raise DocumentDeletedError(f"Vehicle document {document_id} was deleted during processing")
        return document

    def _update_document_processing_state(
        self,
        *,
        session: Session,
        document_id: int,
        status: Optional[str] = None,
        progress: Optional[int] = None,
        stage: Optional[str] = None,
        detail: Optional[str] = None,
        error_message: Optional[str] = None,
    ) -> VehicleDocument:
        document = self._get_document_or_raise(session=session, document_id=document_id)
        if status is not None:
            document.status = status
        if progress is not None:
            document.processing_progress = max(0, min(100, progress))
        if stage is not None:
            document.processing_stage = stage
        if detail is not None:
            document.processing_detail = detail
        document.error_message = error_message
        document.updated_at = self._utcnow()
        session.add(document)
        session.commit()
        session.refresh(document)
        return document

    def _retrieve_invoice_sources(self, *, session: Session, vehicle: Vehicle, question: str) -> List[RetrievedSource]:
        invoices = session.exec(
            select(Invoice).where(Invoice.vehicle_id == vehicle.id, Invoice.extracted_data.is_not(None))
        ).all()
        query_tokens = set(self.tokenize(question))
        results: list[RetrievedSource] = []
        for invoice in invoices:
            text = self._invoice_to_text(invoice)
            if not text:
                continue
            tokens = set(self.tokenize(text))
            overlap = len(tokens & query_tokens)
            if overlap == 0:
                continue
            similarity = overlap / max(1, len(query_tokens))
            results.append(
                RetrievedSource(
                    source_id=f"invoice:{invoice.id}",
                    source_type="invoice",
                    source_label=invoice.file_name or invoice.number or f"Invoice #{invoice.id}",
                    page_number=None,
                    content=text[:1800],
                    file_url=invoice.file_url,
                    similarity=similarity,
                )
            )
        return results

    def expand_query_for_retrieval(self, *, question: str, api_key: str) -> dict[str, str]:
        prompt = f"""
You are preparing a multilingual search query for vehicle documentation retrieval.
Return ONLY valid JSON with this shape:
{{
  "retrieval_query": "string",
  "detected_language": "string"
}}

Rules:
- Preserve the user's intent exactly.
- If the user's question is not in English, include an English reformulation optimized for matching workshop manuals and technical docs.
- Keep technical terms, part names, fluids, torque, intervals, procedures and abbreviations.
- The retrieval query may combine the original wording and the English reformulation if that helps retrieval.

Question:
{question}
"""
        payload = self.gemini_service.generate_json_payload(
            prompt=prompt,
            content=[],
            models=self.ANSWER_MODELS,
            api_key=api_key,
            validator=lambda candidate: bool(str(candidate.get("retrieval_query") or "").strip()),
            fallback_resolver=lambda _exc: {
                "retrieval_query": question,
                "detected_language": "unknown",
            },
        )
        retrieval_query = str(payload.get("retrieval_query") or "").strip()
        detected_language = str(payload.get("detected_language") or "").strip() or "unknown"
        return {
            "retrieval_query": retrieval_query,
            "detected_language": detected_language,
        }

    def _localized_no_sources_response(self, detected_language: Optional[str], question: str) -> dict[str, str]:
        language = self._normalize_language_code(detected_language) or self._infer_language_from_question(question)
        return self.FALLBACK_MESSAGES.get(language, self.FALLBACK_MESSAGES["en"])

    def _distance_to_similarity(self, distance: Any) -> float:
        try:
            numeric_distance = float(distance)
        except (TypeError, ValueError):
            return 0.0
        return max(0.0, 1.0 - numeric_distance)

    def _normalize_language_code(self, value: Optional[str]) -> Optional[str]:
        if not value:
            return None
        normalized = value.strip().lower()
        if normalized.startswith("es"):
            return "es"
        if normalized.startswith("en"):
            return "en"
        return None

    def _infer_language_from_question(self, question: str) -> str:
        lowered = question.lower()
        spanish_markers = (
            "¿",
            "qué",
            "como ",
            "cuál",
            "cuanto",
            "dónde",
            "rueda",
            "tuerca",
            "apriete",
            "manual",
        )
        if any(marker in lowered for marker in spanish_markers):
            return "es"
        return "en"

    def _invoice_to_text(self, invoice: Invoice) -> str:
        fields = [
            f"Invoice number: {invoice.number}" if invoice.number else "",
            f"Date: {invoice.date.isoformat()}" if invoice.date else "",
            f"Amount: {invoice.amount}" if invoice.amount is not None else "",
        ]
        try:
            payload = json.loads(invoice.extracted_data or "{}")
        except json.JSONDecodeError:
            payload = {}

        if payload.get("supplier_name"):
            fields.append(f"Supplier: {payload['supplier_name']}")
        if payload.get("vehicle_plate"):
            fields.append(f"Vehicle plate: {payload['vehicle_plate']}")
        if payload.get("vehicle_vin"):
            fields.append(f"VIN: {payload['vehicle_vin']}")
        for maintenance in payload.get("maintenances") or []:
            description = maintenance.get("description")
            if description:
                fields.append(f"Maintenance: {description}")
            for part in maintenance.get("parts") or []:
                part_name = part.get("name")
                if part_name:
                    fields.append(f"Part: {part_name}")
        for part in payload.get("parts_only") or []:
            part_name = part.get("name")
            if part_name:
                fields.append(f"Part purchase: {part_name}")

        return "\n".join(value for value in fields if value).strip()

    def _parse_json_payload(self, raw_text: str) -> dict[str, Any]:
        return self.gemini_service.parse_json_payload(raw_text)

    def _has_non_empty_page_text(self, payload: dict[str, Any]) -> bool:
        pages = payload.get("pages") or []
        return any(str(page.get("text") or "").strip() for page in pages if isinstance(page, dict))

    def _image_transcription_fallback_payload(self, *, content: list[Any], api_key: str) -> dict[str, Any]:
        fallback_text = self.gemini_service.generate_text_content(
            prompt="Transcribe this vehicle document image faithfully in plain text.",
            content=content,
            models=self.TRANSCRIPTION_MODELS,
            api_key=api_key,
        )
        return {
            "pages": [
                {
                    "page_number": 1,
                    "text": fallback_text.strip(),
                }
            ]
        }

    def _empty_pages_payload(self) -> dict[str, Any]:
        return {"pages": []}

    def _safe_float(self, value: Any) -> Optional[float]:
        try:
            if value is None or value == "":
                return None
            return float(value)
        except (TypeError, ValueError):
            return None

    def _utcnow(self):
        from datetime import datetime

        return datetime.utcnow()
