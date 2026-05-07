from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.api import deps
from app.models.track_record import TrackRecord
from app.models.user import User

router = APIRouter()

@router.get("", response_model=list[str], include_in_schema=False)
@router.get("/", response_model=list[str])
def get_organizers(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    """Return a list of distinct organizer names from track records."""
    statement = select(TrackRecord.organizer).where(TrackRecord.organizer != None)
    results = db.exec(statement).all()
    # results is list of organizer strings (may contain duplicates)
    organizers = list({org for org in results if org})
    return organizers
