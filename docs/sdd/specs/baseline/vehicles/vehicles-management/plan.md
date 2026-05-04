# Plan Técnico: Vehicles Management

Spec: ./spec.md
Estado: Baseline

## Backend

- `Vehicle` es agregado principal.
- `VehicleRead/Create/Update` definen contratos.
- `vehicles.py` serializa `image_url` y specs.
- Imagen usa `image_binary`.

## Frontend

- `VehicleService` consume CRUD e imagen.
- `VehiclesComponent` lista vehículos.
- `VehicleDialogComponent` gestiona alta/edición.

## Datos

- `license_plate` es única e indexada.
- Fechas legales alimentan notificaciones.

## Notas de Evolución

- Nuevos campos de vehículo requieren migración, modelo TS y diálogo.
- Cambios de imagen deben revisar perfil de almacenamiento.
