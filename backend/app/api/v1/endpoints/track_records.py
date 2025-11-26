from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.api import deps
from app.models.track_record import TrackRecord, TrackRecordCreate, TrackRecordRead, TrackRecordUpdate
from app.models.vehicle import Vehicle
from app.models.user import User

router = APIRouter()

@router.get("/{vehicle_id}/track-records", response_model=List[TrackRecordRead])
def get_track_records(
    *,
    db: Session = Depends(deps.get_db),
    vehicle_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all track records for a vehicle.
    """
    vehicle = db.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    statement = select(TrackRecord).where(TrackRecord.vehicle_id == vehicle_id)
    records = db.exec(statement).all()
    
    return [TrackRecordRead(**record.model_dump()) for record in records]

@router.post("/{vehicle_id}/track-records", response_model=TrackRecordRead)
def create_track_record(
    *,
    db: Session = Depends(deps.get_db),
    vehicle_id: int,
    record_in: TrackRecordCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new track record for a vehicle.
    """
    vehicle = db.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    record = TrackRecord(vehicle_id=vehicle_id, **record_in.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    
    return TrackRecordRead(**record.model_dump())

@router.put("/track-records/{record_id}", response_model=TrackRecordRead)
def update_track_record(
    *,
    db: Session = Depends(deps.get_db),
    record_id: int,
    record_in: TrackRecordUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a track record.
    """
    record = db.get(TrackRecord, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Track record not found")
    
    record_data = record_in.model_dump(exclude_unset=True)
    for key, value in record_data.items():
        setattr(record, key, value)
    
    db.add(record)
    db.commit()
    db.refresh(record)
    
    return TrackRecordRead(**record.model_dump())

@router.delete("/track-records/{record_id}", response_model=TrackRecordRead)
def delete_track_record(
    *,
    db: Session = Depends(deps.get_db),
    record_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a track record.
    """
    record = db.get(TrackRecord, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Track record not found")
    
    record_dict = record.model_dump()
    db.delete(record)
    db.commit()
    
    return TrackRecordRead(**record_dict)
