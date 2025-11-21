from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import Response
from sqlmodel import Session, select
from app.api import deps
from app.models.vehicle import Vehicle, VehicleRead, VehicleBase
from app.models.user import User
import base64

router = APIRouter()

@router.get("/", response_model=List[VehicleRead])
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
    
    # Convert to VehicleRead with image_url
    result = []
    for vehicle in vehicles:
        vehicle_dict = vehicle.model_dump()
        if vehicle.image_binary:
            vehicle_dict["image_url"] = f"/api/v1/vehicles/{vehicle.id}/image"
        else:
            vehicle_dict["image_url"] = None
        result.append(VehicleRead(**vehicle_dict))
    
    return result

@router.post("/", response_model=VehicleRead)
def create_vehicle(
    *,
    db: Session = Depends(deps.get_db),
    vehicle_in: VehicleBase,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new vehicle.
    """
    vehicle = Vehicle.model_validate(vehicle_in)
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    
    vehicle_dict = vehicle.model_dump()
    vehicle_dict["image_url"] = None
    return VehicleRead(**vehicle_dict)

@router.put("/{id}", response_model=VehicleRead)
def update_vehicle(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    vehicle_in: VehicleBase,
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
    
    vehicle_dict = vehicle.model_dump()
    if vehicle.image_binary:
        vehicle_dict["image_url"] = f"/api/v1/vehicles/{vehicle.id}/image"
    else:
        vehicle_dict["image_url"] = None
    return VehicleRead(**vehicle_dict)

@router.delete("/{id}", response_model=VehicleRead)
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
    
    vehicle_dict = vehicle.model_dump()
    if vehicle.image_binary:
        vehicle_dict["image_url"] = f"/api/v1/vehicles/{vehicle.id}/image"
    else:
        vehicle_dict["image_url"] = None
    
    db.delete(vehicle)
    db.commit()
    return VehicleRead(**vehicle_dict)

@router.post("/{id}/image")
def upload_vehicle_image(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Upload vehicle image.
    """
    vehicle = db.get(Vehicle, id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    image_data = file.file.read()
    vehicle.image_binary = image_data
    
    db.add(vehicle)
    db.commit()
    
    return {"message": "Image uploaded successfully"}

@router.get("/{id}/image")
def get_vehicle_image(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
) -> Any:
    """
    Get vehicle image.
    """
    vehicle = db.get(Vehicle, id)
    if not vehicle or not vehicle.image_binary:
        raise HTTPException(status_code=404, detail="Image not found")
    
    return Response(content=vehicle.image_binary, media_type="image/jpeg")

@router.get("/proxy-image")
def proxy_image(url: str) -> Any:
    """
    Proxy endpoint to fetch images from external URLs (bypasses CORS).
    """
    import requests
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return Response(content=response.content, media_type=response.headers.get('content-type', 'image/jpeg'))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch image: {str(e)}")
