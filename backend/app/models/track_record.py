from typing import Optional, TYPE_CHECKING
from datetime import date
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .vehicle import Vehicle

class TrackRecordBase(SQLModel):
    circuit_name: str
    best_lap_time: str  # Format: MM:SS.mmm
    date_achieved: date
    weather_conditions: Optional[str] = None
    tire_compound: Optional[str] = None
    group: Optional[str] = None
    organizer: Optional[str] = None
    notes: Optional[str] = None

class TrackRecord(TrackRecordBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    vehicle_id: int = Field(foreign_key="vehicle.id")
    
    vehicle: Optional["Vehicle"] = Relationship(back_populates="track_records")

class TrackRecordRead(TrackRecordBase):
    id: int
    vehicle_id: int

class TrackRecordCreate(TrackRecordBase):
    pass

class TrackRecordUpdate(TrackRecordBase):
    circuit_name: Optional[str] = None
    best_lap_time: Optional[str] = None
    date_achieved: Optional[date] = None
