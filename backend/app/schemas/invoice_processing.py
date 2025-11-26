from pydantic import BaseModel, Field
from datetime import date
from typing import List, Optional

class ExtractedPart(BaseModel):
    """Pieza extraída de la factura"""
    name: str
    reference: Optional[str] = None
    quantity: float = 1.0
    unit_price: float
    total_price: float

class ExtractedMaintenance(BaseModel):
    """Mantenimiento extraído de la factura"""
    description: str
    labor_cost: Optional[float] = None
    parts: List[ExtractedPart] = []

class InvoiceExtractedData(BaseModel):
    """Datos estructurados extraídos de la factura por Gemini"""
    invoice_number: Optional[str] = None
    invoice_date: Optional[date] = None
    supplier_name: Optional[str] = None
    supplier_address: Optional[str] = None
    supplier_tax_id: Optional[str] = None
    
    # Tipo de factura
    is_maintenance: bool = False
    is_parts_only: bool = False
    
    # Datos de vehículo (si se mencionan)
    vehicle_id: Optional[int] = None
    vehicle_plate: Optional[str] = None
    vehicle_vin: Optional[str] = None
    mileage: Optional[int] = None
    
    # Contenido
    maintenances: List[ExtractedMaintenance] = []
    parts_only: List[ExtractedPart] = []  # Para compra de piezas sin mantenimiento
    
    # Totales
    subtotal: Optional[float] = None
    tax_amount: Optional[float] = None
    total_amount: float
    
    # Confianza del LLM
    confidence: float = Field(ge=0, le=1, description="Confianza del LLM en la extracción")
