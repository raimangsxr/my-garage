from typing import Optional, TYPE_CHECKING, List
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import Column, JSON

if TYPE_CHECKING:
    from .vehicle import Vehicle

class VehicleSpecsBase(SQLModel):
    # Identification
    vin: Optional[str] = None
    color: Optional[str] = None
    color_code: Optional[str] = None
    # Engine & Transmission
    engine_type: Optional[str] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    # Fluids & Consumables
    engine_oil_type: Optional[str] = None
    coolant_type: Optional[str] = None
    battery_type: Optional[str] = None
    tire_size: Optional[str] = None

class VehicleSpecs(VehicleSpecsBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    vehicle_id: int = Field(foreign_key="vehicle.id", unique=True)
    torque_specs: Optional[List[dict]] = Field(default=None, sa_column=Column(JSON))
    
    vehicle: Optional["Vehicle"] = Relationship(back_populates="specs")

class VehicleSpecsRead(VehicleSpecsBase):
    id: int
    vehicle_id: int
    torque_specs: Optional[List[dict]] = None
