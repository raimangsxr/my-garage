# Plan Técnico: Unificar Storage Backend en Media

Spec: [./spec.md](./spec.md)
Estado: In Progress
Fecha: 2026-05-09

## Enfoque

Sustituir el directorio y endpoint públicos por defecto de `uploads` a `media`, manteniendo una capa de compatibilidad para rutas legacy ya persistidas y alineando documentación y tooling local.

## Impacto por Capa

### Backend

- Modelos: sin cambios estructurales.
- Schemas: sin cambios estructurales.
- Servicios: `backend/app/core/storage.py`, `backend/app/services/invoice_workflow_service.py`, `backend/app/services/vehicle_document_rag_service.py`
- Endpoints: `backend/app/main.py`, `backend/app/api/v1/endpoints/invoices.py`, `backend/app/api/v1/endpoints/vehicle_rag.py`
- Migraciones: no

### Frontend

- Rutas: no aplica
- Servicios: no aplica
- Componentes: no aplica
- Estilos: no aplica
- Componentes compartidos: no aplica

### Datos

- Nuevos campos/tablas: ninguno
- Índices: ninguno
- Backfill: no se ejecuta; compatibilidad en runtime
- Compatibilidad: las URLs antiguas `/uploads/...` siguen resolviendo contra el mismo almacenamiento físico

### Seguridad

- Autenticación/autorización: sin impacto
- Datos sensibles: sin impacto adicional
- Logs: sin cambios

### IA/Integraciones Externas

- Integración: no aplica
- Estados de error: se mantienen
- Retry/fallback: no aplica

## Cambios de Contrato

| Contrato | Cambio | Consumidores | Compatibilidad |
| --- | --- | --- | --- |
| `file_url` de documentos nuevos | pasa de `/uploads/...` a `/media/...` | frontend, links públicos, servicios backend | compatible con soporte legacy |

## Estrategia de Implementación

1. Crear la spec SDD e indexarla en `docs/sdd/specs/index.md`.
2. Cambiar el storage por defecto y los mount points públicos del backend a `media`.
3. Añadir resolución compatible para `file_url` legacy y ajustar referencias de documentación/config local.
4. Ejecutar pruebas razonables de backend y documentar checks no ejecutados.

## Estrategia de Pruebas

- Unitarias: cubrir `StorageService.save_file` y resolución de rutas legacy.
- Integración backend: validar que el backend sirve `/media/...`.
- Frontend: no aplica
- Manual/UI: comprobación de proxy local para `/media`.
- Migración: no aplica

## Riesgos

- Registros existentes con `/uploads/...`: mitigado manteniendo mount legacy y resolvedores compatibles.
- Entorno local frontend sin proxy `/media`: mitigado actualizando `frontend/proxy.conf.json`.

## Rollback

Revertir mounts y rutas por defecto a `uploads`, conservando los archivos creados en `media` o moviéndolos operativamente si fuese necesario.

## Observabilidad

- Logs esperados: warnings existentes si un borrado físico falla
- Errores esperados: `404` al acceder a archivo inexistente, `400` por extensión inválida
- Métricas/manual checks: petición HTTP directa a `/media/...`
