import logging
import logging.config
import json
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        extra="ignore",
    )

    PROJECT_NAME: str = "My Garage"
    API_V1_STR: str = "/api/v1"
    
    # BACKEND_CORS_ORIGINS supports:
    # - JSON array: '["http://localhost:4200","http://127.0.0.1:4200"]'
    # - comma-separated: 'http://localhost:4200,http://127.0.0.1:4200'
    BACKEND_CORS_ORIGINS: Union[List[str], str] = []
    # Optional regex to support dynamic origins (useful in dev with changing host/IP).
    BACKEND_CORS_ORIGIN_REGEX: str = ""

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str], None]) -> List[str]:
        if v is None:
            return []

        if isinstance(v, str):
            raw = v.strip()
            if not raw:
                return []
            if raw.startswith("["):
                try:
                    parsed = json.loads(raw)
                except json.JSONDecodeError as exc:
                    raise ValueError("Invalid JSON format for BACKEND_CORS_ORIGINS") from exc
                if not isinstance(parsed, list):
                    raise ValueError("BACKEND_CORS_ORIGINS JSON value must be a list")
                return [str(origin).strip().rstrip("/") for origin in parsed if str(origin).strip()]
            return [origin.strip().rstrip("/") for origin in raw.split(",") if origin.strip()]

        if isinstance(v, list):
            return [str(origin).strip().rstrip("/") for origin in v if str(origin).strip()]

        raise ValueError(v)

    DATABASE_URL: str # override in .env
    SECRET_KEY: str = "CHANGE_THIS_TO_A_SECURE_SECRET_KEY_IN_PRODUCTION"  # override in .env
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    GOOGLE_CLIENT_ID: str = "" # override in .env
    GEMINI_API_KEY: str = "" # override in .env
    
    # Logging and Environment
    LOG_LEVEL: str = "INFO"  # Can be DEBUG, INFO, WARNING, ERROR
    ENVIRONMENT: str = "development"  # development, production, staging

settings = Settings()

if settings.ENVIRONMENT.lower() in {"production", "staging"} and settings.SECRET_KEY == "CHANGE_THIS_TO_A_SECURE_SECRET_KEY_IN_PRODUCTION":
    raise ValueError("SECRET_KEY must be configured for production/staging environments.")

# Logging Configuration - Now configurable via environment
LOG_LEVEL = settings.LOG_LEVEL if hasattr(settings, 'LOG_LEVEL') else "INFO"

def setup_logging():
    LOGGING_CONFIG = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "default",
                "level": LOG_LEVEL,
            },
        },
        "root": {
            "handlers": ["console"],
            "level": LOG_LEVEL,
        },
        "loggers": {
            "uvicorn": {
                "handlers": ["console"],
                "level": "INFO",
                "propagate": False
            },
            "uvicorn.error": {
                "level": "INFO",
            },
            "uvicorn.access": {
                "handlers": ["console"],
                "level": "INFO",
                "propagate": False,
            },
            "fastapi": {
                "handlers": ["console"],
                "level": LOG_LEVEL,
                "propagate": False,
            },
            "sqlalchemy.engine": {
                "handlers": ["console"],
                "level": LOG_LEVEL,
                "propagate": False,
            },
        }
    }
    logging.config.dictConfig(LOGGING_CONFIG)

setup_logging()
