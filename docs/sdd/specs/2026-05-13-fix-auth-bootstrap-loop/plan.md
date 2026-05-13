# Plan Técnico: Corregir Bucle de Arranque con Sesión Persistida

Spec: ./spec.md
Estado: In Progress
Fecha: 2026-05-13

## Enfoque

Inicializar el estado reactivo de autenticación del frontend a partir del token persistido ya normalizado, para que guards y shell compartan la misma decisión durante el primer ciclo de navegación. Mantener la validación remota existente mediante `getMe()` para cerrar sesión si la API rechaza el token.

## Impacto por Capa

### Backend

- Sin cambios.

### Frontend

- Servicios: `frontend/src/app/core/services/auth.service.ts`
- Guardas: impacto indirecto sobre `frontend/src/app/core/guards/auth.guard.ts` y `frontend/src/app/core/guards/public-only.guard.ts`
- Shell: sin cambio estructural, pero dependiente del estado emitido por `AuthService`

### Datos

- Sin cambios.

### Seguridad

- Se sigue exigiendo token JWT local válido por expiración.
- La validación contra backend se mantiene para expulsar sesiones revocadas o rechazadas.
- No se añaden nuevos almacenamientos de credenciales.

### IA/Integraciones Externas

- No aplica.

## Cambios de Contrato

| Contrato | Cambio | Consumidores | Compatibilidad |
| --- | --- | --- | --- |
| `AuthService.isAuthenticated$` | expone estado inicial coherente cuando existe token válido local | guards, shell raíz | Compatible |

## Estrategia de Implementación

1. Crear la spec SDD del hotfix y registrar la iniciativa en `docs/sdd/specs/index.md`.
2. Ajustar `AuthService` para derivar el estado inicial desde `getToken()` o equivalente compartido.
3. Mantener el flujo existente de validación remota en `AppComponent` para cerrar sesión si la API devuelve error.
4. Ejecutar build y checks de frontend, y revisar el comportamiento resultante.

## Estrategia de Pruebas

- Unitarias: no se añaden en esta intervención rápida.
- Frontend: `npx tsc -p tsconfig.app.json --noEmit`, `npm run build`.
- Manual/UI:
  - token persistido válido + recarga;
  - sin token + acceso a `/login`;
  - token persistido rechazado por API + logout a `/login`.
- Migración: no aplica.

## Riesgos

- Riesgo: considerar autenticado temporalmente a un token localmente válido pero revocado.
  Mitigación: mantener la llamada temprana a `getMe()` y el `logout()` al primer 401/error.
- Riesgo: introducir dobles navegaciones si `logout()` y los guards se pisan.
  Mitigación: no cambiar las redirecciones existentes, solo alinear el estado inicial.

## Rollback

Revertir el ajuste de inicialización de `AuthService` para volver al comportamiento previo.

## Observabilidad

- Logs esperados: los ya existentes en interceptores y validación remota de sesión.
- Errores esperados: si la API rechaza el token, aparece expiración de sesión y navegación a login.
- Métricas/manual checks: verificar que la recarga con token persistido ya no deja la app cargando.
