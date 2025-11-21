from fastapi import APIRouter
from app.api.v1.endpoints import auth, vehicles, users, parts, maintenance

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(vehicles.router, prefix="/vehicles", tags=["vehicles"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(parts.router, prefix="/parts", tags=["parts"])
api_router.include_router(maintenance.router, prefix="/maintenance", tags=["maintenance"])
