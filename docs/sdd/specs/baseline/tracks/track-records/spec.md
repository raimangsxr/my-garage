# Spec: Track Records

Estado: Baseline
Fecha: 2026-05-04
Tipo: baseline/tracks

## Resumen

Registro individual de sesiones de pista/vueltas rápidas asociado a vehículo y opcionalmente a track normalizado.

## Comportamiento Actual

- Los registros se gestionan desde detalle de vehículo.
- Backend expone bajo `/api/v1/vehicles`:
  - `GET /{vehicle_id}/track-records`
  - `POST /{vehicle_id}/track-records`
  - `PUT /track-records/{record_id}`
  - `DELETE /track-records/{record_id}`
- Un registro contiene circuito, mejor vuelta, fecha, clima, compuesto, grupo, organizador y notas.
- Puede incluir `track_id` además de `circuit_name`.
- `GET /api/v1/organizers/organizers` devuelve organizadores distintos a partir de registros.

## Contratos

- Modelo: `backend/app/models/track_record.py`.
- Endpoints: `backend/app/api/v1/endpoints/track_records.py`, `organizers.py`.
- Service backend: `backend/app/services/track_records_service.py`.
- Frontend: `VehicleService` track record methods.
- UI: `track-records`, `track-record-dialog`, `circuit-history-dialog`.

## Criterios de Aceptación Baseline

- Usuario autenticado puede añadir registro a vehículo.
- Usuario autenticado puede editar y borrar registro.
- Registros alimentan modo track, dashboard, tracks y circuits.
- Organizadores se pueden listar para autocompletado/selección.

## Riesgos / Gaps

- El endpoint de organizers tiene ruta resultante `/api/v1/organizers/organizers`.
- No hay validación fuerte del formato `M:SS.mmm`.
- `track_id` opcional mantiene compatibilidad pero complica reporting.
