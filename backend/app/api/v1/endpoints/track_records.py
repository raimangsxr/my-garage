from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.api import deps
from app.models.track_record import TrackRecord, TrackRecordCreate, TrackRecordRead, TrackRecordUpdate
from app.models.user import User
from app.services.track_records_service import TrackRecordsService

router = APIRouter()
track_records_service = TrackRecordsService()

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
    try:
        records = track_records_service.list_for_vehicle(session=db, vehicle_id=vehicle_id)
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))

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
    try:
        record = track_records_service.create_for_vehicle(
            session=db,
            vehicle_id=vehicle_id,
            payload=record_in,
        )
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))

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
    try:
        record = track_records_service.update(session=db, record_id=record_id, payload=record_in)
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))

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
    try:
        record = track_records_service.delete(session=db, record_id=record_id)
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return TrackRecordRead(**record.model_dump())
