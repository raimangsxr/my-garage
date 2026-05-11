# Plan Técnico: RAG de Documentación de Vehículo

Spec: ./spec.md
Estado: Implemented
Fecha: 2026-05-09

## Enfoque

Implementar un RAG por vehículo como extensión natural del detalle de vehículo existente. La fase inicial prioriza biblioteca documental, pipeline de ingesta/indexación y chat con citas. La extracción de facts operativos y su promoción a modelos compartidos se plantea desde el diseño, pero se puede liberar por fases para reducir riesgo.

La implementación mantiene el stack corto sobre FastAPI + PostgreSQL, usando almacenamiento documental generalizado y `pgvector` en PostgreSQL para persistir embeddings y resolver retrieval por vehículo sin introducir un servicio vectorial externo separado.

## Impacto por Capa

### Backend

- Modelos:
  - nuevo `VehicleDocument`
  - nuevo `VehicleDocumentChunk`
  - nuevo `VehicleKnowledgeFact`
- Schemas:
  - DTOs para documento, fact, cita y ask/answer
- Servicios:
  - servicio de almacenamiento documental generalizado
  - servicio de parsing/chunking
  - servicio de embeddings/retrieval
  - servicio de respuesta RAG con citas
  - ajuste del storage para escrituras en streaming sin límite fijo de 10MB
- Endpoints:
  - nuevos endpoints documentales y chat bajo `/api/v1`
- Migraciones:
  - sí, creación/evolución de tablas documentales, habilitación de `pgvector` y reseteo de datos derivados reconstruibles

### Frontend

- Rutas:
  - sin nueva ruta top-level en fase 1
  - extensión de `/vehicles/:id`
- Servicios:
  - nuevo `vehicle-rag.service.ts`
- Componentes:
  - extensión de `vehicle-detail`
  - nuevo contenedor `vehicle-docs-ai`
  - navegación contextual desde citas del chat hacia el PDF y página citada
- Estilos:
  - SCSS del detalle de vehículo y nuevos componentes del modo `Docs & AI`
- Componentes compartidos:
  - reutilizar `app-page-loader`, `app-empty-state`, `app-entity-card`
  - extender patrón de upload tipo factura para documentos

### Datos

- Nuevos campos/tablas:
  - `vehicle_document`
  - `vehicle_document_chunk`
  - `vehicle_knowledge_fact`
- Índices:
  - `vehicle_id`, `status`, `document_type`, `included_in_rag`
- Backfill:
  - no requerido; chunks, embeddings y facts existentes se resetean y se regeneran desde los documentos origen
- Compatibilidad:
  - sin ruptura para vehículos, facturas, mantenimientos o specs existentes

### Seguridad

- Autenticación/autorización:
  - reutilizar `get_current_active_user` y aplicar scoping por vehículo/documento
- Datos sensibles:
  - evitar logs con contenido completo de documento o prompts enteros
  - cuidar exposición de manuales, matrículas, VIN o datos fiscales
- Logs:
  - registrar metadata operativa, no payloads sensibles

### IA/Integraciones Externas

- Integración:
  - Gemini para generación de respuestas y transcripción/extracción
  - `pgvector` para persistencia y búsqueda por similitud en PostgreSQL
  - embeddings deterministas locales en esta fase, persistidos como `vector`
  - expansión de consulta multilingüe con Gemini para mejorar retrieval cuando la pregunta y la fuente no comparten idioma
  - fallback local de idioma para mensajes sin evidencia, evitando depender del modelo cuando no se recuperan fuentes
- Estados de error:
  - `uploaded/indexing/ready/failed` para documentos
  - mensajes de fallo claros por indexación y por consulta
- Retry/fallback:
  - reindexado manual por documento
  - respuesta de baja confianza cuando retrieval no tenga evidencia suficiente

## Cambios de Contrato

| Contrato | Cambio | Consumidores | Compatibilidad |
| --- | --- | --- | --- |
| `GET /api/v1/vehicles/{id}/details` | puede incorporar contadores o resumen de documentos/knowledge | frontend | compatible |
| Nuevo dominio documental por vehículo | alta, listado, gestión y exclusión de fuentes | frontend/backend | nuevo |
| Nuevo contrato de chat con citas | respuesta estructurada con fuentes | frontend/backend | nuevo |
| Storage documental | pasa de orientado a facturas a reutilizable para documentos de vehículo | backend | compatible si se conserva flujo actual |
| Retrieval documental | pasa de ranking en memoria a ranking SQL con `pgvector` | backend | compatible |

## Estrategia de Implementación

1. Crear modelos, migración y servicio de almacenamiento documental generalizado.
2. Añadir endpoints de subida/listado/gestión documental por vehículo.
3. Ajustar storage para soportar uploads grandes en streaming a disco.
4. Implementar pipeline de parsing, chunking e indexación con estados persistidos.
5. Migrar `vehicle_document_chunk.embedding` a `pgvector`, habilitando la extensión y reseteando chunks/facts reconstruibles.
6. Mover el retrieval del backend a consulta SQL por similitud con `pgvector`.
7. Extender `vehicle-detail` con modo `Docs & AI` y pestaña `Documents`.
8. Implementar retrieval y endpoint `ask` con citas.
9. Implementar pestaña `Ask` con historial de sesión en memoria y fuentes usadas.
10. Implementar pestaña `Knowledge` con facts derivados y acciones básicas de gestión.
11. Evaluar promoción de facts a specs/torque en una fase posterior o limitada.

## Estrategia de Pruebas

- Unitarias:
  - validación de tipos documentales, transición de estados y chunking
  - reglas de exclusión de fuentes del chat
  - idioma del fallback cuando no hay fuentes recuperadas
  - retrieval por similitud con `pgvector`
- Integración backend:
  - upload/listado/reindex/delete
  - ask con citas y permisos correctos
  - comportamiento con documentos fallidos o vehículo sin fuentes
- Frontend:
  - render y navegación entre tabs
  - estados loading/empty/error
  - flujo de subida, exclusión y eliminación
  - render de respuesta con citas
  - apertura de citas PDF en la página indicada
- Manual/UI:
  - pregunta sobre aceite/par de apriete/intervalo con manual cargado
  - exclusión de una fuente y confirmación de que no se cita
  - móvil y desktop en `Docs & AI`
- Migración:
  - alta/evolución de tablas
  - creación de extensión `vector`
  - reseteo de chunks/facts y reindexación posterior desde documentos origen
  - rollback razonable
  - convivencia con facturas ya existentes

## Riesgos

- Calidad insuficiente del retrieval con manuales escaneados o ruidosos:
  mitigación: limitar tipos iniciales, exigir estados claros y añadir reindexado.
- Dependencia de `pgvector` en entornos locales o CI:
  mitigación: documentar instalación, crear migración idempotente y mantener fallback operativo en reindexado.
- Incremento de complejidad en `vehicle-detail`:
  mitigación: encapsular el modo `Docs & AI` en componentes propios y cargas lazy si hace falta.
- Coste o cuota del proveedor IA:
  mitigación: respuestas acotadas, recuperación previa estricta y logging operativo.
- Acoplar demasiado facts derivados a modelos operativos:
  mitigación: separar `knowledge facts` de `vehicle specs` y requerir promoción explícita.
- Sobrecargar la carga inicial del detalle:
  mitigación: no incluir chunks ni historial pesado en `/details`.

## Rollback

Desactivar la UI del modo `Docs & AI`, mantener los endpoints fuera de navegación principal y conservar las tablas sin uso si la funcionalidad debe retirarse rápidamente.

## Observabilidad

- Logs esperados:
  - documento subido
  - indexación iniciada/finalizada/fallida
  - pregunta enviada
  - número de chunks recuperados
  - documentos citados
- Errores esperados:
  - archivo inválido
  - documento sin texto utilizable
  - timeout o cuota del proveedor IA
- Métricas/manual checks:
  - ratio de documentos `ready/failed`
  - tiempos de indexación
  - tiempo de primera respuesta
  - verificación manual de citas y no-alucinación en preguntas de control
