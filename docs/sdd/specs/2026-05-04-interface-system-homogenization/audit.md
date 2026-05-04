# Auditoría de Interfaz

Fecha: 2026-05-04
Alcance: frontend Angular, `system.md`, estilos globales y componentes compartidos.

## Diagnóstico Ejecutivo

My Garage ya tiene una dirección visual útil para herramienta operativa: módulos con `mg-page`, tablas densas, cards suaves y un foco claro en datos de vehículos. El problema principal no es ausencia total de sistema, sino convivencia de varios sistemas pequeños:

- sistema global `mg-*`,
- componentes compartidos `app-*`,
- estilos locales por feature,
- tablas/listas hechas a mano,
- patrones heredados de Angular Material sin capa de producto.

El objetivo debe ser consolidar, no rediseñar desde cero.

## Hallazgos por Prioridad

### P1: Componentes Repetidos o Solapados

| Área | Evidencia | Riesgo | Dirección |
| --- | --- | --- | --- |
| Tablas CRUD | `maintenance`, `parts`, `suppliers`, `invoices`, `tracks` usan `mg-table` pero mantienen clases locales y acciones repetidas. | Cambios de densidad/acciones se duplican. | Crear contrato de `mg-data-table` o componente compartido. |
| Tablas con divs | `track-records` y `circuit-history-dialog` implementan headers/rows manuales. | Accesibilidad, teclado, responsive y sorting divergentes. | Migrar a patrón `mg-data-list`/`mg-comparison-table` según densidad. |
| Cards de entidad | `app-entity-card`, cards de vehículos, invoice cards, track rows y torque specs tienen variantes locales. | Interacciones y superficies no homogéneas. | Evolucionar `app-entity-card` con variantes y semántica. |
| Estados vacíos | Conviven `app-empty-state`, `.mg-empty-state` y `.empty-state`. | Copys, iconos y acciones inconsistentes. | Unificar en `app-empty-state` con variantes. |
| Loaders | Conviven `app-page-loader`, overlays locales y `mat-spinner` micro. | Estados visuales distintos para mismo problema. | Definir page, section y inline loading. |

### P1: Accesibilidad de Acciones

Se detectan múltiples `mat-icon-button` sin `aria-label` explícito en:

- listados CRUD,
- invoice actions,
- track actions,
- vehicle detail actions,
- search clear buttons,
- dialogs.

Regla propuesta: todo icon-only button debe tener `aria-label`; tooltip no sustituye `aria-label`.

### P1: Semántica Clickable

`app-entity-card` usa un `div` clickable y varias filas/cards locales usan `div` con `(click)`. Esto limita teclado y semántica.

Regla propuesta:

- navegación: link/routerLink,
- acción: button,
- card clickable: componente debe renderizar semántica accesible o exponer rol/keyboard handlers como mínimo.

### P2: Tokens y Colores

Hay muchos colores hardcodeados en SCSS (`#111827`, `#6b7280`, `#f9fafb`, `#e5e7eb`, gradientes, colores semánticos). Muchos son razonables, pero no están nombrados como tokens.

Regla propuesta: ampliar tokens globales con:

- text/surface/border hierarchy,
- semantic success/warn/danger/info,
- track/performance palette,
- focus ring,
- hover/selected states.

### P2: Motion

Hay varios `transition: all`, especialmente en cards, sidenav, timelines, charts y track records.

Regla propuesta: prohibir `transition: all`; listar propiedades (`background-color`, `border-color`, `box-shadow`, `transform`, `color`, `opacity`).

### P2: Page Anatomy

Los módulos principales se están acercando al patrón `mg-page`, pero algunos conservan clases legacy (`container`, `header`, `maintenance-container`) y variaciones de heading (`h1`/`h2`) sin criterio visible.

Regla propuesta: cada pantalla de módulo debe usar:

1. `mg-page`
2. `mg-page-header`
3. `mg-page-title-wrap`
4. `mg-page-actions`
5. `mg-toolbar`
6. `mg-surface-card` o layout específico documentado.

### P2: Forms y Dialogs

Dialogs de mantenimiento, vehículo, piezas, proveedor y track record usan layouts propios. Hay oportunidad para:

- `mg-dialog-shell`,
- `mg-form-grid`,
- acciones sticky/consistentes,
- help text y error text homogéneos.

### P3: Copy y Localización

La UI está mayoritariamente en inglés; documentación/proceso está en español. No es un problema técnico inmediato, pero debe decidirse idioma de producto.

Regla propuesta: escoger idioma por spec antes de añadir nuevas pantallas; no mezclar copy sin intención.

## Candidatos a Consolidación

### `app-entity-card`

Evolucionar para cubrir:

- `variant`: `default | compact | metric | media | timeline`
- `interactive`: `none | action | navigation`
- `density`: `comfortable | compact`
- `leadingIcon` o slot leading
- `meta` y `actions` slots
- aria/keyboard nativo

Consumidores candidatos:

- vehicle detail invoices,
- vehicle parts,
- maintenance timeline,
- track records row cards en móvil,
- vehicle cards si se define variante media.

### `mg-data-table` / `app-data-table`

Crear o formalizar componente/patrón para:

- columnas,
- actions column,
- empty/loading/error,
- sorting/pagination,
- responsive column visibility,
- consistent `aria-label`.

Consumidores candidatos:

- maintenance,
- invoices,
- parts,
- suppliers,
- tracks,
- records tables de track detail.

### `app-empty-state`

Debe absorber:

- `.mg-empty-state`,
- `.empty-state` local,
- empty compact,
- empty with CTA.

### `app-page-loader`

Mantener como loader principal, pero definir:

- page loader,
- section loader,
- inline loader.

## Orden Recomendado de Implementación

1. Añadir tokens y reglas en `system.md`.
2. Corregir accesibilidad de icon buttons sin cambiar layouts.
3. Sustituir `transition: all`.
4. Consolidar empty/loading states.
5. Crear componente/patrón de tabla compartida para CRUD.
6. Migrar módulos CRUD uno a uno.
7. Evolucionar `app-entity-card`.
8. Atacar `vehicle-detail`, `track-records` y `circuit-history-dialog`.

## Checks de Revisión Visual

Cada PR UI debe reportar:

- secciones de `system.md` aplicadas,
- componentes compartidos usados/extendidos,
- excepciones justificadas,
- desktop y mobile,
- teclado/focus,
- empty/loading/error,
- consola sin errores.
