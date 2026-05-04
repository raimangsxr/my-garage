# Plan Técnico: Invoice AI Processing

Spec: ./spec.md
Estado: Baseline

## Backend

- `StorageService.save_file` persiste archivo.
- `InvoiceProcessor` coordina extracción y estados.
- `GeminiService` llama al modelo externo.
- `InvoiceWorkflowService` resuelve API key y prepara retry/reject.

## Frontend

- `InvoiceUploadComponent` sube archivo.
- `InvoiceService.uploadInvoice`, `retryInvoice`, `rejectInvoice` y `pollInvoiceStatus` gestionan flujo.

## Notas de Evolución

- Cola durable, progreso o auditoría requieren spec propia.
- Cambios de prompt/esquema de extracción deben versionarse.
