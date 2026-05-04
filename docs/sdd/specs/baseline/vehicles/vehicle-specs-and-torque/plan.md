# Plan Técnico: Vehicle Specs and Torque

Spec: ./spec.md
Estado: Baseline

## Backend

- `VehicleSpecs` tiene relación 1:1 con `Vehicle`.
- `VehicleCreate/Update` aceptan specs opcionales.
- Endpoint torque crea o actualiza specs.

## Frontend

- `TorqueSpecsComponent` maneja search/edit/save.
- `VehicleDetailComponent` conecta evento de guardado.
- `VehicleStatsBarComponent` muestra specs relevantes.

## Notas de Evolución

- Definir schema estricto de torque specs requeriría spec nueva.
- Import/export de specs debe preservar compatibilidad.
