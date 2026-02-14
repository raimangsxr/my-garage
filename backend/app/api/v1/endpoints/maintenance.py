from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlmodel import Session, select, func

from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from sqlalchemy import or_, asc, desc
from app.api import deps
from app.models.maintenance import Maintenance, MaintenanceBase
from app.models.part import Part
from app.models.supplier import Supplier
from app.models.vehicle import Vehicle
from app.models.user import User

router = APIRouter()


class MaintenanceListResponse(BaseModel):
    items: List[dict]
    total: int
    skip: int
    limit: int

@router.get("", response_model=MaintenanceListResponse, include_in_schema=False)
@router.get("/", response_model=MaintenanceListResponse)
def read_maintenances(
    response: Response,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
    q: str | None = Query(default=None, min_length=1, max_length=120),
    sort_by: str = Query(default="date"),
    sort_dir: str = Query(default="desc", pattern="^(asc|desc)$"),
    session: Session = Depends(deps.get_session),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve maintenance records with optimized eager loading.
    """
    filters = []
    if q:
        q_like = f"%{q.strip()}%"
        filters.append(
            or_(
                Maintenance.description.ilike(q_like),
                Vehicle.brand.ilike(q_like),
                Vehicle.model.ilike(q_like),
                Vehicle.license_plate.ilike(q_like),
                Supplier.name.ilike(q_like),
            )
        )

    order_field_map = {
        "date": Maintenance.date,
        "description": Maintenance.description,
        "cost": Maintenance.cost,
        "mileage": Maintenance.mileage,
        "vehicle": Vehicle.brand,
        "supplier": Supplier.name,
        "id": Maintenance.id,
    }
    order_field = order_field_map.get(sort_by, Maintenance.date)
    order_expr = asc(order_field) if sort_dir == "asc" else desc(order_field)

    total_stmt = (
        select(func.count(Maintenance.id))
        .select_from(Maintenance)
        .outerjoin(Vehicle, Maintenance.vehicle_id == Vehicle.id)
        .outerjoin(Supplier, Maintenance.supplier_id == Supplier.id)
    )
    if filters:
        total_stmt = total_stmt.where(*filters)
    total = session.exec(total_stmt).one()
    response.headers["X-Total-Count"] = str(total)

    statement = (
        select(Maintenance)
        .outerjoin(Vehicle, Maintenance.vehicle_id == Vehicle.id)
        .outerjoin(Supplier, Maintenance.supplier_id == Supplier.id)
        .options(
        selectinload(Maintenance.vehicle),
        selectinload(Maintenance.parts).selectinload(Part.supplier),
        selectinload(Maintenance.supplier)
        )
    )
    if filters:
        statement = statement.where(*filters)
    statement = statement.order_by(order_expr).offset(skip).limit(limit)
    maintenances = session.exec(statement).all()
    
    # Manually serialize to include relationships
    result = []
    for m in maintenances:
        maintenance_dict = m.model_dump()
        maintenance_dict['vehicle'] = m.vehicle.model_dump(exclude={'image_binary'}) if m.vehicle else None
        maintenance_dict['supplier'] = m.supplier.model_dump() if m.supplier else None
        maintenance_dict['parts'] = [p.model_dump() for p in m.parts]
        result.append(maintenance_dict)
    
    return MaintenanceListResponse(items=result, total=total, skip=skip, limit=limit)

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

@router.post("", response_model=Maintenance, include_in_schema=False)
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
