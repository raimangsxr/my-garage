from typing import Optional, TYPE_CHECKING, List
import datetime
from enum import Enum
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .part import Part
    from .vehicle import Vehicle
    from .supplier import Supplier

class InvoiceStatus(str, Enum):
    """Estados del procesamiento de facturas"""
    PENDING = "pending"          # Archivo subido, pendiente de procesamiento
    PROCESSING = "processing"     # Gemini procesando
    REVIEW = "review"            # Datos extraídos, esperando confirmación
    APPROVED = "approved"        # Confirmado por usuario, registros creados
    FAILED = "failed"            # Error en procesamiento

class InvoiceBase(SQLModel):
    # Campos opcionales hasta que Gemini los extraiga
    number: Optional[str] = Field(default=None)
    date: Optional[datetime.date] = Field(default=None)
    amount: Optional[float] = Field(default=None)
    tax_amount: Optional[float] = Field(default=None)
    
    # Archivo (REQUERIDO)
    file_url: str
    file_name: Optional[str] = Field(default=None)
    
    # Estado del procesamiento
    status: str = Field(default=InvoiceStatus.PENDING.value)
    
    # Datos extraídos por Gemini (JSON)
    extracted_data: Optional[str] = Field(default=None)  # JSON con InvoiceExtractedData
    error_message: Optional[str] = Field(default=None)
    
    # Relaciones (el vehículo se determina automáticamente o manualmente)
    # Relaciones (el vehículo se determina automáticamente o manualmente)
    vehicle_id: Optional[int] = Field(default=None, foreign_key="vehicle.id")
    supplier_id: Optional[int] = Field(default=None, foreign_key="supplier.id")
    
    # Ya NO tiene maintenance_id - las facturas se vinculan vía vehicle

class Invoice(InvoiceBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Relaciones
    vehicle: Optional["Vehicle"] = Relationship(back_populates="invoices")
    supplier: Optional["Supplier"] = Relationship(back_populates="invoices")
    parts: List["Part"] = Relationship(back_populates="invoice")
