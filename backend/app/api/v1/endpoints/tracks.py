from datetime import date
from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlmodel import Session

from app.api import deps
from app.models.track import Track, TrackCreate, TrackRead
from app.models.track_record import TrackRecordRead
from app.models.user import User
from app.services.tracks_service import TracksService
from pydantic import BaseModel

router = APIRouter()
tracks_service = TracksService()

# Response Models
class TrackSummary(BaseModel):
    id: int
    name: str
    location: str | None
    length_meters: int | None
    total_sessions: int
    best_lap_time: str | None
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

class TrackDetail(BaseModel):
    id: int
    name: str
    location: str | None
    length_meters: int | None
    description: str | None
    image_url: str | None
    total_sessions: int
    best_lap_time: str | None
    vehicle_groups: List[VehicleRecordGroup]

class TrackListResponse(BaseModel):
    items: List[TrackSummary]
    total: int
    skip: int
    limit: int


@router.get("", response_model=TrackListResponse)
def get_tracks(
    *,
    response: Response,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
    q: str | None = Query(default=None, min_length=1, max_length=120),
    only_active: bool = Query(default=True),
    sort_by: str = Query(default="name"),
    sort_dir: str = Query(default="asc", pattern="^(asc|desc)$"),
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all tracks with aggregated statistics.
    """
    items, total = tracks_service.list_with_stats(
        session=db,
        skip=skip,
        limit=limit,
        q=q,
        only_active=only_active,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )
    response.headers["X-Total-Count"] = str(total)

    summaries = [TrackSummary(**item) for item in items]
    return TrackListResponse(items=summaries, total=total, skip=skip, limit=limit)

@router.get("/{track_id}", response_model=TrackDetail)
def get_track_detail(
    *,
    db: Session = Depends(deps.get_db),
    track_id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get detailed information for a specific track.
    """
    try:
        track_detail = tracks_service.get_detail(session=db, track_id=track_id)
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))

    vehicle_groups = []
    for group in track_detail["vehicle_groups"]:
        group_data = {
            **group,
            "records": [TrackRecordRead(**record) for record in group["records"]],
        }
        vehicle_groups.append(VehicleRecordGroup(**group_data))

    return TrackDetail(
        id=track_detail["id"],
        name=track_detail["name"],
        location=track_detail["location"],
        length_meters=track_detail["length_meters"],
        description=track_detail["description"],
        image_url=track_detail["image_url"],
        total_sessions=track_detail["total_sessions"],
        best_lap_time=track_detail["best_lap_time"],
        vehicle_groups=vehicle_groups,
    )

@router.post("", response_model=TrackRead)
def create_track(
    *,
    db: Session = Depends(deps.get_db),
    track_in: TrackCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new track.
    """
    track = Track.model_validate(track_in)
    db.add(track)
    db.commit()
    db.refresh(track)
    return track
