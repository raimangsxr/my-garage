# Spec: Parts Inventory

Estado: Baseline
Fecha: 2026-05-04
Tipo: baseline/operations

## Resumen

Inventario de piezas con nombre, referencia, precio, cantidad, proveedor y relaciones con mantenimiento/factura.

## Comportamiento Actual

- `/parts` muestra piezas.
- Backend expone `GET /api/v1/parts`, `POST`, `PUT`, `DELETE`.
- Listado soporta paginación, búsqueda por nombre/referencia y ordenación.
- Cada pieza puede vincularse a mantenimiento, proveedor y factura.
- La respuesta de listado incluye proveedor cuando existe.
- Cantidad admite decimales.

## Contratos

- Modelo: `backend/app/models/part.py`.
- Endpoints: `backend/app/api/v1/endpoints/parts.py`.
- Servicio frontend: `frontend/src/app/core/services/part.service.ts`.
- UI: `frontend/src/app/features/parts/`.
- Diálogo: `part-dialog`.

## Criterios de Aceptación Baseline

- Usuario autenticado puede listar piezas.
- Usuario autenticado puede crear, editar y borrar piezas.
- Búsqueda encuentra por nombre o referencia.
- Piezas vinculadas muestran proveedor en listados.

## Riesgos / Gaps

- Borrar piezas vinculadas puede afectar mantenimientos/facturas.
- Stock real no está modelado como movimientos; `quantity` es campo simple.
- Cambios de facturas pueden crear piezas automáticamente.
