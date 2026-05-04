# Spec: Vehicle Track Mode

Estado: Baseline
Fecha: 2026-05-04
Tipo: baseline/vehicles

## Resumen

Modo track dentro del detalle de vehículo para registrar y gestionar sesiones de pista y vueltas rápidas.

## Comportamiento Actual

- Vehículos con `usage_type` `track` o `both` muestran toggle Street/Track.
- Track view resume sesiones, circuitos visitados y mejor tiempo general.
- `app-track-records` lista registros y permite añadir, editar y borrar.
- Los registros se guardan en endpoints anidados bajo `/api/v1/vehicles`.
- Cada registro conserva circuito, tiempo, fecha, clima, compuesto, grupo, organizador y notas.

## Contratos

- Modelo: `backend/app/models/track_record.py`.
- Endpoints: `backend/app/api/v1/endpoints/track_records.py`.
- Servicio frontend: `VehicleService` métodos track records.
- UI: `frontend/src/app/features/vehicles/components/track-records/`, `track-record-dialog/`, `circuit-history-dialog/`.

## Criterios de Aceptación Baseline

- Se pueden listar registros de un vehículo.
- Se puede crear registro con tiempo y circuito.
- Se puede editar o borrar un registro.
- Los registros alimentan dashboard, tracks y circuits.

## Riesgos / Gaps

- `best_lap_time` es string; ordenar/comparar tiempos requiere cuidado.
- Coexisten `circuit_name` legacy y `track_id` normalizado.
- Cambios de registro impactan varias pantallas.
