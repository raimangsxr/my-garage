# Spec: Maintenance Management

Estado: Baseline
Fecha: 2026-05-04
Tipo: baseline/operations

## Resumen

Gestión de registros de mantenimiento: listado paginado, búsqueda, ordenación, detalle, creación, edición y borrado.

## Comportamiento Actual

- `/maintenance` muestra mantenimientos.
- Backend expone `GET /api/v1/maintenance`, `GET /{id}`, `POST`, `PUT`, `DELETE`.
- El listado soporta `skip`, `limit`, búsqueda `q`, `sort_by` y `sort_dir`.
- Búsqueda cubre descripción, vehículo, matrícula y proveedor.
- La respuesta incluye vehículo, proveedor y piezas relacionadas.
- Mantenimiento conserva fecha, descripción, kilometraje, coste, vehículo y proveedor.

## Contratos

- Modelo: `backend/app/models/maintenance.py`.
- Endpoints: `backend/app/api/v1/endpoints/maintenance.py`.
- Servicio frontend: `frontend/src/app/core/services/maintenance.service.ts`.
- UI: `frontend/src/app/features/maintenance/`.
- Diálogo: `maintenance-dialog`.

## Criterios de Aceptación Baseline

- Usuario autenticado puede listar y filtrar mantenimientos.
- Usuario autenticado puede crear, editar y borrar.
- Detalle incluye vehículo, proveedor y piezas.
- Ordenación/paginación devuelven total.

## Riesgos / Gaps

- Crear mantenimiento no crea piezas asociadas en el mismo endpoint.
- La respuesta usa dicts manuales.
- Cambios de facturas pueden crear mantenimientos automáticamente.
