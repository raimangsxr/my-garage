# Spec: Settings Management

Estado: Baseline
Fecha: 2026-05-04
Tipo: baseline/identity

## Resumen

Ajustes persistidos por usuario para configuración de integraciones y opciones de aplicación, incluyendo Google Client ID y Gemini API Key.

## Comportamiento Actual

- `GET /api/v1/settings` devuelve settings del usuario actual.
- Si no existen settings, se crean valores por defecto.
- `PUT /api/v1/settings` actualiza campos enviados.
- Settings se relaciona con `User`.
- Frontend expone `/settings` y `SettingsService`.
- El flujo de facturas puede resolver Gemini API Key desde settings del usuario o configuración de servidor.

## Contratos

- Endpoints: `backend/app/api/v1/endpoints/settings.py`.
- Modelo: `backend/app/models/settings.py`.
- Servicio frontend: `frontend/src/app/core/services/settings.service.ts`.
- Modelo TS: `frontend/src/app/core/models/settings.model.ts`.
- UI: `frontend/src/app/features/settings/`.

## Criterios de Aceptación Baseline

- Usuario autenticado siempre obtiene settings.
- Actualización parcial conserva valores no enviados.
- Configuración se puede consumir desde integraciones.

## Riesgos / Gaps

- Settings contiene claves sensibles; revisar exposición y masking si se amplía UI.
- `dict()` se usa en update; puede migrarse a `model_dump` en refactor futuro.
