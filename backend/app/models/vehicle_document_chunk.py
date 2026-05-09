from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Column, JSON, Text
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .vehicle_document import VehicleDocument
    from .vehicle import Vehicle


class VehicleDocumentChunkBase(SQLModel):
    document_id: int = Field(foreign_key="vehicledocument.id", index=True)
    vehicle_id: int = Field(foreign_key="vehicle.id", index=True)
    chunk_index: int = Field(index=True)
    page_number: Optional[int] = None
    source_label: Optional[str] = None
    content: str = Field(sa_column=Column(Text, nullable=False))
    embedding: List[float] = Field(default_factory=list, sa_column=Column(JSON, nullable=False))


class VehicleDocumentChunk(VehicleDocumentChunkBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    document: Optional["VehicleDocument"] = Relationship(back_populates="chunks")
    vehicle: Optional["Vehicle"] = Relationship()
