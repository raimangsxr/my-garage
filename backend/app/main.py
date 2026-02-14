from fastapi import FastAPI
from app.api.v1.api import api_router
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.middleware.request_id import RequestIDMiddleware
from app.middleware import exception_handler
from app.core import exceptions

app = FastAPI(title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json")

# Add middleware
app.add_middleware(RequestIDMiddleware)

# Add exception handlers
app.add_exception_handler(exceptions.AppException, exception_handler.app_exception_handler)
app.add_exception_handler(Exception, exception_handler.generic_exception_handler)

cors_origins = list(settings.BACKEND_CORS_ORIGINS)
if not cors_origins and settings.ENVIRONMENT.lower() == "development":
    cors_origins = [
        "http://localhost:4200",
        "http://127.0.0.1:4200",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

cors_origin_regex = settings.BACKEND_CORS_ORIGIN_REGEX or None
if settings.ENVIRONMENT.lower() == "development" and not cors_origin_regex:
    cors_origin_regex = (
        r"^https?://("
        r"localhost|127\.0\.0\.1|0\.0\.0\.0|"
        r"192\.168\.\d{1,3}\.\d{1,3}|"
        r"10\.\d{1,3}\.\d{1,3}\.\d{1,3}"
        r")(:\d+)?$"
    )

if cors_origins or cors_origin_regex:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_origin_regex=cors_origin_regex,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

from fastapi.staticfiles import StaticFiles
import os

app.include_router(api_router, prefix="/api/v1")

# Mount uploads directory
uploads_dir = os.path.join(os.getcwd(), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/health")
def health_check():
    """
    Health check endpoint for monitoring.
    Returns the service status and version.
    """
    return {
        "status": "healthy",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT
    }
