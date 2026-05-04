# Spec: Notifications and Reminders

Estado: Baseline
Fecha: 2026-05-04
Tipo: baseline/operations

## Resumen

Sistema de avisos para eventos próximos de vehículos: ITV, seguro e impuesto de circulación.

## Comportamiento Actual

- `/notifications` muestra avisos del usuario actual.
- Backend expone `GET /api/v1/notifications`, `PUT /{id}/read`, `PUT /{id}/unread` y `POST /check`.
- `check` genera notificaciones para eventos de vehículo dentro de 30 días.
- Evita duplicados por título dentro del día actual.
- Las notificaciones pertenecen a usuario.
- Header/servicio pueden cargar y marcar estado leído/no leído.

## Contratos

- Modelo: `backend/app/models/notification.py`.
- Endpoints: `backend/app/api/v1/endpoints/notifications.py`.
- Servicio frontend: `frontend/src/app/core/services/notification.service.ts`.
- UI: `frontend/src/app/features/notifications/notifications/`.
- Fuente de fechas: `Vehicle.next_itv_date`, `next_insurance_date`, `next_road_tax_date`.

## Criterios de Aceptación Baseline

- Usuario autenticado ve solo sus notificaciones.
- Puede marcar leída/no leída.
- Check genera avisos próximos de ITV, seguro e impuesto.
- No duplica avisos del mismo día por título.

## Riesgos / Gaps

- Las notificaciones se generan bajo demanda, no por scheduler.
- El umbral de 30 días está hardcoded.
- Tipos y mensajes están en inglés aunque parte del producto/documentación está en español.
