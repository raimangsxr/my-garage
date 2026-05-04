# Plan Técnico: Tracks and Circuits

Spec: ./spec.md
Estado: Baseline

## Backend

- `TracksService` calcula stats de tracks normalizados.
- `CircuitsService` calcula stats desde `circuit_name`.
- Endpoints devuelven modelos Pydantic internos del router.

## Frontend

- `TracksService` consume API de tracks.
- `TracksComponent` lista.
- `TrackDetailComponent` muestra grupos y gráfica.
- `tracks.models.ts` define contratos TS.

## Notas de Evolución

- Consolidar legacy/normalizado requiere spec de migración.
- Cualquier cambio de gráfica debe seguir sección de comparación de `system.md`.
