# Spec: Homogeneizar Interfaz y Sistema de Diseño

Estado: In Progress
Fecha: 2026-05-04
Tipo: docs/refactor-ui
Owner: Codex

## Resumen

Auditar la interfaz existente de My Garage, ampliar el sistema de diseño cuando no sea suficientemente concreto y preparar una ruta de homogeneización para que componentes, pantallas y matices visuales dependan explícitamente de `system.md`.

## Problema

La aplicación creció mediante iteraciones discretas y vibe coding. Aunque ya existe un sistema visual global (`system.md`, `mg-page`, `mg-table`, `mg-surface-card`), convive con componentes locales que resuelven problemas similares de forma distinta: tablas, cards, columnas, empty states, acciones icon-only, headers, overlays de carga, colores y microinteracciones.

Esto dificulta mantener una interfaz consistente y aumenta el coste de cualquier cambio visual.

## Objetivos

- Auditar las pantallas y componentes existentes contra `system.md`.
- Identificar componentes duplicados o solapados.
- Ampliar `system.md` con reglas accionables para futuros refactors.
- Definir una estrategia de refactor por fases con bajo riesgo.
- Crear una base SDD para que cada cambio visual futuro referencie secciones concretas del sistema.

## Fuera de Alcance

- Refactorizar toda la UI en esta primera iteración.
- Cambiar flujos funcionales, datos o contratos API.
- Rediseñar marca, logo o assets.
- Introducir una nueva librería de diseño.

## Requisitos Funcionales

- RF-1: La auditoría debe listar patrones duplicados o inconsistentes.
- RF-2: `system.md` debe definir criterios de reutilización/extensión de componentes.
- RF-3: El plan debe proponer fases de trabajo accionables.
- RF-4: Las futuras excepciones visuales deben poder citar una sección de `system.md`.

## Requisitos No Funcionales

- Mantenibilidad: los cambios deben favorecer componentes compartidos.
- Accesibilidad: icon buttons, focus, semántica y estados deben ser verificables.
- Consistencia: colores, sombras, radios y densidad deben derivar de tokens.
- Riesgo bajo: refactorizar primero componentes compartidos y módulos CRUD repetitivos.

## Criterios de Aceptación

- CA-1: Dado un módulo CRUD, cuando se diseñe o refactorice, entonces existe una referencia clara al patrón estándar de página/listado/tabla.
- CA-2: Dado un componente local que replica cards/listas/tablas, cuando se planifique su refactor, entonces el plan indica si se migra a un componente compartido o se justifica una excepción.
- CA-3: Dado un icon-only button, cuando se revise la UI, entonces debe tener `aria-label` y tooltip cuando el icono no sea autoevidente.
- CA-4: Dado un color/spacing/shadow nuevo, cuando se revise el PR, entonces debe mapearse a token o documentar excepción.

## Pruebas Esperadas

- Documentación: revisar enlaces y secciones nuevas en `system.md`.
- Auditoría estática: revisar HTML/SCSS con búsquedas de patrones.
- Frontend: ejecutar build/test razonable cuando haya cambios HTML/SCSS.

## Decisiones Relacionadas

- Baseline: `docs/sdd/specs/baseline/platform/shared-ui-system/spec.md`.
- Sistema: `system.md`.
