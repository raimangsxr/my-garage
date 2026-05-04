# Plan Técnico: Parts Inventory

Spec: ./spec.md
Estado: Baseline

## Backend

- `PartBase` define campos y FKs.
- Listado usa `selectinload(Part.supplier)`.
- CRUD directo no orquesta mantenimientos.

## Frontend

- `PartService` gestiona API.
- `PartsComponent` renderiza listado.
- `PartDialogComponent` captura formulario.

## Notas de Evolución

- Inventario real con entradas/salidas requeriría nuevo modelo.
- Cambios de precio/cantidad deben considerar histórico de facturas.
