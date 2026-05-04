# Spec: Profile Management

Estado: Baseline
Fecha: 2026-05-04
Tipo: baseline/identity

## Resumen

Gestión del perfil del usuario autenticado: datos personales, avatar y cambio de contraseña.

## Comportamiento Actual

- `GET /api/v1/users/me` devuelve usuario actual.
- `PUT /api/v1/users/me` actualiza nombre completo y avatar.
- El avatar puede recibirse como data URL base64 o URL externa descargable.
- `GET /api/v1/users/avatars` devuelve una lista estática de avatares.
- `POST /api/v1/users/me/password` cambia contraseña validando la actual.
- Frontend expone pantallas `/profile` y `/change-password`.

## Contratos

- Endpoints: `backend/app/api/v1/endpoints/users.py`.
- Modelo: `backend/app/models/user.py`.
- Servicio frontend: `frontend/src/app/core/services/user.service.ts`.
- Perfil: `frontend/src/app/features/profile/user-profile/`.
- Password: `frontend/src/app/features/profile/change-password/`.

## Criterios de Aceptación Baseline

- Usuario autenticado puede consultar su perfil.
- Cambios de nombre/avatar persisten.
- Contraseña actual incorrecta bloquea cambio.
- Contraseña válida actualiza hash.

## Riesgos / Gaps

- Errores al procesar avatar se silencian en algunos casos.
- Descarga de URL externa para avatar requiere revisar seguridad/tamaño si se endurece.
- La lista de avatares es estática.
