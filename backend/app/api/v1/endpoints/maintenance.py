from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from sqlalchemy.orm import selectinload
from app.api import deps
from app.models.maintenance import Maintenance, MaintenanceBase
from app.models.part import Part
from app.models.user import User

router = APIRouter()

@router.get("/")
def read_maintenances(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(deps.get_session),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve maintenance records.
    """
    statement = select(Maintenance).options(
        selectinload(Maintenance.vehicle),
        selectinload(Maintenance.parts).options(selectinload(Part.supplier)),
        selectinload(Maintenance.supplier)
    ).offset(skip).limit(limit).order_by(Maintenance.date.desc())
    maintenances = session.exec(statement).all()
    
    # Manually serialize to include relationships
    result = []
    for m in maintenances:
        maintenance_dict = m.model_dump()
        maintenance_dict['vehicle'] = m.vehicle.model_dump(exclude={'image_binary'}) if m.vehicle else None
        maintenance_dict['supplier'] = m.supplier.model_dump() if m.supplier else None
        maintenance_dict['parts'] = [p.model_dump() for p in m.parts]
        result.append(maintenance_dict)
    
    return result

@router.get("/{id}")
def read_maintenance(
    *,
    session: Session = Depends(deps.get_session),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get maintenance record by ID.
    """
    statement = select(Maintenance).where(Maintenance.id == id).options(
        selectinload(Maintenance.vehicle),
        selectinload(Maintenance.parts).options(selectinload(Part.supplier)),
        selectinload(Maintenance.supplier)
    )
    maintenance = session.exec(statement).first()
    if not maintenance:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    
    # Manually serialize to include relationships
    result = maintenance.model_dump()
    result['vehicle'] = maintenance.vehicle.model_dump(exclude={'image_binary'}) if maintenance.vehicle else None
    result['supplier'] = maintenance.supplier.model_dump() if maintenance.supplier else None
    result['parts'] = [p.model_dump() for p in maintenance.parts]
    
    return result

@router.post("/", response_model=Maintenance)
def create_maintenance(
    *,
    session: Session = Depends(deps.get_session),
    maintenance_in: MaintenanceBase,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new maintenance record.
    """
    maintenance = Maintenance.model_validate(maintenance_in)
    session.add(maintenance)
    session.commit()
    session.refresh(maintenance)
    return maintenance

@router.put("/{id}", response_model=Maintenance)
def update_maintenance(
    *,
    session: Session = Depends(deps.get_session),
    id: int,
    maintenance_in: MaintenanceBase,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a maintenance record.
    """
    maintenance = session.get(Maintenance, id)
    if not maintenance:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    
    update_data = maintenance_in.model_dump(exclude_unset=True)
    maintenance.sqlmodel_update(update_data)
    session.add(maintenance)
    session.commit()
    session.refresh(maintenance)
    return maintenance

@router.delete("/{id}", response_model=Maintenance)
def delete_maintenance(
    *,
    session: Session = Depends(deps.get_session),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a maintenance record.
    """
    maintenance = session.get(Maintenance, id)
    if not maintenance:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    
    session.delete(maintenance)
    session.commit()
    return maintenance
