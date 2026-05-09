from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Column, DateTime, Text
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .vehicle_document import VehicleDocument
    from .vehicle import Vehicle


class VehicleKnowledgeFactBase(SQLModel):
    vehicle_id: int = Field(foreign_key="vehicle.id", index=True)
    document_id: Optional[int] = Field(default=None, foreign_key="vehicledocument.id", index=True)
    title: str
    category: Optional[str] = Field(default=None, index=True)
    content: str = Field(sa_column=Column(Text, nullable=False))
    source_excerpt: Optional[str] = Field(default=None, sa_column=Column(Text))
    confidence: Optional[float] = None
    is_hidden: bool = Field(default=False, index=True)


class VehicleKnowledgeFact(VehicleKnowledgeFactBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(DateTime(timezone=False), nullable=False),
    )

    document: Optional["VehicleDocument"] = Relationship(back_populates="knowledge_facts")
    vehicle: Optional["Vehicle"] = Relationship(back_populates="knowledge_facts")


class VehicleKnowledgeFactRead(VehicleKnowledgeFactBase):
    id: int
    created_at: datetime
