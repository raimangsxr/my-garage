"""
Global exception handlers for consistent error responses.
"""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from app.core.exceptions import AppException
import logging

logger = logging.getLogger(__name__)


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """
    Handle custom application exceptions.
    Returns a structured JSON error response.
    """
    request_id = getattr(request.state, "request_id", "unknown")
    
    logger.error(
        f"Application error: {exc.message}",
        extra={
            "request_id": request_id,
            "path": request.url.path,
            "exception_type": type(exc).__name__,
            "details": exc.details
        }
    )
    
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": type(exc).__name__,
            "message": exc.message,
            "details": exc.details,
            "request_id": request_id
        }
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle unexpected exceptions.
    Logs the full exception and returns a generic error message to the client.
    """
    request_id = getattr(request.state, "request_id", "unknown")
    
    logger.exception(
        f"Unexpected error: {str(exc)}",
        extra={
            "request_id": request_id,
            "path": request.url.path,
            "exception_type": type(exc).__name__
        }
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred. Please try again later.",
            "request_id": request_id
        }
    )
