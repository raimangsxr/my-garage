# Plan Técnico: Profile Management

Spec: ./spec.md
Estado: Baseline

## Backend

- `users.py` contiene endpoints de perfil, avatar y password.
- `User` almacena `image_binary`.
- Seguridad de password usa hash/verify en `security.py`.

## Frontend

- `UserService` consume endpoints.
- `UserProfile` gestiona datos y avatar.
- `ChangePassword` gestiona formulario de contraseña.

## Notas de Evolución

- Validaciones fuertes de imagen o avatar remoto deben tener spec específica.
- Cambios de perfil deben mantener compatibilidad con header/auth state.
