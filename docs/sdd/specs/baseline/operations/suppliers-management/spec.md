# Spec: Suppliers Management

Estado: Baseline
Fecha: 2026-05-04
Tipo: baseline/operations

## Resumen

Gestión de proveedores para piezas, mantenimientos y facturas.

## Comportamiento Actual

- `/suppliers` muestra proveedores.
- Backend expone `GET /api/v1/suppliers`, `POST`, `PUT`, `DELETE`.
- Listado soporta paginación, búsqueda y ordenación.
- Búsqueda cubre nombre, email, teléfono, dirección y tax id.
- Proveedor conserva nombre, contacto, dirección y NIF/CIF.
- Facturas aprobadas pueden crear o vincular proveedores.

## Contratos

- Modelo: `backend/app/models/supplier.py`.
- Endpoints: `backend/app/api/v1/endpoints/suppliers.py`.
- Servicio frontend: `frontend/src/app/core/services/supplier.service.ts`.
- UI: `frontend/src/app/features/suppliers/`.
- Diálogo: `supplier-dialog`.

## Criterios de Aceptación Baseline

- Usuario autenticado puede listar proveedores.
- Usuario autenticado puede crear, editar y borrar.
- Búsqueda encuentra por campos principales.
- Proveedor puede relacionarse con piezas, mantenimientos y facturas.

## Riesgos / Gaps

- Borrado de proveedor con relaciones puede fallar o dejar datos sin referencia según constraints.
- No hay deduplicación avanzada de proveedores.
- Tax ID se usa como dato, no como clave única documentada.
