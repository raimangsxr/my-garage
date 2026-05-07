# Plan Técnico: Remediar Gaps de Estandarización

Spec: ./spec.md
Estado: In Progress
Fecha: 2026-05-05

## Enfoque

Implementar una remediación por capas: primero foundation segura (documentación, tokens mínimos, confirmaciones, empty states y semántica clickable) y después una normalización visual focalizada en los módulos con más divergencia acumulada.

## Impacto por Capa

### Backend

- Modelos: sin cambios.
- Schemas: sin cambios.
- Servicios: sin cambios.
- Endpoints: sin cambios.
- Migraciones: no.

### Frontend

- Rutas: sin cambios.
- Servicios: sin cambios.
- Componentes: módulos con acciones destructivas, errores locales y estados vacíos de CRUD.
- Estilos: tokens globales, variantes semánticas y sustitución progresiva de hex hardcodeados.
- Componentes compartidos: `frontend/src/app/shared/components/confirm-dialog/`, `empty-state`, `entity-card`, `stat-card`, `circuit-evolution-chart`.

### Datos

- Nuevos campos/tablas: ninguno.
- Índices: ninguno.
- Backfill: no aplica.
- Compatibilidad: total.

### Seguridad

- Autenticación/autorización: sin cambios.
- Datos sensibles: sin cambios.
- Logs: se mantienen logs existentes.

### IA/Integraciones Externas

- Integración: no aplica.
- Estados de error: se elimina `alert()` nativo del flujo de imagen remota.
- Retry/fallback: sin cambios.

## Cambios de Contrato

| Contrato | Cambio | Consumidores | Compatibilidad |
| --- | --- | --- | --- |
| UI confirmación | Nuevo componente compartido | Frontend | Compatible |
| UI empty state | Extensión de `app-empty-state` con copy secundario y acciones | Frontend | Compatible |
| UI clickable semantics | `app-entity-card` y superficies clave con teclado/roles | Frontend | Compatible |
| UI visual tokens | Sustituir colores locales en módulos objetivo por tokens/variables semánticas | Frontend | Compatible |

## Estrategia de Implementación

1. Crear spec, plan y tasks.
2. Actualizar índice SDD.
3. Añadir tokens semánticos en `styles.scss` y documentar uso en `system.md`.
4. Crear `ConfirmDialogComponent`.
5. Migrar `confirm()` y `alert()` de features.
6. Extender `app-empty-state` y migrar `parts`, `suppliers` e `invoices`.
7. Corregir semántica clickable en `entity-card`, listados y previews.
8. Reducir colores hardcodeados y variantes visuales locales en `dashboard`, `track-detail`, `vehicle-detail`, `circuit-history-dialog`, `track-records`, `circuit-evolution-chart` y `stat-card`.
9. Convertir interacciones analíticas pendientes a superficies semánticas accesibles.
10. Ejecutar checks estáticos, TypeScript y build.

## Estrategia de Pruebas

- Unitarias: no se añaden en esta fase por ausencia de harness existente para dialogs.
- Integración backend: no aplica.
- Frontend: TypeScript sin emisión.
- Manual/UI: validar flujos de borrar/cancelar cuando haya servidor disponible.
- Migración: no aplica.

## Riesgos

- Riesgo: cambiar confirmación síncrona por flujo async puede saltarse una acción si se implementa mal.
  Mitigación: encapsular la acción dentro de `afterClosed()` y ejecutar solo si devuelve `true`.
- Riesgo: estilos del diálogo pueden no cubrir todos los tonos.
  Mitigación: mantener variantes mínimas `danger`, `warning` y `info`.
- Riesgo: la tokenización agresiva pueda borrar señales visuales útiles del dominio.
  Mitigación: mantener variables locales por componente derivadas de tokens globales y revisar contraste/jerarquía.

## Rollback

Revertir el componente compartido y volver a los bloques previos de `confirm()` si hubiera una regresión crítica. No hay datos que restaurar.

## Observabilidad

- Logs esperados: los existentes en cada flujo de error.
- Errores esperados: errores de servicio actuales.
- Métricas/manual checks: búsquedas de `confirm(`, `alert(`, `transition: all` y botones icon-only sin `aria-label`.
