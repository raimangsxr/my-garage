# Plan Técnico: Vehicle Track Mode

Spec: ./spec.md
Estado: Baseline

## Backend

- Router `track_records.py` se monta con prefijo `/vehicles`.
- `TrackRecord` pertenece a `Vehicle` y opcionalmente a `Track`.
- `TrackRecordsService` ayuda a asociar track/circuito.

## Frontend

- `VehicleDetailComponent` alterna modo.
- `TrackRecordsComponent` gestiona listado.
- `TrackRecordDialogComponent` captura edición.
- `CircuitHistoryDialogComponent` muestra histórico por circuito.

## Notas de Evolución

- Normalización completa de circuitos debe coordinar specs de tracks/circuits.
- Cambios en formato de tiempo requieren migración/validación.
