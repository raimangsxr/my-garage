from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlmodel import Session, select, func
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from sqlalchemy import or_, asc, desc

from app.api import deps
from app.models.part import Part, PartBase, PartRead
from app.models.user import User

router = APIRouter()


class PartListResponse(BaseModel):
    items: List[PartRead]
    total: int
    skip: int
    limit: int

@router.get("", response_model=PartListResponse, include_in_schema=False)
@router.get("/", response_model=PartListResponse)
def read_parts(
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
    Retrieve parts with optimized eager loading.
    """
    filters = []
    if q:
        q_like = f"%{q.strip()}%"
        filters.append(
            or_(
                Part.name.ilike(q_like),
                Part.reference.ilike(q_like),
            )
        )

    order_field_map = {
        "name": Part.name,
        "reference": Part.reference,
        "price": Part.price,
        "quantity": Part.quantity,
        "id": Part.id,
    }
    order_field = order_field_map.get(sort_by, Part.name)
    order_expr = asc(order_field) if sort_dir == "asc" else desc(order_field)

    total_stmt = select(func.count(Part.id))
    if filters:
        total_stmt = total_stmt.where(*filters)
    total = session.exec(total_stmt).one()
    response.headers["X-Total-Count"] = str(total)

    statement = select(Part).options(
        selectinload(Part.supplier)
    )
    if filters:
        statement = statement.where(*filters)
    statement = statement.order_by(order_expr).offset(skip).limit(limit)
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
    
    return PartListResponse(items=result, total=total, skip=skip, limit=limit)

@router.post("", response_model=Part, include_in_schema=False)
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
