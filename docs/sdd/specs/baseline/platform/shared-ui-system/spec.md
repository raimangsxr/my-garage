# Spec: Shared UI System

Estado: Baseline
Fecha: 2026-05-04
Tipo: baseline/platform

## Resumen

Conjunto de estilos, componentes compartidos y patrones visuales que sostienen la UI de My Garage.

## Comportamiento Actual

- `system.md` define los principios visuales obligatorios.
- `frontend/src/styles.scss` contiene estilos globales y tokens/patrones de página.
- `app-page-loader` representa carga de pantalla.
- `app-empty-state` representa estados vacíos.
- `app-stat-card`, `app-entity-card` y `app-entity-column` estructuran tarjetas y columnas reutilizables.
- `app-circuit-evolution-chart` visualiza evolución/comparación de registros.
- Pipes compartidos cubren URLs seguras y valores únicos.
- Componentes de imagen cubren cropper/dialog.

## Contratos

- Diseño: `system.md`.
- Estilos globales: `frontend/src/styles.scss`.
- Componentes: `frontend/src/app/shared/components/`.
- Pipes: `frontend/src/app/shared/pipes/`.

## Criterios de Aceptación Baseline

- Las pantallas nuevas deben reutilizar loader y empty state.
- Las pantallas CRUD deben seguir estructura visual homogénea.
- Los botones, cards y tablas deben seguir tokens y patrón de `system.md`.
- Los componentes compartidos no deben romper consumidores existentes.

## Riesgos / Gaps

- Hay variaciones históricas de estilos por módulo.
- Falta una librería de tabla compartida formal aunque `system.md` lo recomienda.
- Cualquier cambio visual amplio debe auditar desktop/móvil.
