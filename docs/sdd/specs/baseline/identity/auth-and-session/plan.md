# Plan Técnico: Auth and Session

Spec: ./spec.md
Estado: Baseline

## Backend

- Endpoint OAuth2 compatible en `auth.py`.
- JWT en `security.py`.
- Resolución de usuario actual en `deps.py`.
- `User` conserva email, password hash, flags y avatar.

## Frontend

- `LoginComponent` captura credenciales.
- `AuthService` gestiona token y estado.
- `AuthGuard` protege rutas.
- Interceptores integran token y errores.

## Notas de Evolución

- Cualquier cambio de token requiere revisar backend y frontend juntos.
- Recuperación de contraseña necesita spec propia antes de completarse.
