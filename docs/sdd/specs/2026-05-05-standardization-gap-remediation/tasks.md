# Tasks: Remediar Gaps de Estandarización

Spec: ./spec.md
Plan: ./plan.md

## Preparación

- [x] Confirmar rama basada en `main` actualizado.
- [x] Revisar `system.md`.
- [x] Revisar auditoría de interfaz existente.
- [x] Revisar guidelines de interfaz.

## Implementación

- [x] Crear spec SDD de remediación.
- [x] Actualizar índice SDD.
- [x] Ampliar tokens globales mínimos.
- [x] Documentar patrón de confirmación en `system.md`.
- [x] Crear componente compartido de confirmación.
- [x] Migrar usos nativos de `confirm()`.
- [x] Migrar uso nativo de `alert()`.
- [x] Extender `app-empty-state` con copy secundario reutilizable.
- [x] Migrar `parts`, `suppliers` e `invoices` al patrón compartido de empty state.
- [x] Migrar `dashboard`, `tracks`, `maintenance`, `vehicles` y `notifications` al patrón compartido de empty/error state cuando aplica.
- [x] Corregir semántica clickable en `app-entity-card` y superficies interactivas principales.
- [x] Actualizar documentación SDD si hubo cambios de alcance.
- [x] Reducir hex hardcodeados en módulos visuales prioritarios (`dashboard`, `track-detail`, `vehicle-detail`, `circuit-history-dialog`, `circuit-evolution-chart`, `track-records`, `stat-card`).
- [x] Normalizar badges, tarjetas y paneles analíticos a tokens y superficies del sistema.
- [x] Corregir interacciones clickable restantes en charts/timelines.
- [x] Extender la normalización visual a módulos operativos con deuda residual (`maintenance`, `invoice-detail`, `invoice-upload`, `invoice-review`, `notifications`, `vehicles`, `vehicle-dialog`, `maintenance-dialog`, `torque-specs`, `tracks`).

## Verificación

- [x] Ejecutar búsqueda estática de nativos `confirm(` y `alert(` con `rg "(?<!\.)\b(confirm|alert)\s*\(" frontend/src/app/features -n --pcre2`: sin resultados.
- [x] Ejecutar búsqueda estática de icon buttons sin `aria-label`: sin resultados.
- [x] Ejecutar búsqueda estática de `transition: all`: sin resultados.
- [x] Ejecutar auditoría final de hex directos en `frontend/src/app`: `0` resultados.
- [x] Ejecutar `npx tsc -p tsconfig.app.json --noEmit`.
- [x] Ejecutar `npm run build` completo. OK fuera del sandbox; mantiene warning de budget inicial excedido.
- [x] Revisar responsive si toca UI. Verificación visual mínima: app arranca en login sin errores de consola; validación de diálogo real bloqueada por 500 en `/api/v1/auth/login/access-token`.
- [x] Repetir auditoría de colores hardcodeados en módulos objetivo y documentar deuda residual real.

## PR

- [ ] PR enlaza `spec.md`.
- [ ] PR enlaza `plan.md`.
- [ ] PR enlaza ADRs si existen.
- [ ] PR resume pruebas ejecutadas.
- [ ] PR documenta checks no ejecutados.
- [ ] PR incluye capturas si toca UI.
