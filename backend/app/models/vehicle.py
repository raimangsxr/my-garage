from typing import Optional, List, TYPE_CHECKING
from datetime import date
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import Column, LargeBinary

if TYPE_CHECKING:
    from .maintenance import Maintenance
    from .vehicle_specs import VehicleSpecs
    from .track_record import TrackRecord
    from .invoice import Invoice

from .vehicle_specs import VehicleSpecsBase

class VehicleBase(SQLModel):
    # Basic info (frequently accessed)
    brand: str
    model: str
    year: int
    license_plate: str = Field(unique=True, index=True)
    kilometers: Optional[int] = None
    usage_type: str = Field(default="street")  # street, track, or both
    # Important dates (frequently checked)
    next_itv_date: Optional[date] = None
    next_insurance_date: Optional[date] = None
    last_insurance_amount: Optional[float] = None
    next_road_tax_date: Optional[date] = None
    last_road_tax_amount: Optional[float] = None

class Vehicle(VehicleBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    image_binary: Optional[bytes] = Field(default=None, sa_column=Column(LargeBinary))
    
    # Relationships
    maintenances: List["Maintenance"] = Relationship(back_populates="vehicle")
    specs: Optional["VehicleSpecs"] = Relationship(back_populates="vehicle", sa_relationship_kwargs={"uselist": False})
    track_records: List["TrackRecord"] = Relationship(back_populates="vehicle")
    invoices: List["Invoice"] = Relationship(back_populates="vehicle")

class VehicleRead(VehicleBase):
    id: int
    image_url: Optional[str] = None
    specs: Optional["VehicleSpecsBase"] = None

class VehicleCreate(VehicleBase):
    specs: Optional["VehicleSpecsBase"] = None

class VehicleUpdate(VehicleBase):
    brand: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    license_plate: Optional[str] = None
    specs: Optional["VehicleSpecsBase"] = None
