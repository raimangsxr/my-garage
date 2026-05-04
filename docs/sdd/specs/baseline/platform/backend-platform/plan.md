# Plan Técnico: Backend Platform

Spec: ./spec.md
Estado: Baseline

## Archivos Relevantes

- `backend/app/main.py`
- `backend/app/api/v1/api.py`
- `backend/app/database.py`
- `backend/app/api/deps.py`
- `backend/app/core/config.py`
- `backend/app/core/security.py`
- `backend/app/core/storage.py`
- `backend/app/core/exceptions.py`
- `backend/app/middleware/`
- `backend/alembic/`

## Dependencias

- FastAPI
- SQLModel / SQLAlchemy
- Alembic
- PostgreSQL
- Pydantic Settings
- python-jose

## Notas de Evolución

- Cambios de modelo requieren migración Alembic.
- Cambios de auth deben revisar `deps.py`, interceptores frontend y guard.
- Cambios de errores deben mantener compatibilidad con el interceptor frontend.
