from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.api import deps
from app.models.supplier import Supplier, SupplierBase, SupplierRead
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[SupplierRead])
def read_suppliers(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(deps.get_session),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve suppliers (basic info only, no relationships).
    """
    statement = select(Supplier).offset(skip).limit(limit)
    suppliers = session.exec(statement).all()
    return suppliers

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
