from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .maintenance import Maintenance
    from .part import Part
    from .invoice import Invoice

class SupplierBase(SQLModel):
    name: str = Field(index=True)
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    tax_id: Optional[str] = None  # NIF/CIF

class Supplier(SupplierBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    maintenances: List["Maintenance"] = Relationship(back_populates="supplier")
    parts: List["Part"] = Relationship(back_populates="supplier")
    invoices: List["Invoice"] = Relationship(back_populates="supplier")
