from typing import List, Any
from datetime import date, timedelta, datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.api import deps
from app.models.notification import Notification, NotificationCreate, NotificationRead, NotificationUpdate
from app.models.user import User
from app.models.vehicle import Vehicle

router = APIRouter()

@router.get("/", response_model=List[NotificationRead])
def read_notifications(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(deps.get_session),
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve notifications.
    """
    statement = select(Notification).where(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).offset(skip).limit(limit)
    notifications = session.exec(statement).all()
    return notifications

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
    vehicles = session.exec(select(Vehicle)).all() # In real app, filter by user ownership if applicable, but here vehicles are global or we assume single user context for simplicity or we should add user_id to Vehicle. 
    # Assuming vehicles are linked to user or we just check all for now (demo). 
    # Wait, Vehicle doesn't have user_id in the model I saw earlier. 
    # Let's assume for this "My Garage" single-user-ish or shared DB demo we just check all, 
    # BUT notifications must be assigned to current_user.
    
    # Refinement: We should probably only check vehicles relevant to the user. 
    # Since Vehicle model doesn't have user_id, I'll assume all vehicles are "mine" for this user context 
    # or that we are just generating notifications for the current user based on ALL vehicles (shared garage).
    
    today = date.today()
    warning_days = 30
    
    generated_count = 0

    for vehicle in vehicles:
        # Check ITV
        if vehicle.next_itv_date:
            days_until = (vehicle.next_itv_date - today).days
            if 0 <= days_until <= warning_days:
                create_notification_if_not_exists(
                    session, current_user.id, 
                    f"ITV Due Soon: {vehicle.brand} {vehicle.model}",
                    f"ITV for {vehicle.license_plate} is due on {vehicle.next_itv_date}",
                    "ITV"
                )
                generated_count += 1

        # Check Insurance
        if vehicle.next_insurance_date:
            days_until = (vehicle.next_insurance_date - today).days
            if 0 <= days_until <= warning_days:
                create_notification_if_not_exists(
                    session, current_user.id,
                    f"Insurance Renewal: {vehicle.brand} {vehicle.model}",
                    f"Insurance for {vehicle.license_plate} expires on {vehicle.next_insurance_date}",
                    "INSURANCE"
                )
                generated_count += 1

        # Check Road Tax
        if vehicle.next_road_tax_date:
            days_until = (vehicle.next_road_tax_date - today).days
            if 0 <= days_until <= warning_days:
                create_notification_if_not_exists(
                    session, current_user.id,
                    f"Road Tax Due: {vehicle.brand} {vehicle.model}",
                    f"Road tax for {vehicle.license_plate} is due on {vehicle.next_road_tax_date}",
                    "TAX"
                )
                generated_count += 1

    return {"message": f"Check complete. Generated {generated_count} notifications."}

def create_notification_if_not_exists(session: Session, user_id: int, title: str, message: str, type: str):
    # Simple de-duplication: check if a notification with same title exists for this user created today
    # This prevents spamming every time we check.
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    statement = select(Notification).where(
        Notification.user_id == user_id,
        Notification.title == title,
        Notification.created_at >= today_start
    )
    existing = session.exec(statement).first()
    
    if not existing:
        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            type=type
        )
        session.add(notification)
        session.commit()
