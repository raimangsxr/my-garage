import sys
import os
from sqlmodel import Session, select
from app.database import engine
from app.models.user import User
from app.models.notification import Notification

def seed():
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == "admin@example.com")).first()
        if not user:
            print("User admin@example.com not found")
            return

        notifications = [
            Notification(user_id=user.id, title="ITV Due Soon", message="Your ITV is expiring in 10 days.", type="ITV", is_read=False),
            Notification(user_id=user.id, title="Insurance Renewal", message="Insurance for 1234ABC expires tomorrow.", type="INSURANCE", is_read=True),
            Notification(user_id=user.id, title="Road Tax Payment", message="Road tax payment received.", type="TAX", is_read=True),
            Notification(user_id=user.id, title="Welcome", message="Welcome to My Garage!", type="GENERAL", is_read=False),
            Notification(user_id=user.id, title="Maintenance Reminder", message="Oil change due.", type="GENERAL", is_read=False),
        ]

        for n in notifications:
            session.add(n)
        
        session.commit()
        print("Notifications seeded successfully")

if __name__ == "__main__":
    seed()
