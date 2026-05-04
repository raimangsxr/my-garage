# Plan Técnico: Suppliers Management

Spec: ./spec.md
Estado: Baseline

## Backend

- `SupplierBase/Read` definen contrato.
- Listado no carga relaciones para mantenerlo ligero.
- CRUD directo desde endpoint.

## Frontend

- `SupplierService` consume API.
- `SuppliersComponent` lista y filtra.
- `SupplierDialogComponent` edita datos.

## Notas de Evolución

- Deduplicación o merge de proveedores necesita spec propia.
- Cambios de tax id afectan facturas y extracción IA.
