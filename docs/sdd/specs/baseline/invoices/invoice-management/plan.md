# Plan Técnico: Invoice Management

Spec: ./spec.md
Estado: Baseline

## Backend

- `Invoice` conserva archivo, estado, extracted_data, error, vehículo/proveedor.
- Listado usa joins con Vehicle y Supplier para ordenar/serializar.
- Delete combina DB y storage.

## Frontend

- `InvoiceService` gestiona listado, detalle y delete.
- `InvoicesComponent` muestra lista/filtros.
- `InvoiceDetailComponent` muestra detalle.

## Notas de Evolución

- Cambios de estado requieren revisar AI processing y review approval.
- Borrado seguro de aprobadas merece spec si se endurece.
