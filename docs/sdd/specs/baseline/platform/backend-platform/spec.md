# Spec: Backend Platform

Estado: Baseline
Fecha: 2026-05-04
Tipo: baseline/platform

## Resumen

Base backend de My Garage: FastAPI, prefijo `/api/v1`, configuración, CORS, sesiones SQLModel, manejo de errores, request id, seguridad JWT, storage de uploads y migraciones Alembic.

## Comportamiento Actual

- La aplicación FastAPI se crea en `backend/app/main.py`.
- Los endpoints versionados se montan bajo `/api/v1`.
- `/health` expone estado, versión y entorno.
- CORS permite orígenes explícitos y, en desarrollo, orígenes locales/red privada mediante regex.
- La base de datos se configura desde `DATABASE_URL`.
- Las sesiones se exponen mediante dependencias en `backend/app/database.py` y `backend/app/api/deps.py`.
- Las excepciones propias se serializan de forma homogénea con request id.
- Los uploads se sirven desde `/uploads`.
- JWT protege endpoints privados mediante usuario activo.

## Contratos

- Configuración: `backend/app/core/config.py`.
- App: `backend/app/main.py`.
- Router raíz: `backend/app/api/v1/api.py`.
- DB/session: `backend/app/database.py`, `backend/app/api/deps.py`.
- Seguridad: `backend/app/core/security.py`.
- Errores: `backend/app/core/exceptions.py`, `backend/app/middleware/exception_handler.py`.
- Request id: `backend/app/middleware/request_id.py`.
- Migraciones: `backend/alembic/versions/`.

## Criterios de Aceptación Baseline

- La app responde en `/health`.
- Los routers principales quedan disponibles bajo `/api/v1`.
- Los endpoints privados rechazan peticiones sin token válido.
- Los errores esperados devuelven payload consistente.
- Las migraciones Alembic representan el esquema persistente actual.

## Riesgos / Gaps

- Algunos endpoints usan serialización manual; revisar al tocar contratos.
- El storage mezcla archivos en disco con imágenes binarias en DB según dominio.
- Cualquier cambio de config productiva debe validar secretos y CORS.
