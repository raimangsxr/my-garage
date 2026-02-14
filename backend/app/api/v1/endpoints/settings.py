from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from app.api import deps
from app.models.settings import Settings, SettingsCreate, SettingsUpdate, SettingsRead
from app.models.user import User

router = APIRouter()

@router.get("", response_model=SettingsRead, include_in_schema=False)
@router.get("/", response_model=SettingsRead)
def read_settings(
    session: Session = Depends(deps.get_session),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user settings.
    """
    if not current_user.settings:
        # Create default settings if they don't exist
        settings = Settings(user_id=current_user.id)
        session.add(settings)
        session.commit()
        session.refresh(settings)
        # Refresh user to load the relationship
        session.refresh(current_user)
        return settings
    return current_user.settings

@router.put("", response_model=SettingsRead, include_in_schema=False)
@router.put("/", response_model=SettingsRead)
def update_settings(
    *,
    session: Session = Depends(deps.get_session),
    settings_in: SettingsUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update current user settings.
    """
    settings = current_user.settings
    if not settings:
        # Should not happen if GET is called first, but handle it anyway
        settings = Settings(user_id=current_user.id)
        session.add(settings)
        session.commit()
        session.refresh(settings)

    settings_data = settings_in.dict(exclude_unset=True)
    for key, value in settings_data.items():
        setattr(settings, key, value)

    session.add(settings)
    session.commit()
    session.refresh(settings)
    return settings
