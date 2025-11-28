from typing import List, Any, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.api import deps
from app.models.track import Track, TrackCreate, TrackRead, TrackUpdate
from app.models.track_record import TrackRecord, TrackRecordRead
from app.models.vehicle import Vehicle
from app.models.user import User
from pydantic import BaseModel
from datetime import date

router = APIRouter()

# Response Models
class TrackSummary(BaseModel):
    id: int
    name: str
    location: str | None
    length_meters: int | None
    total_sessions: int
    best_lap_time: str | None
    best_lap_vehicle_name: str | None
    vehicle_count: int
    last_session_date: date | None

class VehicleRecordGroup(BaseModel):
    vehicle_id: int
    vehicle_name: str
    vehicle_brand: str | None
    vehicle_model: str | None
    records: List[TrackRecordRead]
    best_lap_time: str

class TrackDetail(BaseModel):
    id: int
    name: str
    location: str | None
    length_meters: int | None
    description: str | None
    total_sessions: int
    best_lap_time: str | None
    vehicle_groups: List[VehicleRecordGroup]

@router.get("", response_model=List[TrackSummary])
def get_tracks(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all tracks with aggregated statistics.
    """
    # Migration check: Ensure tracks exist for all unique circuit_names
    migrate_legacy_records(db)
    
    # Get all tracks
    tracks = db.exec(select(Track)).all()
    
    summaries = []
    
    for track in tracks:
        # Get records for this track
        statement = select(TrackRecord, Vehicle).join(
            Vehicle, TrackRecord.vehicle_id == Vehicle.id
        ).where(TrackRecord.track_id == track.id)
        
        results = db.exec(statement).all()
        
        if not results:
            # Include track even if no records (it might be newly created)
            summaries.append(TrackSummary(
                id=track.id,
                name=track.name,
                location=track.location,
                length_meters=track.length_meters,
                total_sessions=0,
                best_lap_time=None,
                best_lap_vehicle_name=None,
                vehicle_count=0,
                last_session_date=None
            ))
            continue
            
        # Aggregate data
        best_time = results[0][0].best_lap_time
        best_vehicle = f"{results[0][1].brand} {results[0][1].model}"
        last_date = results[0][0].date_achieved
        vehicles = set()
        
        for record, vehicle in results:
            vehicles.add(vehicle.id)
            
            if record.best_lap_time < best_time:
                best_time = record.best_lap_time
                best_vehicle = f"{vehicle.brand} {vehicle.model}" if vehicle.brand and vehicle.model else vehicle.license_plate
            
            if record.date_achieved > last_date:
                last_date = record.date_achieved
        
        summaries.append(TrackSummary(
            id=track.id,
            name=track.name,
            location=track.location,
            length_meters=track.length_meters,
            total_sessions=len(results),
            best_lap_time=best_time,
            best_lap_vehicle_name=best_vehicle,
            vehicle_count=len(vehicles),
            last_session_date=last_date
        ))
    
    # Sort by name
    summaries.sort(key=lambda x: x.name)
    
    return summaries

@router.get("/{track_id}", response_model=TrackDetail)
def get_track_detail(
    *,
    db: Session = Depends(deps.get_db),
    track_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get detailed information for a specific track.
    """
    track = db.get(Track, track_id)
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")
        
    # Get all track records for this track with vehicle information
    statement = select(TrackRecord, Vehicle).join(
        Vehicle, TrackRecord.vehicle_id == Vehicle.id
    ).where(TrackRecord.track_id == track_id)
    
    results = db.exec(statement).all()
    
    if not results:
        return TrackDetail(
            id=track.id,
            name=track.name,
            location=track.location,
            length_meters=track.length_meters,
            description=track.description,
            total_sessions=0,
            best_lap_time=None,
            vehicle_groups=[]
        )
    
    # Group by vehicle
    vehicle_groups_dict: Dict[int, Dict] = {}
    overall_best_time = results[0][0].best_lap_time
    
    for record, vehicle in results:
        vehicle_id = vehicle.id
        
        if vehicle_id not in vehicle_groups_dict:
            vehicle_name = f"{vehicle.brand} {vehicle.model}" if vehicle.brand and vehicle.model else vehicle.license_plate
            vehicle_groups_dict[vehicle_id] = {
                'vehicle_id': vehicle_id,
                'vehicle_name': vehicle_name,
                'vehicle_brand': vehicle.brand,
                'vehicle_model': vehicle.model,
                'records': [],
                'best_lap_time': record.best_lap_time
            }
        
        vehicle_groups_dict[vehicle_id]['records'].append(TrackRecordRead(**record.model_dump()))
        
        # Update vehicle's best time
        if record.best_lap_time < vehicle_groups_dict[vehicle_id]['best_lap_time']:
            vehicle_groups_dict[vehicle_id]['best_lap_time'] = record.best_lap_time
        
        # Update overall best time
        if record.best_lap_time < overall_best_time:
            overall_best_time = record.best_lap_time
    
    # Sort records within each vehicle group by date
    for group_data in vehicle_groups_dict.values():
        group_data['records'].sort(key=lambda r: r.date_achieved)
    
    # Convert to response model
    vehicle_groups = [
        VehicleRecordGroup(**group_data)
        for group_data in vehicle_groups_dict.values()
    ]
    
    # Sort groups by best lap time
    vehicle_groups.sort(key=lambda g: g.best_lap_time)
    
    return TrackDetail(
        id=track.id,
        name=track.name,
        location=track.location,
        length_meters=track.length_meters,
        description=track.description,
        total_sessions=len(results),
        best_lap_time=overall_best_time,
        vehicle_groups=vehicle_groups,
        image_url=track.image_url
    )

@router.post("", response_model=TrackRead)
def create_track(
    *,
    db: Session = Depends(deps.get_db),
    track_in: TrackCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new track.
    """
    track = Track.model_validate(track_in)
    db.add(track)
    db.commit()
    db.refresh(track)
    return track

def migrate_legacy_records(db: Session):
    """
    Helper to migrate legacy records that have circuit_name but no track_id.
    This finds unique circuit_names, creates Tracks for them, and updates the records.
    """
    # Find records with no track_id
    statement = select(TrackRecord).where(TrackRecord.track_id == None)
    legacy_records = db.exec(statement).all()
    
    if not legacy_records:
        return
        
    # Group by circuit_name
    circuit_names = set(r.circuit_name for r in legacy_records if r.circuit_name)
    
    for name in circuit_names:
        # Check if track exists
        track = db.exec(select(Track).where(Track.name == name)).first()
        
        if not track:
            # Create new track
            track = Track(name=name)
            db.add(track)
            db.commit()
            db.refresh(track)
            
        # Update records
        records_to_update = [r for r in legacy_records if r.circuit_name == name]
        for record in records_to_update:
            record.track_id = track.id
            db.add(record)
            
    db.commit()
