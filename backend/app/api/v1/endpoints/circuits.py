from datetime import date
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlmodel import Session

from app.api import deps
from app.models.track_record import TrackRecordRead
from app.models.user import User
from app.services.circuits_service import CircuitsService
from pydantic import BaseModel

router = APIRouter()
circuits_service = CircuitsService()

# Response Models
class CircuitSummary(BaseModel):
    circuit_name: str
    total_sessions: int
    best_lap_time: str
    best_lap_vehicle_name: str | None
    vehicle_count: int
    last_session_date: date | None

class VehicleRecordGroup(BaseModel):
    vehicle_id: int
    vehicle_name: str
    vehicle_brand: str | None
    vehicle_model: str | None
    records: List[TrackRecordRead]
    best_lap_time: str

class CircuitDetail(BaseModel):
    circuit_name: str
    total_sessions: int
    best_lap_time: str
    vehicle_groups: List[VehicleRecordGroup]

class CircuitListResponse(BaseModel):
    items: List[CircuitSummary]
    total: int
    skip: int
    limit: int


@router.get("", response_model=CircuitListResponse)
def get_circuits(
    *,
    response: Response,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
    q: str | None = Query(default=None, min_length=1, max_length=120),
    sort_by: str = Query(default="circuit_name"),
    sort_dir: str = Query(default="asc", pattern="^(asc|desc)$"),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all unique circuits with aggregated statistics.
    """
    items, total = circuits_service.list_with_stats(
        session=db,
        skip=skip,
        limit=limit,
        q=q,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )
    response.headers["X-Total-Count"] = str(total)
    paged_items = [CircuitSummary(**item) for item in items]

    return CircuitListResponse(items=paged_items, total=total, skip=skip, limit=limit)

@router.get("/{circuit_name}", response_model=CircuitDetail)
def get_circuit_detail(
    *,
    db: Session = Depends(deps.get_db),
    circuit_name: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get detailed information for a specific circuit with all records grouped by vehicle.
    """
    try:
        detail = circuits_service.get_detail(session=db, circuit_name=circuit_name)
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))

    vehicle_groups = []
    for group in detail["vehicle_groups"]:
        group_data = {
            **group,
            "records": [TrackRecordRead(**record) for record in group["records"]],
        }
        vehicle_groups.append(VehicleRecordGroup(**group_data))

    return CircuitDetail(
        circuit_name=detail["circuit_name"],
        total_sessions=detail["total_sessions"],
        best_lap_time=detail["best_lap_time"],
        vehicle_groups=vehicle_groups,
    )
