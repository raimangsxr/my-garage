# Plan Técnico: Invoice Review and Approval

Spec: ./spec.md
Estado: Baseline

## Backend

- `InvoiceExtractedData` define estructura editable.
- Endpoints validan estado `review`.
- `InvoiceApprovalService.approve` crea/vincula entidades.

## Frontend

- `InvoiceReviewComponent` construye form reactivo.
- `InvoiceService` lee/actualiza/approve/reject.
- Preview usa archivo original.

## Datos

- Aprobación impacta `Invoice`, `Supplier`, `Maintenance`, `Part` y `Vehicle`.

## Notas de Evolución

- Cambios en extracción deben actualizar schema, formulario y approval service juntos.
- Reglas contables/impuestos requieren spec específica.
