"""
Custom exceptions for the application.
These provide more specific error handling than generic Exception.
"""


class AppException(Exception):
    """Base exception for app-specific errors"""
    def __init__(self, message: str, details: dict = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


class InvoiceProcessingError(AppException):
    """Raised when invoice processing fails"""
    pass


class ExternalServiceError(AppException):
    """Raised when external API calls fail (Gemini, Google, etc)"""
    pass


class DatabaseError(AppException):
    """Raised when database operations fail"""
    pass


class AuthenticationError(AppException):
    """Raised when authentication fails"""
    pass


class ValidationError(AppException):
    """Raised when data validation fails"""
    pass
