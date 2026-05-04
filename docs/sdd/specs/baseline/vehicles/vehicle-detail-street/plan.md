# Plan Técnico: Vehicle Detail Street

Spec: ./spec.md
Estado: Baseline

## Backend

- `GET /vehicles/{id}/details` usa eager loading de specs, mantenimientos, partes, facturas y track records.
- Serializa estructuras anidadas manualmente.

## Frontend

- `VehicleDetailComponent` coordina estado y acciones.
- Componentes hijos renderizan hero, stats, timelines, parts e invoice cards.

## Notas de Evolución

- Cambios de relaciones deben mantener respuesta detalle.
- Nuevas secciones deben revisar densidad visual en desktop/móvil.
