from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlmodel import Session, select, func
from pydantic import BaseModel
from sqlalchemy import or_, asc, desc

from app.api import deps
from app.models.supplier import Supplier, SupplierBase, SupplierRead
from app.models.user import User

router = APIRouter()


class SupplierListResponse(BaseModel):
    items: List[SupplierRead]
    total: int
    skip: int
    limit: int

@router.get("", response_model=SupplierListResponse, include_in_schema=False)
@router.get("/", response_model=SupplierListResponse)
def read_suppliers(
    response: Response,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
    q: str | None = Query(default=None, min_length=1, max_length=120),
    sort_by: str = Query(default="name"),
    sort_dir: str = Query(default="asc", pattern="^(asc|desc)$"),
    session: Session = Depends(deps.get_session),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve suppliers (basic info only, no relationships).
    """
    filters = []
    if q:
        q_like = f"%{q.strip()}%"
        filters.append(
            or_(
                Supplier.name.ilike(q_like),
                Supplier.email.ilike(q_like),
                Supplier.phone.ilike(q_like),
                Supplier.address.ilike(q_like),
                Supplier.tax_id.ilike(q_like),
            )
        )

    order_field_map = {
        "name": Supplier.name,
        "email": Supplier.email,
        "phone": Supplier.phone,
        "address": Supplier.address,
        "id": Supplier.id,
    }
    order_field = order_field_map.get(sort_by, Supplier.name)
    order_expr = asc(order_field) if sort_dir == "asc" else desc(order_field)

    total_stmt = select(func.count(Supplier.id))
    if filters:
        total_stmt = total_stmt.where(*filters)
    total = session.exec(total_stmt).one()
    response.headers["X-Total-Count"] = str(total)

    statement = select(Supplier)
    if filters:
        statement = statement.where(*filters)
    statement = statement.order_by(order_expr).offset(skip).limit(limit)
    suppliers = session.exec(statement).all()
    return SupplierListResponse(items=suppliers, total=total, skip=skip, limit=limit)

@router.post("", response_model=Supplier, include_in_schema=False)
@router.post("/", response_model=Supplier)
def create_supplier(
    *,
    session: Session = Depends(deps.get_session),
    supplier_in: SupplierBase,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new supplier.
    """
    supplier = Supplier.model_validate(supplier_in)
    session.add(supplier)
    session.commit()
    session.refresh(supplier)
    return supplier

@router.put("/{id}", response_model=Supplier)
def update_supplier(
    *,
    session: Session = Depends(deps.get_session),
    id: int,
    supplier_in: SupplierBase,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a supplier.
    """
    supplier = session.get(Supplier, id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    update_data = supplier_in.model_dump(exclude_unset=True)
    supplier.sqlmodel_update(update_data)
    session.add(supplier)
    session.commit()
    session.refresh(supplier)
    return supplier

@router.delete("/{id}", response_model=Supplier)
def delete_supplier(
    *,
    session: Session = Depends(deps.get_session),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a supplier.
    """
    supplier = session.get(Supplier, id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    
    session.delete(supplier)
    session.commit()
    return supplier
