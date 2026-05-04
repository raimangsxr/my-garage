# Plan Técnico: Maintenance Management

Spec: ./spec.md
Estado: Baseline

## Backend

- `MaintenanceBase` define contrato principal.
- Endpoints usan eager loading para relaciones.
- Listado calcula total y cabecera `X-Total-Count`.

## Frontend

- `MaintenanceService` normaliza respuesta paginada.
- `MaintenanceComponent` gestiona tabla/listado.
- `MaintenanceDialogComponent` gestiona formulario.

## Notas de Evolución

- Flujos que combinen mantenimiento+piezas deben declarar transacción y relaciones.
- Cambios de coste alimentan dashboard.
