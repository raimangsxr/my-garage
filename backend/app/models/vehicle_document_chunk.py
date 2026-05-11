from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import Column, Text
from pgvector.sqlalchemy import VECTOR
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
    embedding: Any = Field(sa_type=VECTOR(256))


class VehicleDocumentChunk(VehicleDocumentChunkBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    document: Optional["VehicleDocument"] = Relationship(back_populates="chunks")
    vehicle: Optional["Vehicle"] = Relationship()
