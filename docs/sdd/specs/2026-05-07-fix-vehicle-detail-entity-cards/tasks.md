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
- [x] Documentar el alcance de eliminación de scroll horizontal en parts/invoices.
- [x] Ajustar `app-entity-column` para permitir encogimiento dentro del grid.
- [x] Ajustar `app-entity-card` para respetar el ancho disponible con padding.
- [x] Ajustar cards de parts e invoices para wrap/truncado controlado.

## Verificación

- [x] Ejecutar `npx tsc -p tsconfig.app.json --noEmit`.
- [x] Ejecutar `npm run build`.
- [x] Validar visualmente que parts e invoices muestren contenido.
- [x] Validar apertura y guardado de parte.
- [x] Revisar `git diff --check`.
- [x] Ejecutar `npx tsc -p tsconfig.app.json --noEmit`.
- [x] Ejecutar `npm run build`.
- [x] Validar visualmente que parts e invoices no tengan scroll horizontal usando el usuario seed `admin@example.com` en `http://127.0.0.1:4200/vehicles/1`.
- [x] Revisar `git diff --check`.
