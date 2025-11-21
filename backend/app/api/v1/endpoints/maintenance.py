from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.api import deps
from app.models.maintenance import Maintenance, MaintenanceBase
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[Maintenance])
def read_maintenances(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(deps.get_session),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve maintenance records.
    """
    statement = select(Maintenance).offset(skip).limit(limit)
    maintenances = session.exec(statement).all()
    return maintenances

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
