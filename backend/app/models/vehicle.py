from typing import Optional, List, TYPE_CHECKING
from datetime import date
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import Column, LargeBinary

if TYPE_CHECKING:
    from .maintenance import Maintenance

class VehicleBase(SQLModel):
    brand: str
    model: str
    year: int
    license_plate: str = Field(unique=True, index=True)
    next_itv_date: Optional[date] = None
    next_insurance_date: Optional[date] = None
    last_insurance_amount: Optional[float] = None
    next_road_tax_date: Optional[date] = None
    last_road_tax_amount: Optional[float] = None

class Vehicle(VehicleBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    image_binary: Optional[bytes] = Field(default=None, sa_column=Column(LargeBinary))
    maintenances: List["Maintenance"] = Relationship(back_populates="vehicle")

class VehicleRead(VehicleBase):
    id: int
    image_url: Optional[str] = None
