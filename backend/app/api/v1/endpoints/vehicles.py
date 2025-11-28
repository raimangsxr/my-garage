from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import Response
from sqlmodel import Session, select
from app.api import deps
from app.models.vehicle import Vehicle, VehicleRead, VehicleBase, VehicleCreate, VehicleUpdate
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
    from sqlalchemy.orm import selectinload
    
    statement = select(Vehicle).options(selectinload(Vehicle.specs)).offset(skip).limit(limit)
    vehicles = db.exec(statement).all()
    
    # Convert to VehicleRead with image_url and specs
    result = []
    for vehicle in vehicles:
        vehicle_dict = vehicle.model_dump()
        if vehicle.image_binary:
            vehicle_dict["image_url"] = f"/api/v1/vehicles/{vehicle.id}/image"
        else:
            vehicle_dict["image_url"] = None
            
        if vehicle.specs:
            vehicle_dict["specs"] = vehicle.specs.model_dump()
            
        result.append(VehicleRead(**vehicle_dict))
    
    return result

@router.post("/", response_model=VehicleRead)
def create_vehicle(
    *,
    db: Session = Depends(deps.get_db),
    vehicle_in: VehicleCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new vehicle.
    """
    from app.models.vehicle_specs import VehicleSpecs
    
    # Extract specs data
    specs_data = None
    if vehicle_in.specs:
        specs_data = vehicle_in.specs
        del vehicle_in.specs
        
    vehicle = Vehicle.model_validate(vehicle_in)
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    
    # Create specs if provided
    if specs_data:
        vehicle_specs = VehicleSpecs(vehicle_id=vehicle.id, **specs_data.model_dump(exclude_unset=True))
        db.add(vehicle_specs)
        db.commit()
    
    vehicle_read = VehicleRead.model_validate(vehicle)
    vehicle_read.image_url = None
    return vehicle_read

@router.put("/{id}", response_model=VehicleRead)
def update_vehicle(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    vehicle_in: VehicleUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a vehicle.
    """
    from app.models.vehicle_specs import VehicleSpecs
    
    vehicle = db.get(Vehicle, id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # Extract specs data
    specs_data = None
    if vehicle_in.specs:
        specs_data = vehicle_in.specs
        del vehicle_in.specs
    
    vehicle_data = vehicle_in.model_dump(exclude_unset=True)
    for key, value in vehicle_data.items():
        setattr(vehicle, key, value)
        
    db.add(vehicle)
    
    # Update or create specs
    if specs_data:
        if vehicle.specs:
            specs_update_data = specs_data.model_dump(exclude_unset=True)
            for key, value in specs_update_data.items():
                setattr(vehicle.specs, key, value)
            db.add(vehicle.specs)
        else:
            vehicle_specs = VehicleSpecs(vehicle_id=vehicle.id, **specs_data.model_dump(exclude_unset=True))
            db.add(vehicle_specs)
            
    db.commit()
    db.refresh(vehicle)
    
    vehicle_read = VehicleRead.model_validate(vehicle)
    if vehicle.image_binary:
        vehicle_read.image_url = f"/api/v1/vehicles/{vehicle.id}/image"
    else:
        vehicle_read.image_url = None
    return vehicle_read

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

@router.get("/{id}/details")
def get_vehicle_details(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get complete vehicle details with all related data in a single optimized query.
    """
    from app.models.maintenance import Maintenance
    from app.models.part import Part
    from app.models.invoice import Invoice
    from app.models.supplier import Supplier
    from app.models.vehicle_specs import VehicleSpecs
    from sqlalchemy.orm import selectinload
    
    # Single optimized query with comprehensive eager loading
    statement = select(Vehicle).where(Vehicle.id == id).options(
        selectinload(Vehicle.specs),
        selectinload(Vehicle.maintenances).options(
            selectinload(Maintenance.supplier),
            selectinload(Maintenance.parts).selectinload(Part.supplier)
        ),
        selectinload(Vehicle.invoices).options(
            selectinload(Invoice.supplier),
            selectinload(Invoice.parts).selectinload(Part.supplier)
        ),
        selectinload(Vehicle.track_records)
    )
    vehicle = db.exec(statement).first()
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # Build response with vehicle data
    vehicle_dict = vehicle.model_dump()
    if vehicle.image_binary:
        vehicle_dict["image_url"] = f"/api/v1/vehicles/{vehicle.id}/image"
    else:
        vehicle_dict["image_url"] = None
    
    # Get specs if available
    specs_dict = None
    if vehicle.specs:
        specs_dict = vehicle.specs.model_dump()
    
    # Serialize maintenances with parts
    maintenances_data = []
    all_parts = []
    
    for maintenance in vehicle.maintenances:
        maint_dict = maintenance.model_dump()
        
        # Serialize parts for this maintenance
        maint_parts = []
        for p in maintenance.parts:
            p_dict = p.model_dump()
            if p.supplier:
                p_dict["supplier"] = p.supplier.model_dump()
            else:
                p_dict["supplier"] = None
            maint_parts.append(p_dict)
            all_parts.append(p_dict)
        
        maint_dict["parts"] = maint_parts
        
        # Get invoices for this maintenance (derived from parts)
        maint_invoices_map = {}
        for p in maintenance.parts:
            if p.invoice:
                maint_invoices_map[p.invoice.id] = p.invoice.model_dump()
        
        maint_dict["invoices"] = list(maint_invoices_map.values())
        
        # Get supplier if exists (labor supplier)
        if maintenance.supplier:
            maint_dict["supplier"] = maintenance.supplier.model_dump()
        else:
            maint_dict["supplier"] = None
            
        maintenances_data.append(maint_dict)
    
    # Serialize all vehicle invoices
    all_invoices = []
    for invoice in vehicle.invoices:
        inv_dict = invoice.model_dump()
        if invoice.supplier:
            inv_dict["supplier"] = invoice.supplier.model_dump()
        else:
            inv_dict["supplier"] = None
        all_invoices.append(inv_dict)
    
    # Get track records
    track_records_data = []
    if vehicle.track_records:
        track_records_data = [record.model_dump() for record in vehicle.track_records]
    
    return {
        "vehicle": VehicleRead(**vehicle_dict),
        "specs": specs_dict,
        "maintenances": maintenances_data,
        "parts": all_parts,
        "invoices": all_invoices,
        "track_records": track_records_data
    }

@router.put("/{id}/specs/torque")
def update_torque_specs(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    specs: List[dict],
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update vehicle torque specifications.
    """
    from app.models.vehicle_specs import VehicleSpecs
    
    vehicle = db.get(Vehicle, id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # Find or create specs
    if not vehicle.specs:
        vehicle_specs = VehicleSpecs(vehicle_id=id, torque_specs=specs)
        db.add(vehicle_specs)
    else:
        vehicle.specs.torque_specs = specs
        db.add(vehicle.specs)
        
    db.commit()
    db.refresh(vehicle)
    
    return {"message": "Torque specs updated successfully", "specs": specs}
