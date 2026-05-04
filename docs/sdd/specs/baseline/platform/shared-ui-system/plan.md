# Plan Técnico: Shared UI System

Spec: ./spec.md
Estado: Baseline

## Frontend

- `system.md` es la fuente de verdad.
- `styles.scss` contiene estilos globales.
- `shared/components` agrupa UI reutilizable.
- `shared/pipes` contiene utilidades de presentación.

## Backend

- Sin impacto directo.

## Notas de Evolución

- Antes de crear nuevo componente visual, revisar si se puede extender uno existente.
- Cambios de tokens deben verificarse en todos los módulos principales.
