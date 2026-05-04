# Spec: Invoice AI Processing

Estado: Baseline
Fecha: 2026-05-04
Tipo: baseline/invoices

## Resumen

Subida y procesamiento de facturas con Gemini para extraer datos estructurados de factura, proveedor, vehículo, mantenimiento y piezas.

## Comportamiento Actual

- `/invoices/upload` permite subir archivo y opcionalmente asociar vehículo.
- Backend `POST /api/v1/invoices/upload` guarda archivo y crea factura en `pending`.
- Se lanza background task que procesa con Gemini.
- La API key de Gemini se resuelve desde settings del usuario o configuración del servidor.
- El processor actualiza estado a `processing`, `review` o `failed`.
- Datos extraídos se guardan como JSON en `Invoice.extracted_data`.
- `POST /{id}/retry` reintenta facturas fallidas.
- `POST /{id}/reject` solicita reprocesamiento detallado desde revisión.

## Contratos

- Upload/retry/reject: `backend/app/api/v1/endpoints/invoices.py`.
- Storage: `backend/app/core/storage.py`.
- Gemini: `backend/app/core/gemini_service.py`.
- Processor: `backend/app/core/invoice_processor.py`.
- Workflow: `backend/app/services/invoice_workflow_service.py`.
- Schema: `backend/app/schemas/invoice_processing.py`.
- UI upload: `frontend/src/app/features/invoices/invoice-upload/`.

## Criterios de Aceptación Baseline

- Subida válida crea factura y archivo.
- Procesamiento exitoso deja factura en `review`.
- Error deja factura en `failed` con mensaje.
- Retry/reject relanzan procesamiento cuando el estado lo permite.

## Riesgos / Gaps

- Procesamiento depende de servicio externo y cuotas.
- Background task no usa cola persistente.
- La calidad de extracción puede requerir revisión humana.
- Archivos PDF/imágenes deben validarse cuidadosamente si se amplía.
