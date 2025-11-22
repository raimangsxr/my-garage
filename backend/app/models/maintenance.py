from typing import Optional, List, TYPE_CHECKING
from datetime import date
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .vehicle import Vehicle
    from .supplier import Supplier
    from .part import Part
    from .invoice import Invoice

class MaintenanceBase(SQLModel):
    date: date
    description: str
    mileage: int
    cost: float
    vehicle_id: Optional[int] = Field(default=None, foreign_key="vehicle.id")
    supplier_id: Optional[int] = Field(default=None, foreign_key="supplier.id")

class Maintenance(MaintenanceBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    vehicle: Optional["Vehicle"] = Relationship(back_populates="maintenances")
    supplier: Optional["Supplier"] = Relationship(back_populates="maintenances")
    parts: List["Part"] = Relationship(back_populates="maintenance")
    invoices: List["Invoice"] = Relationship(back_populates="maintenance")
