# Spec: App Shell y Navegación

Estado: Baseline
Fecha: 2026-05-04
Tipo: baseline/platform

## Resumen

Shell Angular que organiza la experiencia privada de My Garage: login público, rutas protegidas, header, sidenav, footer y navegación por módulos.

## Comportamiento Actual

- `/login` es la ruta pública.
- El resto de rutas cuelgan de un bloque protegido por `AuthGuard`.
- La ruta raíz redirige a `/dashboard`.
- Las rutas principales son dashboard, vehicles, tracks, maintenance, invoices, suppliers, parts, profile, notifications, change-password y settings.
- El sidenav expone módulos operativos: Dashboard, Vehicles, Tracks, Maintenance, Invoices, Suppliers, Parts y Settings.
- La app usa componentes standalone y lazy loading para features.

## Contratos

- Rutas: `frontend/src/app/app.routes.ts`.
- Configuración app: `frontend/src/app/app.config.ts`.
- Shell: `frontend/src/app/app.component.*`.
- Header: `frontend/src/app/layout/header/`.
- Sidenav: `frontend/src/app/layout/sidenav/`.
- Footer: `frontend/src/app/layout/footer/`.
- Guard: `frontend/src/app/core/guards/auth.guard.ts`.

## Criterios de Aceptación Baseline

- Usuarios no autenticados son enviados a login.
- Usuarios autenticados pueden navegar a módulos privados.
- El sidenav refleja los módulos operativos principales.
- Las rutas de detalle y revisión cargan componentes lazy bajo autenticación.

## Riesgos / Gaps

- Las rutas de perfil/notificaciones existen pero no están en el sidenav principal.
- Cambios de navegación deben revisar permisos, responsive y discoverability.
