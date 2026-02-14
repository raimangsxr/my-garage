from typing import List, Any
from datetime import date, datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlmodel import Session, select, func
from sqlalchemy import and_, or_
from pydantic import BaseModel

from app.api import deps
from app.models.notification import Notification, NotificationCreate, NotificationRead, NotificationUpdate
from app.models.user import User
from app.models.vehicle import Vehicle

router = APIRouter()


class NotificationListResponse(BaseModel):
    items: List[NotificationRead]
    total: int
    skip: int
    limit: int

@router.get("", response_model=NotificationListResponse, include_in_schema=False)
@router.get("/", response_model=NotificationListResponse)
def read_notifications(
    response: Response,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
    session: Session = Depends(deps.get_session),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve notifications.
    """
    total = session.exec(
        select(func.count(Notification.id)).where(Notification.user_id == current_user.id)
    ).one()
    response.headers["X-Total-Count"] = str(total)

    statement = select(Notification).where(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).offset(skip).limit(limit)
    notifications = session.exec(statement).all()
    return NotificationListResponse(items=notifications, total=total, skip=skip, limit=limit)

@router.put("/{id}/read", response_model=NotificationRead)
def mark_as_read(
    *,
    session: Session = Depends(deps.get_session),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Mark notification as read.
    """
    notification = session.get(Notification, id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notification.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    notification.is_read = True
    session.add(notification)
    session.commit()
    session.refresh(notification)
    return notification

@router.put("/{id}/unread", response_model=NotificationRead)
def mark_as_unread(
    *,
    session: Session = Depends(deps.get_session),
    id: int,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Mark notification as unread.
    """
    notification = session.get(Notification, id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notification.user_id != current_user.id:
        raise HTTPException(status_code=400, detail="Not enough permissions")
    
    notification.is_read = False
    session.add(notification)
    session.commit()
    session.refresh(notification)
    return notification

@router.post("/check", response_model=dict)
def check_notifications(
    *,
    session: Session = Depends(deps.get_session),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Check for upcoming vehicle events and generate notifications.
    """
    today = date.today()
    warning_days = 30
    warning_limit = today + timedelta(days=warning_days)

    vehicles_stmt = select(Vehicle).where(
        or_(
            and_(Vehicle.next_itv_date.is_not(None), Vehicle.next_itv_date >= today, Vehicle.next_itv_date <= warning_limit),
            and_(Vehicle.next_insurance_date.is_not(None), Vehicle.next_insurance_date >= today, Vehicle.next_insurance_date <= warning_limit),
            and_(Vehicle.next_road_tax_date.is_not(None), Vehicle.next_road_tax_date >= today, Vehicle.next_road_tax_date <= warning_limit),
        )
    )
    vehicles = session.exec(vehicles_stmt).all()

    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    existing_titles = set(
        session.exec(
            select(Notification.title).where(
                Notification.user_id == current_user.id,
                Notification.created_at >= today_start,
            )
        ).all()
    )

    generated_count = 0

    for vehicle in vehicles:
        # Check ITV
        if vehicle.next_itv_date:
            days_until = (vehicle.next_itv_date - today).days
            if 0 <= days_until <= warning_days:
                title = f"ITV Due Soon: {vehicle.brand} {vehicle.model}"
                if title not in existing_titles:
                    session.add(Notification(
                        user_id=current_user.id,
                        title=title,
                        message=f"ITV for {vehicle.license_plate} is due on {vehicle.next_itv_date}",
                        type="ITV",
                    ))
                    existing_titles.add(title)
                    generated_count += 1

        # Check Insurance
        if vehicle.next_insurance_date:
            days_until = (vehicle.next_insurance_date - today).days
            if 0 <= days_until <= warning_days:
                title = f"Insurance Renewal: {vehicle.brand} {vehicle.model}"
                if title not in existing_titles:
                    session.add(Notification(
                        user_id=current_user.id,
                        title=title,
                        message=f"Insurance for {vehicle.license_plate} expires on {vehicle.next_insurance_date}",
                        type="INSURANCE",
                    ))
                    existing_titles.add(title)
                    generated_count += 1

        # Check Road Tax
        if vehicle.next_road_tax_date:
            days_until = (vehicle.next_road_tax_date - today).days
            if 0 <= days_until <= warning_days:
                title = f"Road Tax Due: {vehicle.brand} {vehicle.model}"
                if title not in existing_titles:
                    session.add(Notification(
                        user_id=current_user.id,
                        title=title,
                        message=f"Road tax for {vehicle.license_plate} is due on {vehicle.next_road_tax_date}",
                        type="TAX",
                    ))
                    existing_titles.add(title)
                    generated_count += 1

    if generated_count:
        session.commit()

    return {"message": f"Check complete. Generated {generated_count} notifications."}
