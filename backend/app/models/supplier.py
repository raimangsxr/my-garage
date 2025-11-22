from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .maintenance import Maintenance

class SupplierBase(SQLModel):
    name: str = Field(index=True)
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class Supplier(SupplierBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    maintenances: List["Maintenance"] = Relationship(back_populates="supplier")
    parts: List["Part"] = Relationship(back_populates="supplier")
