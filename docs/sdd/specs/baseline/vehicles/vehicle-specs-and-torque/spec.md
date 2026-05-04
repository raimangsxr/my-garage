# Spec: Vehicle Specs and Torque

Estado: Baseline
Fecha: 2026-05-04
Tipo: baseline/vehicles

## Resumen

Especificaciones técnicas del vehículo y gestión de pares de apriete usados en la vista detalle.

## Comportamiento Actual

- `VehicleSpecs` conserva VIN, color, código de color, tipo de motor, combustible, transmisión, aceites, refrigerante, batería, neumáticos y `torque_specs`.
- Specs se crean/actualizan junto al vehículo cuando se envían.
- `PUT /api/v1/vehicles/{id}/specs/torque` actualiza específicamente los pares de apriete.
- La UI de torque permite ver, buscar, editar y guardar specs.
- Si no existen specs, el endpoint crea una fila asociada al vehículo.

## Contratos

- Modelo: `backend/app/models/vehicle_specs.py`.
- Endpoint torque: `backend/app/api/v1/endpoints/vehicles.py`.
- UI: `frontend/src/app/features/vehicles/components/torque-specs/`.
- Stats: `frontend/src/app/features/vehicles/components/vehicle-stats-bar/`.

## Criterios de Aceptación Baseline

- Specs básicas pueden acompañar creación/edición de vehículo.
- Torque specs pueden actualizarse desde detalle.
- La UI permite buscar y editar pares sin salir de la página.

## Riesgos / Gaps

- `torque_specs` se trata como estructura flexible de diccionarios.
- No hay schema fuerte para cada par de apriete.
- Cambios de formato requieren migración o compatibilidad legacy.
