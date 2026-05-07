# Tasks: Corregir Tarjetas Vacías en Detalle de Vehículo

Spec: ./spec.md
Plan: ./plan.md

## Preparación

- [x] Revisar `system.md`.
- [x] Identificar la causa raíz en `vehicle-detail` y `app-entity-card`.

## Implementación

- [x] Crear spec SDD del fix.
- [x] Corregir el patrón compartido `app-entity-card`.
- [x] Habilitar edición de parts desde `vehicle-detail`.
- [x] Refrescar `vehicle-detail` tras guardar una parte.
- [x] Actualizar documentación SDD si cambia el alcance.

## Verificación

- [x] Ejecutar `npx tsc -p tsconfig.app.json --noEmit`.
- [x] Ejecutar `npm run build`.
- [x] Validar visualmente que parts e invoices muestren contenido.
- [x] Validar apertura y guardado de parte.
- [x] Revisar `git diff --check`.
