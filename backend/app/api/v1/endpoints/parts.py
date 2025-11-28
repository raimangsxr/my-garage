from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload

from app.api import deps
from app.models.part import Part, PartBase, PartRead
from app.models.user import User

router = APIRouter()

@router.get("/")
def read_parts(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(deps.get_session),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve parts with optimized eager loading.
    """
    statement = select(Part).options(
        selectinload(Part.supplier)
    ).offset(skip).limit(limit)
    parts = session.exec(statement).all()
    
    # Convert to PartRead with supplier
    result = []
    for part in parts:
        part_dict = part.model_dump()
        if part.supplier:
            part_dict["supplier"] = part.supplier.model_dump()
        else:
            part_dict["supplier"] = None
        result.append(PartRead(**part_dict))
    
    return result

@router.post("/", response_model=Part)
def create_part(
    *,
    session: Session = Depends(deps.get_session),
    part_in: PartBase,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new part.
    """
    part = Part.model_validate(part_in)
    session.add(part)
    session.commit()
    session.refresh(part)
    return part

@router.put("/{id}", response_model=Part)
def update_part(
    *,
    session: Session = Depends(deps.get_session),
    id: int,
    part_in: PartBase,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a part.
    """
    part = session.get(Part, id)
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    
    update_data = part_in.model_dump(exclude_unset=True)
    part.sqlmodel_update(update_data)
    session.add(part)
    session.commit()
    session.refresh(part)
    return part

@router.delete("/{id}", response_model=Part)
def delete_part(
    *,
    session: Session = Depends(deps.get_session),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a part.
    """
    part = session.get(Part, id)
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    
    session.delete(part)
    session.commit()
    return part
