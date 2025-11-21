from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.api import deps
from app.models.vehicle import Vehicle
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[Vehicle])
def read_vehicles(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve vehicles.
    """
    statement = select(Vehicle).offset(skip).limit(limit)
    vehicles = db.exec(statement).all()
    return vehicles

@router.post("/", response_model=Vehicle)
def create_vehicle(
    *,
    db: Session = Depends(deps.get_db),
    vehicle_in: Vehicle,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new vehicle.
    """
    db.add(vehicle_in)
    db.commit()
    db.refresh(vehicle_in)
    return vehicle_in

@router.put("/{id}", response_model=Vehicle)
def update_vehicle(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    vehicle_in: Vehicle,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a vehicle.
    """
    vehicle = db.get(Vehicle, id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    vehicle_data = vehicle_in.model_dump(exclude_unset=True)
    for key, value in vehicle_data.items():
        setattr(vehicle, key, value)
        
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.delete("/{id}", response_model=Vehicle)
def delete_vehicle(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a vehicle.
    """
    vehicle = db.get(Vehicle, id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    db.delete(vehicle)
    db.commit()
    return vehicle
