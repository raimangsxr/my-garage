# Plan Técnico: Track Records

Spec: ./spec.md
Estado: Baseline

## Backend

- Router `track_records.py` está montado bajo prefix `/vehicles`.
- `TrackRecordCreate/Update/Read` definen contratos.
- `TrackRecordsService` resuelve asociación con track cuando aplica.
- `organizers.py` extrae nombres distintos.

## Frontend

- `VehicleService` implementa CRUD de registros.
- `TrackRecordsComponent` y `TrackRecordDialogComponent` son la UI principal.

## Notas de Evolución

- Validación de tiempos y normalización de circuitos deben coordinarse con tracks-and-circuits.
- Cambiar ruta de organizers requiere compatibilidad frontend.
