# Plan Técnico: Notifications and Reminders

Spec: ./spec.md
Estado: Baseline

## Backend

- `Notification` almacena title, message, type, read state y user.
- `check_notifications` consulta vehículos con fechas próximas.
- Deduplicación por títulos creados hoy.

## Frontend

- `NotificationService` mantiene estado y llamadas.
- `Notifications` muestra listado.
- Header puede consumir contador/estado.

## Notas de Evolución

- Scheduler automático requiere spec e infraestructura.
- Configurar umbral por usuario enlazaría con settings.
