# Spec: Auth and Session

Estado: Baseline
Fecha: 2026-05-04
Tipo: baseline/identity

## Resumen

Autenticación local con email/password, emisión de JWT, protección de rutas Angular y envío de token en llamadas HTTP.

## Comportamiento Actual

- El login local usa `POST /api/v1/auth/login/access-token`.
- El backend valida usuario activo y contraseña hasheada.
- El token JWT incluye el email como subject y expira según configuración.
- Angular almacena token y estado autenticado en `AuthService`.
- `AuthGuard` protege rutas privadas.
- `authInterceptor` añade el token a requests HTTP.
- `errorInterceptor` centraliza errores de API.
- Logout limpia estado y navega fuera de la sesión.

## Contratos

- Backend auth: `backend/app/api/v1/endpoints/auth.py`.
- Seguridad: `backend/app/core/security.py`.
- Dependencias usuario: `backend/app/api/deps.py`.
- Modelo usuario: `backend/app/models/user.py`.
- Frontend login: `frontend/src/app/auth/login/`.
- Auth service: `frontend/src/app/core/services/auth.service.ts`.
- Guard/interceptors: `frontend/src/app/core/guards/`, `frontend/src/app/core/interceptors/`.

## Criterios de Aceptación Baseline

- Credenciales válidas devuelven token bearer.
- Credenciales inválidas devuelven 401.
- Usuario inactivo no puede iniciar sesión.
- Rutas privadas requieren sesión.
- Requests autenticados incluyen token.

## Riesgos / Gaps

- Recuperación de contraseña está marcada como TODO en backend.
- Usuarios OAuth se crean con password vacío hasheado; revisar si se amplía auth local/OAuth.
- Cambios de storage del token afectan seguridad frontend.
