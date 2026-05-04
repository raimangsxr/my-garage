# Spec: Google Auth

Estado: Baseline
Fecha: 2026-05-04
Tipo: baseline/identity

## Resumen

Login con Google OAuth mediante credencial JWT, validación en backend, creación/actualización de usuario y almacenamiento de token federado.

## Comportamiento Actual

- Frontend inicializa Google Sign-In desde `GoogleAuthService` y `app-google-sign-in`.
- Backend recibe credencial en `POST /api/v1/auth/google/login`.
- La credencial se verifica contra Client IDs configurados en entorno o settings de base de datos.
- Si el usuario no existe, se crea con email, nombre y password vacío hasheado.
- Se crea o actualiza `GoogleAuthToken` con datos de Google.
- Backend emite JWT propio para la app.

## Contratos

- Endpoint: `backend/app/api/v1/endpoints/auth.py`.
- Modelo token federado: `backend/app/models/google_auth.py`.
- Settings Google Client ID: `backend/app/models/settings.py`.
- Frontend service: `frontend/src/app/core/services/google-auth.service.ts`.
- Componente: `frontend/src/app/shared/components/google-sign-in/`.

## Criterios de Aceptación Baseline

- Credencial Google válida produce token de aplicación.
- Credencial inválida devuelve 401.
- Si Google Auth no está disponible, backend devuelve error claro.
- Client ID puede venir de entorno o settings persistidos.

## Riesgos / Gaps

- La configuración por usuario se consulta globalmente para validar audiencia.
- Hay que evitar logs de credenciales.
- Cambios OAuth requieren pruebas manuales con Google real.
