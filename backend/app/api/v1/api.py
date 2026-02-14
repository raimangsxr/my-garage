from fastapi import APIRouter
from app.api.v1.endpoints import auth, vehicles, users, parts, maintenance, invoices, suppliers, notifications, dashboard, track_records, organizers, tracks, settings, circuits

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(organizers.router, prefix="/organizers", tags=["organizers"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(vehicles.router, prefix="/vehicles", tags=["vehicles"])
api_router.include_router(track_records.router, prefix="/vehicles", tags=["track-records"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(parts.router, prefix="/parts", tags=["parts"])
api_router.include_router(maintenance.router, prefix="/maintenance", tags=["maintenance"])
api_router.include_router(invoices.router, prefix="/invoices", tags=["invoices"])
api_router.include_router(suppliers.router, prefix="/suppliers", tags=["suppliers"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(tracks.router, prefix="/tracks", tags=["tracks"])
api_router.include_router(circuits.router, prefix="/circuits", tags=["circuits"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
