# Quality Gates

Usa esta lista como revisión mínima antes de considerar lista una iniciativa SDD.

## Producto

- La spec describe el problema del usuario, no solo la solución técnica.
- El alcance y fuera de alcance son explícitos.
- Los criterios de aceptación son observables.
- Los casos límite están documentados.
- El impacto en dashboard, detalle de vehículo y notificaciones está declarado cuando aplica.

## Frontend

- Respeta `system.md`.
- Reutiliza o extiende componentes compartidos antes de crear uno nuevo.
- Tiene estados de carga, vacío y error.
- Los formularios muestran validación clara.
- Las acciones destructivas piden confirmación.
- El responsive está revisado en móvil y desktop.
- Los servicios Angular reflejan el contrato real de API.

## Backend

- Los endpoints mantienen prefijo `/api/v1`.
- Los modelos SQLModel tienen índices en campos consultados frecuentemente.
- Las migraciones Alembic son necesarias, reversibles dentro de lo razonable y no destruyen datos sin plan.
- Los errores esperados usan excepciones/controladores existentes.
- Las operaciones con archivos o IA tienen estados persistentes y recuperación razonable.
- Los endpoints privados requieren usuario autenticado cuando corresponde.

## Datos y Migraciones

- El plan indica si hay migración.
- Se define estrategia de backfill si existen datos previos.
- Se revisa compatibilidad con datos nulos/legacy.
- Se contempla rollback operativo o mitigación.

## Pruebas

- Hay pruebas unitarias o de integración para la lógica nueva cuando el riesgo lo justifica.
- Los flujos críticos tienen al menos verificación manual documentada si no hay test automatizado.
- Los cambios de contrato backend/frontend se prueban juntos.
- Se documentan checks no ejecutados.

## Seguridad y Privacidad

- No se exponen secretos ni `.env`.
- No se registran tokens, datos sensibles ni documentos completos en logs.
- La carga de archivos valida tipo/tamaño cuando el flujo lo requiera.
- Las integraciones externas declaran errores, timeouts y fallback.

## PR

- El PR enlaza la spec.
- El PR enlaza ADRs si existen.
- El PR resume pruebas ejecutadas.
- El PR explica migraciones y pasos manuales.
- El PR incluye capturas o notas visuales si toca UI.
