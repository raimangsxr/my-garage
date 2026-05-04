# Plan Técnico: Homogeneizar Interfaz y Sistema de Diseño

Spec: ./spec.md
Estado: In Progress
Fecha: 2026-05-04

## Enfoque

Primero se documenta una auditoría estática y se amplía `system.md`. Después, cada fase de implementación tendrá su propia spec o subtarea concreta para tocar código de UI de forma controlada.

## Auditoría Ejecutada

- Revisión de `system.md`.
- Revisión de `frontend/src/styles.scss`.
- Inventario de SCSS de `features`, `shared` y `layout`.
- Búsquedas de:
  - `transition: all`
  - icon buttons sin `aria-label`
  - `mg-page`, `mg-table`, `mg-surface-card`
  - `empty-state`, `app-empty-state`, `app-page-loader`, `mat-spinner`
  - hex colors hardcodeados
  - tablas HTML/Material y tablas locales con divs

## Hallazgos Principales

1. Existen patrones globales útiles (`mg-page`, `mg-table`, `mg-surface-card`), pero su adopción no es completa.
2. Los módulos CRUD usan un patrón parecido, pero todavía mantienen clases locales (`container`, `header`, `parts-table`, `invoice-table`, `supplier-table`, etc.).
3. Existen tablas locales hechas con divs (`track-records`, `circuit-history-dialog`) que replican responsabilidades de tabla/lista.
4. `app-entity-card` y varias cards locales resuelven interacción de forma distinta; algunas usan `div` clickable.
5. Hay icon-only buttons sin `aria-label`.
6. Hay muchos colores hardcodeados fuera de tokens.
7. Hay múltiples `transition: all`.
8. Hay estados vacíos/carga mixtos: `app-empty-state`, `.mg-empty-state`, `.empty-state`, overlays locales.

## Fases Propuestas

### Fase 1: Sistema y Contratos Compartidos

- Ampliar `system.md` con matriz de componentes.
- Definir reglas de icon buttons, tablas, cards, estados y excepciones.
- Crear specs de refactor para componentes compartidos.

### Fase 2: CRUD Tables

- Homogeneizar `maintenance`, `parts`, `suppliers`, `invoices`, `tracks`.
- Reducir clases locales de tabla.
- Aplicar acciones con `aria-label`, confirmación y estados comunes.

### Fase 3: Entity Lists y Cards

- Evolucionar `app-entity-card` para soportar variantes y semántica accesible.
- Migrar listas locales de vehículo, piezas, torque y track records cuando encaje.

### Fase 4: Vehicle Detail y Track Analytics

- Alinear `vehicle-detail`, `track-records` y `circuit-history-dialog`.
- Normalizar tablas densas, badges, chips y controles de comparación.

### Fase 5: Forms y Dialogs

- Homogeneizar dialogs de vehículo, mantenimiento, pieza, proveedor y track record.
- Estandarizar validación, acciones, layout y estados.

## Riesgos

- Refactor visual amplio puede romper comportamiento si se hace en bloque.
- Componentes compartidos demasiado genéricos pueden volverse rígidos.
- Algunas pantallas, como detalle de vehículo, necesitan identidad propia; no todo debe convertirse en tabla genérica.

## Rollback

Como esta iteración solo documenta y amplía sistema, rollback consiste en revertir cambios de documentación. Las fases futuras deberán tener rollback propio.
