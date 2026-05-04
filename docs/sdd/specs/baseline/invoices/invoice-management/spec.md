# Spec: Invoice Management

Estado: Baseline
Fecha: 2026-05-04
Tipo: baseline/invoices

## Resumen

Gestión general de facturas: listado, filtros, detalle, estados, upload como entrada del flujo y borrado.

## Comportamiento Actual

- `/invoices` muestra facturas paginadas.
- Backend expone `GET /api/v1/invoices`, `GET /{id}` y `DELETE /{id}`.
- Listado soporta `skip`, `limit`, búsqueda `q`, filtro `status`, `sort_by` y `sort_dir`.
- La respuesta incluye vehículo y proveedor anidados cuando existen.
- Estados soportados: `pending`, `processing`, `review`, `approved`, `failed`.
- Borrado elimina archivo y, si está aprobada, intenta limpiar piezas/mantenimientos asociados.
- Detalle de factura está disponible en `/invoices/:id`.

## Contratos

- Modelo: `backend/app/models/invoice.py`.
- Endpoints: `backend/app/api/v1/endpoints/invoices.py`.
- Servicio frontend: `frontend/src/app/core/services/invoice.service.ts`.
- UI listado/detalle: `frontend/src/app/features/invoices/`.

## Criterios de Aceptación Baseline

- Usuario autenticado puede listar facturas.
- Usuario autenticado puede filtrar por estado y buscar.
- Usuario autenticado puede abrir detalle.
- Usuario autenticado puede borrar factura y archivo asociado.

## Riesgos / Gaps

- Borrado de facturas aprobadas puede eliminar mantenimientos creados por el flujo.
- La relación mantenimiento-factura se deriva vía piezas.
- Estados de factura son críticos para flujos IA/revisión.
