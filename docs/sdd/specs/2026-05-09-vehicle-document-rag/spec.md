# Spec: RAG de Documentación de Vehículo

Estado: Implemented
Fecha: 2026-05-09
Tipo: feature
Owner: Codex

## Resumen

Añadir una capacidad de gestión documental y consulta asistida por IA para cada vehículo, de forma que el usuario pueda subir manuales y otros documentos, convertirlos en conocimiento explotable y hacer preguntas con respuestas trazables a la fuente.

## Problema

La aplicación ya concentra datos operativos del garaje, pero la documentación técnica del vehículo sigue viviendo fuera del producto y no se puede consultar junto al contexto real de mantenimientos, piezas, facturas y specs. Esto obliga al usuario a buscar en PDFs externos, repetir consultas y trasladar manualmente información útil como pares de apriete, capacidades o intervalos de servicio.

## Usuarios y Contexto

- Usuario principal: propietario o gestor del garaje que mantiene uno o varios vehículos.
- Contexto de uso: detalle de vehículo, revisión de documentación técnica, consulta antes de mantenimiento o compra de piezas.
- Frecuencia esperada: recurrente, especialmente antes de mantenimiento, diagnóstico o consulta de specs.

## Objetivos

- Permitir gestionar la documentación asociada a cada vehículo dentro del detalle del vehículo.
- Permitir hacer preguntas sobre esa documentación con respuestas citadas y contexto del vehículo.
- Permitir transformar conocimiento útil derivado de documentos en facts reutilizables dentro de la aplicación.

## Fuera de Alcance

- Chat general sin contexto de vehículo para toda la aplicación en la primera versión.
- Extracción perfecta o automática de todos los facts a modelos operativos sin validación humana.
- OCR avanzado multiidioma o pipelines especializados para manuales escaneados de baja calidad en la primera fase.
- Sustituir el flujo existente de facturas; la documentación de facturas se integra, no se rehace.

## Comportamiento Esperado

### Escenario Principal

1. El usuario abre `/vehicles/:id` y accede a un nuevo modo `Docs & AI`.
2. En la pestaña `Documents` sube uno o varios documentos del vehículo y ve su estado de ingesta.
3. Cuando la indexación termina, el usuario abre `Ask` y formula una pregunta sobre mantenimiento, especificaciones o procedimientos.
4. La aplicación responde con texto útil, citas al documento origen y acceso a la fuente.
5. El usuario puede revisar `Knowledge` para ver facts extraídos y gestionarlos dentro del vehículo.

### Casos Límite

- Documento subido pero no indexado: no debe aparecer como fuente disponible para chat hasta estar `ready`.
- Documento fallido: debe mostrarse error claro y opción de reintento.
- Vehículo sin documentación: debe mostrarse empty state con CTA de subida, no un chat vacío ambiguo.
- Respuesta sin suficiente contexto: el chat debe reconocer baja confianza y sugerir revisar o ampliar documentos, sin inventar contenido.
- Respuesta sin suficiente contexto en pregunta multilingüe: el mensaje de baja confianza debe mantenerse en el idioma de la pregunta del usuario, aunque no existan citas recuperadas.
- Documento excluido del chat: sigue siendo visible en gestión documental, pero no participa en recuperación.

## Requisitos Funcionales

- RF-1: el detalle de vehículo debe incorporar un nuevo modo `Docs & AI` sin degradar los modos `Street` y `Track`.
- RF-2: el usuario debe poder subir, listar, ver estado, excluir del chat, reindexar y eliminar documentos por vehículo.
- RF-2.1: la subida de documentación de vehículo debe permitir manuales grandes sin un límite fijo de 10MB en aplicación.
- RF-3: la aplicación debe soportar al menos tipos documentales `owner_manual`, `workshop_manual`, `invoice`, `insurance`, `registration` y `other`.
- RF-4: cada documento debe tener estados observables de ingesta al menos `uploaded`, `indexing`, `ready`, `failed`.
- RF-5: el sistema debe generar chunks consultables de la documentación lista para RAG.
- RF-5.1: los embeddings de chunks deben persistirse en PostgreSQL mediante `pgvector`, de forma consultable por similitud sin depender de ranking en memoria del backend.
- RF-6: el usuario debe poder formular preguntas acotadas al vehículo y obtener respuestas con citas por documento y referencia de página o sección cuando exista.
- RF-6.1: el bloque `Ask` debe tolerar consultas en un idioma distinto al de la documentación y responder en el idioma del usuario cuando exista evidencia suficiente en las fuentes.
- RF-6.2: cuando el retrieval no encuentre evidencia suficiente, el bloque `Ask` debe devolver también el mensaje de baja confianza en el idioma de la pregunta del usuario.
- RF-6.3: cuando una cita apunte a un PDF con número de página, el click en la referencia debe abrir el documento directamente en esa página.
- RF-7: el usuario debe poder ver y gestionar facts de conocimiento derivados de documentos del vehículo.
- RF-8: el usuario debe poder ocultar o eliminar conocimiento derivado sin necesidad de borrar el documento fuente.
- RF-9: las facturas ya asociadas al vehículo deben poder participar como fuente documental opcional sin duplicar registros documentales visibles.
- RF-10: el sistema debe registrar suficiente metadata para saber qué fuentes intervinieron en cada respuesta.

## Requisitos No Funcionales

- Rendimiento: el detalle de vehículo no debe cargar chunks ni contenido pesado en la llamada base; los datos RAG deben consultarse bajo demanda.
- Rendimiento: la subida de documentos grandes debe realizarse en streaming a disco, evitando cargar el fichero completo en memoria de aplicación.
- Rendimiento: la recuperación de chunks para `Ask` debe ejecutarse en la base de datos y no cargar el corpus completo del vehículo en memoria de aplicación para rankearlo.
- Seguridad: solo usuarios autenticados podrán gestionar y consultar documentos de sus vehículos; no se deben exponer claves ni contenido sensible en logs.
- Accesibilidad: gestión documental y chat deben mantener navegación por teclado, foco visible y labels accesibles en acciones icon-only.
- Responsive: `Docs & AI` debe ser usable en desktop y móvil, con prioridad a lectura, filtros y acciones principales.
- Observabilidad: registrar upload, inicio/fin de indexación, fallo de ingesta, pregunta enviada, fuentes recuperadas y errores del proveedor IA.

## UX y Diseño

- Referencia visual: `system.md`
- Pantallas afectadas: `/vehicles/:id`, posible reutilización de patrones de `/invoices/upload` y `/settings`
- Estados requeridos: loading | empty | error | success | disabled | indexing
- Componentes compartidos a reutilizar/extender: `app-page-loader`, `app-empty-state`, `app-entity-column`, `app-entity-card`, patrones `mg-page`, `mg-surface-card`, tabla/listado denso
- Capturas/mockups: pendiente

### Propuesta de Visualización

- Añadir un tercer modo `Docs & AI` junto a `Street` y `Track` en el detalle de vehículo.
- Dentro del modo, usar tres pestañas:
  - `Documents`: biblioteca documental del vehículo
  - `Knowledge`: facts derivados y gestionables
  - `Ask`: chat contextual al vehículo
- Añadir CTA destacado `Ask this vehicle` en el hero o en la cabecera del modo para hacer visible la capacidad sin convertirla en un módulo separado en esta fase.

## Contratos de Datos

### Backend/API

- Endpoint(s):
  - `POST /api/v1/vehicles/{id}/documents/upload`
  - `GET /api/v1/vehicles/{id}/documents`
  - `PATCH /api/v1/vehicle-documents/{id}`
  - `DELETE /api/v1/vehicle-documents/{id}`
  - `POST /api/v1/vehicle-documents/{id}/reindex`
  - `GET /api/v1/vehicles/{id}/knowledge`
  - `PATCH /api/v1/vehicle-knowledge/{id}`
  - `DELETE /api/v1/vehicle-knowledge/{id}`
  - `POST /api/v1/vehicles/{id}/chat/ask`
- Request:
  - upload multipart con archivo y `document_type`
  - ask con `question`, `source_scope` y opcionalmente `include_invoice_docs`
- Response:
  - listas paginables de documentos y facts
  - respuesta de chat con `answer`, `citations`, `used_documents`, `confidence_note`
- Errores esperados:
  - `400` archivo inválido o payload inválido
  - `404` vehículo o documento inexistente
  - `409` reindexación incompatible con estado actual
  - `422` pregunta vacía o tipo documental no permitido
  - `502/503` error o timeout de proveedor IA

### Frontend

- Servicio(s):
  - nuevo servicio documental de vehículo
  - nuevo servicio de chat RAG por vehículo
  - extensión de `VehicleService` para contadores o summaries si aplica
- Interface(s):
  - `VehicleDocument`
  - `VehicleKnowledgeFact`
  - `VehicleChatRequest`
  - `VehicleChatResponse`
- Estado local/global:
  - estado local en el detalle de vehículo con cargas independientes por pestaña
  - historial de chat scoped por vehículo mantenido en memoria del componente durante la sesión de UI

## Migraciones

- Requiere migración: sí
- Backfill: no aplica en esta implementación; las facturas participan como fuente lógica opcional en chat sin materializarse como `vehicle_document`
- Compatibilidad con datos existentes: debe mantenerse total para flujos de vehículos, facturas y mantenimiento ya existentes
- Compatibilidad con datos existentes: la migración a `pgvector` puede invalidar chunks y conocimiento derivado existentes si se tratan como datos reconstruibles de prueba, siempre que conserve los documentos origen y fuerce reindexación limpia.

## Criterios de Aceptación

- CA-1: Dado un vehículo con documentos listos, cuando el usuario abre `Ask` y formula una pregunta, entonces recibe una respuesta con al menos una cita a documentos del vehículo.
- CA-2: Dado un vehículo sin documentos, cuando el usuario abre `Docs & AI`, entonces ve un empty state claro con CTA para subir documentación.
- CA-3: Dado un documento recién subido, cuando la indexación termina correctamente, entonces aparece con estado `ready` y queda disponible para chat.
- CA-4: Dado un documento en estado `failed`, cuando el usuario lo revisa, entonces ve el error y dispone de una acción de reindexado o reintento.
- CA-5: Dado un documento excluido del chat, cuando el usuario pregunta algo, entonces ese documento no figura entre las fuentes usadas.
- CA-6: Dado un fact derivado de documentación, cuando el usuario lo oculta o elimina, entonces deja de mostrarse en `Knowledge` sin borrar el documento fuente.
- CA-7: Dado un vehículo con documentación y facturas, cuando el usuario limita el chat a manuales, entonces las citas solo provienen de esas fuentes.
- CA-8: Dada una pregunta en español cuyo retrieval no encuentra fuentes suficientes, cuando el usuario consulta `Ask`, entonces la respuesta de baja confianza y la nota de confianza se muestran en español.
- CA-9: Dada una respuesta con una cita a un PDF y `page_number`, cuando el usuario pulsa la referencia en `Ask`, entonces se abre el PDF en la página citada.
- CA-10: Dado un vehículo con chunks ya indexados, cuando el sistema migra a `pgvector`, entonces `Ask` sigue recuperando fuentes válidas mediante similitud calculada en PostgreSQL.

## Pruebas Esperadas

- Backend: tests de endpoints documentales, permisos, estados de ingesta y respuesta de chat con citas.
- Frontend: tests de render por pestaña, estados loading/empty/error, filtros y acciones principales.
- Manual/UI: subida, indexación, exclusión, borrado, reindexación y conversación con citas visibles.
- No ejecutable ahora: validación de calidad semántica real del retrieval con corpus variado hasta disponer de documentos de ejemplo representativos.

## Dependencias

- `docs/sdd/README.md`
- `docs/sdd/workflow.md`
- `docs/sdd/quality-gates.md`
- `system.md`
- integración Gemini existente en settings y backend

## Preguntas Abiertas

- Si debemos permitir promover facts concretos a `VehicleSpecs` o `Torque Specs` en una iteración siguiente.

## Decisiones Relacionadas

- ADR: [ADR-0001: Arquitectura Base para RAG de Documentación de Vehículo](../../decisions/0001-vehicle-document-rag-architecture.md)
- ADR: [ADR-0002: Migración de Retrieval Documental a pgvector](../../decisions/0002-vehicle-document-rag-pgvector.md)
