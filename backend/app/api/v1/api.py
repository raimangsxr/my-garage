from fastapi import APIRouter
from app.api.v1.endpoints import auth, vehicles, users

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(vehicles.router, prefix="/vehicles", tags=["vehicles"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
