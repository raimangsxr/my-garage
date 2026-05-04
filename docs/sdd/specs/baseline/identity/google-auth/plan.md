# Plan Técnico: Google Auth

Spec: ./spec.md
Estado: Baseline

## Backend

- `auth.py` valida token Google y emite JWT app.
- `GoogleAuthToken` conserva google_id, email, nombre, imagen y expiración.
- `Settings` puede aportar Google Client ID.

## Frontend

- `GoogleAuthService` carga/inicializa SDK.
- `GoogleSignInComponent` representa el botón.
- `AuthService` integra estado autenticado tras login.

## Notas de Evolución

- Separar configuración global/usuario requeriría spec propia.
- Reautorización, refresh o scopes adicionales deben documentarse como cambio de integración.
