# Spec: Invoice Review and Approval

Estado: Baseline
Fecha: 2026-05-04
Tipo: baseline/invoices

## Resumen

Revisión manual de datos extraídos de factura y aprobación para crear registros de proveedor, mantenimiento y piezas.

## Comportamiento Actual

- `/invoices/review/:id` carga datos con `GET /api/v1/invoices/{id}/extracted-data`.
- Solo facturas en estado `review` permiten obtener o actualizar datos extraídos.
- UI permite corregir información general, proveedor, vehículo, kilometraje, mantenimientos y piezas.
- Valida visualmente subtotal + IVA vs total.
- `PUT /{id}/extracted-data` guarda correcciones.
- `POST /{id}/approve` aprueba la factura y crea registros mediante `InvoiceApprovalService`.
- `POST /{id}/reject` relanza extracción detallada.
- Se muestra preview de factura original.

## Contratos

- Endpoints review/approve/reject: `backend/app/api/v1/endpoints/invoices.py`.
- Approval service: `backend/app/services/invoice_approval_service.py`.
- Schema: `backend/app/schemas/invoice_processing.py`.
- UI: `frontend/src/app/features/invoices/invoice-review/`.
- Servicios relacionados: vehicles, suppliers, maintenance, parts.

## Criterios de Aceptación Baseline

- Factura en `review` muestra datos extraídos.
- Usuario puede corregir y guardar datos.
- Aprobación crea registros derivados y marca factura como aprobada.
- Facturas fuera de `review` no permiten edición/aprobación.

## Riesgos / Gaps

- Aprobación combina múltiples entidades y debe ser transaccional.
- Deduplicación de proveedores/piezas depende de lógica de servicio.
- Cualquier cambio de schema extraído afecta UI y aprobación.
