from sqlmodel import Session, select
from app.database import engine
from app.models import User
from app.core.security import get_password_hash

def create_initial_user():
    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == "admin@example.com")).first()
        if not user:
            user = User(
                email="admin@example.com",
                hashed_password=get_password_hash("admin"),
                full_name="Admin User",
                is_superuser=True,
            )
            session.add(user)
            session.commit()
            print("Admin user created: admin@example.com / admin")
        else:
            print("Admin user already exists")

if __name__ == "__main__":
    create_initial_user()
