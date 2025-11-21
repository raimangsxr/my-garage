from fastapi import APIRouter
from app.api.v1.endpoints import auth, vehicles, users, parts, maintenance, invoices, suppliers, notifications

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(vehicles.router, prefix="/vehicles", tags=["vehicles"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(parts.router, prefix="/parts", tags=["parts"])
api_router.include_router(maintenance.router, prefix="/maintenance", tags=["maintenance"])
api_router.include_router(invoices.router, prefix="/invoices", tags=["invoices"])
api_router.include_router(suppliers.router, prefix="/suppliers", tags=["suppliers"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
