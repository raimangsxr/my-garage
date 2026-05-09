from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Column, DateTime, Text
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .vehicle import Vehicle
    from .vehicle_document_chunk import VehicleDocumentChunk
    from .vehicle_knowledge_fact import VehicleKnowledgeFact


class VehicleDocumentType(str, Enum):
    OWNER_MANUAL = "owner_manual"
    WORKSHOP_MANUAL = "workshop_manual"
    INVOICE = "invoice"
    INSURANCE = "insurance"
    REGISTRATION = "registration"
    OTHER = "other"


class VehicleDocumentStatus(str, Enum):
    UPLOADED = "uploaded"
    INDEXING = "indexing"
    READY = "ready"
    FAILED = "failed"


class VehicleDocumentBase(SQLModel):
    vehicle_id: int = Field(foreign_key="vehicle.id", index=True)
    title: Optional[str] = None
    document_type: str = Field(default=VehicleDocumentType.OTHER.value, index=True)
    mime_type: Optional[str] = None
    file_url: str
    file_name: Optional[str] = None
    status: str = Field(default=VehicleDocumentStatus.UPLOADED.value, index=True)
    included_in_rag: bool = Field(default=True, index=True)
    extracted_text: Optional[str] = Field(default=None, sa_column=Column(Text))
    error_message: Optional[str] = Field(default=None, sa_column=Column(Text))
    chunk_count: int = Field(default=0)
    indexed_at: Optional[datetime] = Field(default=None, sa_column=Column(DateTime(timezone=False)))


class VehicleDocument(VehicleDocumentBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime(timezone=False), nullable=False),
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime(timezone=False), nullable=False),
    )

    vehicle: Optional["Vehicle"] = Relationship(back_populates="documents")
    chunks: List["VehicleDocumentChunk"] = Relationship(
        back_populates="document",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    knowledge_facts: List["VehicleKnowledgeFact"] = Relationship(
        back_populates="document",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class VehicleDocumentRead(VehicleDocumentBase):
    id: int
    created_at: datetime
    updated_at: datetime
