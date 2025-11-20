from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .maintenance import Maintenance

class VehicleBase(SQLModel):
    brand: str
    model: str
    year: int
    license_plate: str = Field(unique=True, index=True)
    image_url: Optional[str] = None

class Vehicle(VehicleBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    maintenances: List["Maintenance"] = Relationship(back_populates="vehicle")
