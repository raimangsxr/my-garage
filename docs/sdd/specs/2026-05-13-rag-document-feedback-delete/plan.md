# Plan Técnico: Mejorar Feedback y Borrado de Documentos RAG

Spec: ./spec.md
Estado: In Progress
Fecha: 2026-05-13

## Enfoque

Extender el modelo documental con metadatos de progreso persistido, usar eventos de progreso del cliente HTTP para la subida multipart y endurecer el pipeline backend para tolerar borrados concurrentes. En frontend, el polling pasará a ser silencioso y limitado a documentos, evitando loaders globales, y se retirará temporalmente la pestaña `Knowledge` para concentrar el valor en `Documents` y `Ask`.

## Impacto por Capa

### Backend

- Modelos: `backend/app/models/vehicle_document.py`
- Schemas: `backend/app/api/v1/endpoints/vehicle_rag.py`
- Servicios: `backend/app/services/vehicle_document_rag_service.py`
- Endpoints: `backend/app/api/v1/endpoints/vehicle_rag.py`
- Migraciones: sí, para campos de progreso/cancelación

### Frontend

- Rutas: sin cambios
- Servicios: `frontend/src/app/core/services/vehicle-rag.service.ts`
- Componentes: `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.*`
- Estilos: SCSS del mismo componente
- Componentes compartidos: reutilización de `mg-surface-card` y estados existentes

### Datos

- Nuevos campos:
  - `deletion_requested`
  - `processing_progress`
  - `processing_stage`
  - `processing_detail`
- Índices: no necesarios de inicio
- Backfill: inicializar valores por defecto en filas existentes
- Compatibilidad: la lectura debe tolerar filas previas al despliegue

### Seguridad

- Autenticación/autorización: sin cambios funcionales
- Datos sensibles: mensajes de progreso y error sin contenido documental sensible
- Logs: diferenciar cancelación de error real

### IA/Integraciones Externas

- Integración: Gemini y parsing local existentes
- Estados de error: mover a mensajes persistidos por fase
- Retry/fallback: mantener reindexado manual

## Cambios de Contrato

| Contrato | Cambio | Consumidores | Compatibilidad |
| --- | --- | --- | --- |
| `VehicleDocumentResponse` | añade metadatos de progreso y detalle | frontend | compatible aditivo |
| `uploadDocument` frontend | pasa a observar eventos HTTP para reportar progreso | frontend | compatible interno |
| `DELETE /vehicle-documents/{id}` | trata el borrado como cancelación segura además de limpieza | frontend/backend | compatible |
| `vehicle-docs-ai` | retira `Knowledge` y hace polling silencioso de documentos | frontend | compatible visual |

## Estrategia de Implementación

1. Crear spec, plan, tasks e índice SDD.
2. Añadir campos de progreso/cancelación al modelo documental y migración asociada.
3. Actualizar serialización y utilidades backend para reflejar progreso de procesamiento.
4. Endurecer `process_document` para actualizar fases, abortar si el documento fue borrado y no sobreescribir estado inexistente.
5. Endurecer `delete_vehicle_document` para marcar cancelación, limpiar dependencias y tolerar ausencia del fichero.
6. Cambiar el servicio Angular para observar eventos de subida.
7. Añadir estado local de uploads en progreso y mostrarlo en la UI con progreso, fase y errores persistidos.
8. Cambiar el polling a refresh silencioso y granular solo sobre documentos.
9. Retirar la pestaña `Knowledge` y su refresco asociado de la UI principal.
10. Asegurar que las citas de `Ask` construyen la URL con página para PDFs.
11. Añadir o actualizar tests.

## Estrategia de Pruebas

- Unitarias:
  - transición de progreso por fases
  - cancelación de procesamiento por borrado
  - delete con fichero ausente
- Integración backend:
  - delete de documento en `uploaded/indexing/failed/ready`
  - serialización del nuevo contrato
- Frontend:
  - progreso de subida
  - refresh silencioso sin loaders globales
  - apertura de citas en página concreta
- Manual/UI:
  - subida de PDF grande
  - reindexado que falle
  - borrado de documento mientras indexa
  - click en cita de `Ask` con página
- Migración:
  - aplicar migración hacia delante y comprobar defaults

## Riesgos

- La cancelación lógica puede dejar un pequeño trabajo en background ejecutándose unos segundos más:
  mitigación: hacer comprobaciones de cancelación entre fases y antes de persistir resultados.
- El progreso de procesamiento no será exacto al byte:
  mitigación: comunicar fases y porcentaje aproximado, no ETA exacto.
- La UI puede recargar demasiado por polling:
  mitigación: hacer polling silencioso, fusionar por `id` y evitar loaders durante refresh automático.

## Rollback

Revertir la migración y volver al contrato previo, asumiendo pérdida del detalle de progreso pero manteniendo documentos existentes.

## Observabilidad

- Logs esperados:
  - upload recibido
  - procesamiento fase a fase
  - documento cancelado por borrado
  - documento eliminado con limpieza completada
- Errores esperados:
  - fichero ausente en parseo
  - fallo Gemini/OCR
  - conflicto de documento eliminado durante el proceso
- Métricas/manual checks:
  - progreso visible en UI
  - ausencia de residuos documentales tras delete
