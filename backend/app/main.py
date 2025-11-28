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

if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
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
