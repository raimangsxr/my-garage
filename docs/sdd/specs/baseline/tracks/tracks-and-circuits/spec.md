# Spec: Tracks and Circuits

Estado: Baseline
Fecha: 2026-05-04
Tipo: baseline/tracks

## Resumen

Consulta y análisis de circuitos/tracks: tracks normalizados, circuitos legacy derivados de registros, rankings, detalle agrupado por vehículo y gráfica de evolución.

## Comportamiento Actual

- `/tracks` muestra tracks normalizados con estadísticas agregadas.
- `GET /api/v1/tracks` soporta paginación, búsqueda, `only_active`, ordenación y total.
- `GET /api/v1/tracks/{track_id}` devuelve detalle con grupos por vehículo.
- `POST /api/v1/tracks` crea tracks normalizados.
- `/circuits` expone circuitos legacy basados en `TrackRecord.circuit_name`.
- `GET /api/v1/circuits/{circuit_name}` devuelve detalle por nombre.
- La UI usa `app-circuit-evolution-chart` para evolución/comparación.

## Contratos

- Modelos: `backend/app/models/track.py`, `backend/app/models/track_record.py`.
- Endpoints: `backend/app/api/v1/endpoints/tracks.py`, `circuits.py`.
- Servicios backend: `backend/app/services/tracks_service.py`, `circuits_service.py`.
- Frontend: `frontend/src/app/features/tracks/`.
- Chart: `frontend/src/app/shared/components/circuit-evolution-chart/`.

## Criterios de Aceptación Baseline

- Usuario autenticado puede listar tracks con stats.
- Usuario autenticado puede abrir detalle de track.
- Circuitos legacy pueden consultarse por nombre.
- Detalle agrupa registros por vehículo y muestra mejor tiempo.

## Riesgos / Gaps

- Coexisten `Track` normalizado y `circuit_name` legacy.
- Comparar tiempos como string puede producir errores si cambia formato.
- Migraciones/backfills de circuitos deben ser cuidadosos.
