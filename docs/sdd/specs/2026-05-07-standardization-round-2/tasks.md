# Tasks: Cerrar Segunda Ronda de Estandarización

Spec: ./spec.md
Plan: ./plan.md

## Preparación

- [x] Revisar `system.md`.
- [x] Revisar specs previas de estandarización.
- [x] Identificar consumers de `organizers` y endpoints con `deps.get_session`.

## Implementación

- [x] Crear spec SDD de ronda 2.
- [x] Actualizar índice SDD.
- [x] Normalizar `organizers` a ruta estándar y auth privada.
- [x] Migrar endpoints restantes del alcance a `deps.get_db`.
- [x] Convertir selección de avatar a control semántico accesible.
- [x] Actualizar estados documentales de specs previas.
- [x] Actualizar documentación SDD si cambia el alcance.

## Verificación

- [x] Ejecutar búsqueda de `Depends(deps.get_session)` en `backend/app/api/v1/endpoints`.
- [x] Ejecutar `npx tsc -p tsconfig.app.json --noEmit`.
- [x] Ejecutar `npm run build`.
- [ ] Validar teclado en selección de avatar.
- [x] Revisar `git diff --check`.

## PR

- [ ] PR enlaza `spec.md`.
- [ ] PR enlaza `plan.md`.
- [ ] PR resume pruebas ejecutadas.
- [ ] PR documenta checks no ejecutados.
