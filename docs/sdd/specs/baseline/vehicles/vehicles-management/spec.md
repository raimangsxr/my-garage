# Spec: Vehicles Management

Estado: Baseline
Fecha: 2026-05-04
Tipo: baseline/vehicles

## Resumen

Gestión principal de vehículos: listado paginado, creación, edición, borrado, imagen, datos legales y especificaciones básicas.

## Comportamiento Actual

- `/vehicles` muestra la lista de vehículos.
- Backend expone `GET/POST/PUT/DELETE /api/v1/vehicles`.
- El listado devuelve `items`, `total`, `skip` y `limit`.
- La matrícula es única e indexada.
- El vehículo conserva marca, modelo, año, kilómetros, tipo de uso y fechas legales: ITV, seguro e impuesto.
- La imagen se almacena como binario y se sirve vía `/api/v1/vehicles/{id}/image`.
- Crear/editar puede incluir specs básicas asociadas.

## Contratos

- Modelo: `backend/app/models/vehicle.py`.
- Specs: `backend/app/models/vehicle_specs.py`.
- Endpoints: `backend/app/api/v1/endpoints/vehicles.py`.
- Servicio frontend: `frontend/src/app/core/services/vehicle.service.ts`.
- UI lista/dialog: `frontend/src/app/features/vehicles/`.

## Criterios de Aceptación Baseline

- Usuario autenticado puede listar vehículos.
- Usuario autenticado puede crear vehículo con matrícula única.
- Usuario autenticado puede editar datos del vehículo.
- Usuario autenticado puede borrar vehículo.
- Imagen subida queda disponible como URL de API.

## Riesgos / Gaps

- La validación de tipo/tamaño de imagen es mínima.
- Borrado de vehículos puede afectar relaciones; revisar cascadas antes de cambios.
- El listado no documenta búsqueda/ordenación avanzada como feature actual.
