from typing import Optional, TYPE_CHECKING
from datetime import date
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .maintenance import Maintenance

class InvoiceBase(SQLModel):
    number: str
    date: date
    amount: float
    file_url: Optional[str] = None
    maintenance_id: Optional[int] = Field(default=None, foreign_key="maintenance.id")

class Invoice(InvoiceBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    maintenance: Optional["Maintenance"] = Relationship(back_populates="invoice")
