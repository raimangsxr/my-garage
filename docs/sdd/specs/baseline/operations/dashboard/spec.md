# Spec: Dashboard

Estado: Baseline
Fecha: 2026-05-04
Tipo: baseline/operations

## Resumen

Vista resumen de My Garage con KPIs, gasto mensual, actividad reciente, resumen de circuitos y acciones rápidas.

## Comportamiento Actual

- `/dashboard` carga estadísticas desde `GET /api/v1/dashboard/stats`.
- Muestra total de vehículos, mantenimientos programados, gasto total y proveedores.
- Muestra actividad reciente de mantenimientos.
- Muestra gasto mensual de los últimos 6 meses.
- Muestra resumen de circuitos: circuitos visitados, track days y mejores tiempos.
- Ofrece acciones rápidas hacia vehículos, mantenimiento, facturas y proveedores.

## Contratos

- Endpoint: `backend/app/api/v1/endpoints/dashboard.py`.
- Servicio frontend: `frontend/src/app/features/dashboard/dashboard.service.ts`.
- UI: `frontend/src/app/features/dashboard/dashboard.component.*`.
- Modelos fuente: Vehicle, Maintenance, Supplier, TrackRecord.

## Criterios de Aceptación Baseline

- Usuario autenticado puede cargar dashboard.
- Error muestra estado recuperable con Retry.
- Sin datos de circuito se muestra empty state compacto.
- Acciones rápidas navegan a módulos correspondientes.

## Riesgos / Gaps

- Agregaciones dependen de fechas y formato de tiempo string.
- Los KPIs son globales, no filtrados por usuario salvo por autenticación general.
- Cambios de métricas deben coordinar frontend/backend.
