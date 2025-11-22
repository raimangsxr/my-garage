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

@router.get("/{id}/details")
def get_vehicle_details(
    *,
    db: Session = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get complete vehicle details with all related data.
    """
    from app.models.maintenance import Maintenance
    from app.models.part import Part
    from app.models.invoice import Invoice
    from app.models.supplier import Supplier
    from app.models.vehicle_specs import VehicleSpecs
    from sqlalchemy.orm import selectinload
    
    # Get vehicle with all relationships loaded
    statement = select(Vehicle).where(Vehicle.id == id).options(
        selectinload(Vehicle.maintenances),
        selectinload(Vehicle.specs)
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
    
    # Get maintenance records with related data
    maintenances_data = []
    all_parts = []
    all_invoices = []
    
    for maintenance in vehicle.maintenances:
        maint_dict = maintenance.model_dump()
        
        # Get parts for this maintenance
        parts_stmt = select(Part).where(Part.maintenance_id == maintenance.id).options(
            selectinload(Part.supplier),
            selectinload(Part.invoice)
        )
        parts = db.exec(parts_stmt).all()
        maint_parts = []
        for p in parts:
            p_dict = p.model_dump()
            if p.supplier:
                p_dict["supplier"] = p.supplier.model_dump()
            if p.invoice:
                p_dict["invoice"] = p.invoice.model_dump()
            maint_parts.append(p_dict)
            all_parts.append(p_dict)
        
        maint_dict["parts"] = maint_parts
        
        # Get invoices for this maintenance
        invoices_stmt = select(Invoice).where(Invoice.maintenance_id == maintenance.id)
        invoices = db.exec(invoices_stmt).all()
        maint_invoices = []
        for i in invoices:
            i_dict = i.model_dump()
            maint_invoices.append(i_dict)
            all_invoices.append(i_dict)
            
        maint_dict["invoices"] = maint_invoices
        
        # Get supplier if exists (labor supplier)
        if maintenance.supplier_id:
            supplier = db.get(Supplier, maintenance.supplier_id)
            maint_dict["supplier"] = supplier.model_dump() if supplier else None
        else:
            maint_dict["supplier"] = None
            
        maintenances_data.append(maint_dict)
    
    return {
        "vehicle": VehicleRead(**vehicle_dict),
        "specs": specs_dict,
        "maintenances": maintenances_data,
        "parts": all_parts,
        "invoices": all_invoices
    }
