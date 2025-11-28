from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .track_record import TrackRecord

class TrackBase(SQLModel):
    name: str = Field(unique=True, index=True)
    location: Optional[str] = None
    length_meters: Optional[int] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

class Track(TrackBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    track_records: List["TrackRecord"] = Relationship(back_populates="track")

class TrackRead(TrackBase):
    id: int

class TrackCreate(TrackBase):
    pass

class TrackUpdate(TrackBase):
    name: Optional[str] = None
    location: Optional[str] = None
    length_meters: Optional[int] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
