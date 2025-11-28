from typing import List, Any, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from app.api import deps
from app.models.track_record import TrackRecord, TrackRecordRead
from app.models.vehicle import Vehicle
from app.models.user import User
from pydantic import BaseModel
from datetime import date

router = APIRouter()

# Response Models
class CircuitSummary(BaseModel):
    circuit_name: str
    total_sessions: int
    best_lap_time: str
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

class CircuitDetail(BaseModel):
    circuit_name: str
    total_sessions: int
    best_lap_time: str
    vehicle_groups: List[VehicleRecordGroup]

@router.get("", response_model=List[CircuitSummary])
def get_circuits(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all unique circuits with aggregated statistics.
    """
    # Get all track records with vehicle information
    statement = select(TrackRecord, Vehicle).join(
        Vehicle, TrackRecord.vehicle_id == Vehicle.id
    )
    
    results = db.exec(statement).all()
    
    # Group by circuit name
    circuits_data: Dict[str, Dict] = {}
    
    for record, vehicle in results:
        circuit_name = record.circuit_name
        
        if circuit_name not in circuits_data:
            circuits_data[circuit_name] = {
                'circuit_name': circuit_name,
                'sessions': [],
                'vehicles': set(),
                'best_time': record.best_lap_time,
                'best_vehicle': f"{vehicle.brand} {vehicle.model}" if vehicle.brand and vehicle.model else vehicle.license_plate,
                'last_date': record.date_achieved
            }
        
        circuits_data[circuit_name]['sessions'].append(record)
        circuits_data[circuit_name]['vehicles'].add(vehicle.id)
        
        # Update best time if current record is faster
        if record.best_lap_time < circuits_data[circuit_name]['best_time']:
            circuits_data[circuit_name]['best_time'] = record.best_lap_time
            circuits_data[circuit_name]['best_vehicle'] = f"{vehicle.brand} {vehicle.model}" if vehicle.brand and vehicle.model else vehicle.license_plate
        
        # Update last session date
        if record.date_achieved > circuits_data[circuit_name]['last_date']:
            circuits_data[circuit_name]['last_date'] = record.date_achieved
    
    # Convert to response model
    summaries = [
        CircuitSummary(
            circuit_name=data['circuit_name'],
            total_sessions=len(data['sessions']),
            best_lap_time=data['best_time'],
            best_lap_vehicle_name=data['best_vehicle'],
            vehicle_count=len(data['vehicles']),
            last_session_date=data['last_date']
        )
        for data in circuits_data.values()
    ]
    
    # Sort by circuit name
    summaries.sort(key=lambda x: x.circuit_name)
    
    return summaries

@router.get("/{circuit_name}", response_model=CircuitDetail)
def get_circuit_detail(
    *,
    db: Session = Depends(deps.get_db),
    circuit_name: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get detailed information for a specific circuit with all records grouped by vehicle.
    """
    # Get all track records for this circuit with vehicle information
    statement = select(TrackRecord, Vehicle).join(
        Vehicle, TrackRecord.vehicle_id == Vehicle.id
    ).where(TrackRecord.circuit_name == circuit_name)
    
    results = db.exec(statement).all()
    
    if not results:
        raise HTTPException(status_code=404, detail="Circuit not found")
    
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
    
    return CircuitDetail(
        circuit_name=circuit_name,
        total_sessions=len(results),
        best_lap_time=overall_best_time,
        vehicle_groups=vehicle_groups
    )
