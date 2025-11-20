from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .maintenance import Maintenance

class PartBase(SQLModel):
    name: str
    reference: Optional[str] = None
    price: float
    quantity: int = 1
    maintenance_id: Optional[int] = Field(default=None, foreign_key="maintenance.id")

class Part(PartBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    maintenance: Optional["Maintenance"] = Relationship(back_populates="parts")
