from __future__ import annotations

from datetime import datetime
from typing import Any, Literal, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, Query, UploadFile
from pydantic import BaseModel, Field
from sqlmodel import Session, select

from app.api import deps
from app.core.storage import StorageService
from app.database import get_db_context
from app.models import User, Vehicle, VehicleDocument, VehicleKnowledgeFact
from app.services.vehicle_document_rag_service import VehicleDocumentRAGService

router = APIRouter()

storage_service = StorageService(upload_dir="media/vehicle-documents")
rag_service = VehicleDocumentRAGService()


class VehicleDocumentUpdate(BaseModel):
    title: Optional[str] = None
    document_type: Optional[str] = None
    included_in_rag: Optional[bool] = None


class VehicleDocumentResponse(BaseModel):
    id: int
    vehicle_id: int
    title: Optional[str] = None
    document_type: str
    mime_type: Optional[str] = None
    file_url: str
    file_name: Optional[str] = None
    status: str
    included_in_rag: bool
    error_message: Optional[str] = None
    chunk_count: int
    processing_progress: int
    processing_stage: Optional[str] = None
    processing_detail: Optional[str] = None
    indexed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class VehicleKnowledgeFactUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    content: Optional[str] = None
    is_hidden: Optional[bool] = None


class VehicleKnowledgeFactResponse(BaseModel):
    id: int
    vehicle_id: int
    document_id: Optional[int] = None
    title: str
    category: Optional[str] = None
    content: str
    source_excerpt: Optional[str] = None
    confidence: Optional[float] = None
    is_hidden: bool
    created_at: datetime
    source_label: Optional[str] = None


class VehicleChatAskRequest(BaseModel):
    question: str = Field(min_length=3, max_length=4000)
    source_scope: Literal["all_documents", "manuals_only"] = "all_documents"
    include_invoice_docs: bool = True


class VehicleChatCitationResponse(BaseModel):
    source_id: str
    source_label: str
    page_number: Optional[int] = None
    quote: str
    file_url: Optional[str] = None
    source_type: str


class VehicleChatUsedDocumentResponse(BaseModel):
    source_label: str
    file_url: Optional[str] = None
    source_type: str


class VehicleChatAskResponse(BaseModel):
    answer: str
    citations: list[VehicleChatCitationResponse]
    used_documents: list[VehicleChatUsedDocumentResponse]
    confidence_note: str


def process_vehicle_document_background(document_id: int, gemini_api_key: str) -> None:
    with get_db_context() as session:
        rag_service.process_document(session=session, document_id=document_id, gemini_api_key=gemini_api_key)


@router.get("/vehicles/{vehicle_id}/documents", response_model=list[VehicleDocumentResponse])
def list_vehicle_documents(
    *,
    vehicle_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    _ensure_vehicle_exists(db=db, vehicle_id=vehicle_id)
    documents = db.exec(
        select(VehicleDocument)
        .where(VehicleDocument.vehicle_id == vehicle_id)
        .order_by(VehicleDocument.created_at.desc())
    ).all()
    return [_serialize_document(document) for document in documents]


@router.post("/vehicles/{vehicle_id}/documents/upload", response_model=VehicleDocumentResponse)
async def upload_vehicle_document(
    *,
    vehicle_id: int,
    db: Session = Depends(deps.get_db),
    file: UploadFile = File(...),
    document_type: str = Form(...),
    title: Optional[str] = Form(default=None),
    current_user: User = Depends(deps.get_current_active_user),
    background_tasks: BackgroundTasks,
) -> Any:
    _ensure_vehicle_exists(db=db, vehicle_id=vehicle_id)
    _validate_document_type(document_type)
    gemini_key = rag_service.resolve_gemini_api_key(current_user)

    try:
        _, file_url = await storage_service.save_file(file)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    document = VehicleDocument(
        vehicle_id=vehicle_id,
        title=(title or file.filename or "Untitled document").strip()[:160],
        document_type=document_type,
        mime_type=file.content_type or storage_service.resolve_mime_type(file.filename),
        file_url=file_url,
        file_name=file.filename,
        status="uploaded",
        processing_progress=0,
        processing_stage="uploaded",
        processing_detail="Upload complete. Waiting for indexing to start.",
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    background_tasks.add_task(process_vehicle_document_background, document.id, gemini_key)
    return _serialize_document(document)


@router.patch("/vehicle-documents/{document_id}", response_model=VehicleDocumentResponse)
def update_vehicle_document(
    *,
    document_id: int,
    payload: VehicleDocumentUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    document = db.get(VehicleDocument, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Vehicle document not found")

    if payload.document_type is not None:
        _validate_document_type(payload.document_type)
        document.document_type = payload.document_type
    if payload.title is not None:
        document.title = payload.title.strip()[:160]
    if payload.included_in_rag is not None:
        document.included_in_rag = payload.included_in_rag
    document.updated_at = datetime.utcnow()
    db.add(document)
    db.commit()
    db.refresh(document)
    return _serialize_document(document)


@router.delete("/vehicle-documents/{document_id}")
def delete_vehicle_document(
    *,
    document_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    document = db.get(VehicleDocument, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Vehicle document not found")

    file_path = rag_service.resolve_file_path(document.file_url)
    document.deletion_requested = True
    document.processing_stage = "deleting"
    document.processing_detail = "Deletion requested. Cleaning indexed artifacts."
    document.updated_at = datetime.utcnow()
    db.add(document)
    db.commit()

    rag_service.delete_document_artifacts(session=db, document_id=document_id)
    document = db.get(VehicleDocument, document_id)
    if not document:
        storage_service.delete_file(file_path)
        return {"message": "Vehicle document deleted successfully"}
    db.delete(document)
    db.commit()
    storage_service.delete_file(file_path)
    return {"message": "Vehicle document deleted successfully"}


@router.post("/vehicle-documents/{document_id}/reindex", response_model=VehicleDocumentResponse)
def reindex_vehicle_document(
    *,
    document_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
    background_tasks: BackgroundTasks,
) -> Any:
    document = db.get(VehicleDocument, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Vehicle document not found")

    gemini_key = rag_service.resolve_gemini_api_key(current_user)

    document.status = "uploaded"
    document.error_message = None
    document.processing_progress = 0
    document.processing_stage = "uploaded"
    document.processing_detail = "Reindex requested. Waiting to restart processing."
    document.updated_at = datetime.utcnow()
    db.add(document)
    db.commit()
    db.refresh(document)

    background_tasks.add_task(process_vehicle_document_background, document.id, gemini_key)
    return _serialize_document(document)


@router.get("/vehicles/{vehicle_id}/knowledge", response_model=list[VehicleKnowledgeFactResponse])
def list_vehicle_knowledge(
    *,
    vehicle_id: int,
    include_hidden: bool = Query(default=False),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    _ensure_vehicle_exists(db=db, vehicle_id=vehicle_id)

    statement = (
        select(VehicleKnowledgeFact, VehicleDocument)
        .join(VehicleDocument, VehicleKnowledgeFact.document_id == VehicleDocument.id, isouter=True)
        .where(VehicleKnowledgeFact.vehicle_id == vehicle_id)
        .order_by(VehicleKnowledgeFact.created_at.desc())
    )
    if not include_hidden:
        statement = statement.where(VehicleKnowledgeFact.is_hidden == False)  # noqa: E712

    rows = db.exec(statement).all()
    result = []
    for fact, document in rows:
        result.append(
            VehicleKnowledgeFactResponse(
                id=fact.id or 0,
                vehicle_id=fact.vehicle_id,
                document_id=fact.document_id,
                title=fact.title,
                category=fact.category,
                content=fact.content,
                source_excerpt=fact.source_excerpt,
                confidence=fact.confidence,
                is_hidden=fact.is_hidden,
                created_at=fact.created_at,
                source_label=document.title if document and document.title else (document.file_name if document else None),
            )
        )
    return result


@router.patch("/vehicle-knowledge/{fact_id}", response_model=VehicleKnowledgeFactResponse)
def update_vehicle_knowledge(
    *,
    fact_id: int,
    payload: VehicleKnowledgeFactUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    fact = db.get(VehicleKnowledgeFact, fact_id)
    if not fact:
        raise HTTPException(status_code=404, detail="Vehicle knowledge fact not found")

    if payload.title is not None:
        fact.title = payload.title.strip()[:160]
    if payload.category is not None:
        fact.category = payload.category.strip()[:64] or None
    if payload.content is not None:
        fact.content = payload.content.strip()
    if payload.is_hidden is not None:
        fact.is_hidden = payload.is_hidden

    db.add(fact)
    db.commit()
    db.refresh(fact)
    document = db.get(VehicleDocument, fact.document_id) if fact.document_id else None
    return VehicleKnowledgeFactResponse(
        id=fact.id or 0,
        vehicle_id=fact.vehicle_id,
        document_id=fact.document_id,
        title=fact.title,
        category=fact.category,
        content=fact.content,
        source_excerpt=fact.source_excerpt,
        confidence=fact.confidence,
        is_hidden=fact.is_hidden,
        created_at=fact.created_at,
        source_label=document.title if document and document.title else (document.file_name if document else None),
    )


@router.delete("/vehicle-knowledge/{fact_id}")
def delete_vehicle_knowledge(
    *,
    fact_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    fact = db.get(VehicleKnowledgeFact, fact_id)
    if not fact:
        raise HTTPException(status_code=404, detail="Vehicle knowledge fact not found")
    db.delete(fact)
    db.commit()
    return {"message": "Vehicle knowledge fact deleted successfully"}


@router.post("/vehicles/{vehicle_id}/chat/ask", response_model=VehicleChatAskResponse)
def ask_vehicle_document_chat(
    *,
    vehicle_id: int,
    payload: VehicleChatAskRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    vehicle = _ensure_vehicle_exists(db=db, vehicle_id=vehicle_id)
    gemini_key = rag_service.resolve_gemini_api_key(current_user)
    if not gemini_key:
        raise HTTPException(status_code=400, detail="Gemini API key not configured")

    response = rag_service.answer_question(
        session=db,
        vehicle=vehicle,
        question=payload.question.strip(),
        source_scope=payload.source_scope,
        include_invoice_docs=payload.include_invoice_docs,
        api_key=gemini_key,
    )
    return VehicleChatAskResponse(**response)


def _ensure_vehicle_exists(*, db: Session, vehicle_id: int) -> Vehicle:
    vehicle = db.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


def _validate_document_type(value: str) -> None:
    allowed_types = {
        "owner_manual",
        "workshop_manual",
        "invoice",
        "insurance",
        "registration",
        "other",
    }
    if value not in allowed_types:
        raise HTTPException(status_code=422, detail="Unsupported document type")


def _serialize_document(document: VehicleDocument) -> VehicleDocumentResponse:
    return VehicleDocumentResponse(
        id=document.id or 0,
        vehicle_id=document.vehicle_id,
        title=document.title,
        document_type=document.document_type,
        mime_type=document.mime_type,
        file_url=document.file_url,
        file_name=document.file_name,
        status=document.status,
        included_in_rag=document.included_in_rag,
        error_message=document.error_message,
        chunk_count=document.chunk_count,
        processing_progress=document.processing_progress,
        processing_stage=document.processing_stage,
        processing_detail=document.processing_detail,
        indexed_at=document.indexed_at,
        created_at=document.created_at,
        updated_at=document.updated_at,
    )
