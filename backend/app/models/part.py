from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .maintenance import Maintenance
    from .supplier import Supplier
    from .invoice import Invoice

class PartBase(SQLModel):
    name: str
    reference: Optional[str] = None
    price: float
    quantity: float = 1.0
    maintenance_id: Optional[int] = Field(default=None, foreign_key="maintenance.id", index=True)
    supplier_id: Optional[int] = Field(default=None, foreign_key="supplier.id", index=True)
    invoice_id: Optional[int] = Field(default=None, foreign_key="invoice.id", index=True)

class Part(PartBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    maintenance: Optional["Maintenance"] = Relationship(back_populates="parts")
    supplier: Optional["Supplier"] = Relationship(back_populates="parts")
    invoice: Optional["Invoice"] = Relationship(back_populates="parts")

class PartRead(PartBase):
    id: int
    supplier: Optional["SupplierBase"] = None

# Import at the end to avoid circular imports
from .supplier import SupplierBase
