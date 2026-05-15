# Spec: Mejorar Feedback y Borrado de Documentos RAG

Estado: In Progress
Fecha: 2026-05-13
Tipo: hotfix
Owner: Codex

## Resumen

Mejorar la experiencia documental del RAG para que el usuario vea el progreso de subida y procesamiento sin parpadeos, pueda abrir las citas de `Ask` en la página concreta referida y no vea una pestaña `Knowledge` con valor difuso mientras no exista una síntesis realmente ejecutiva.

## Problema

La carga documental actual solo informa de estados gruesos (`uploaded`, `indexing`, `ready`, `failed`) y de forma poco visible. En documentos grandes el usuario no sabe si la subida sigue en curso, si el backend está procesando, cuánto falta o si algo se ha quedado atascado. Además, el polling actual refresca secciones completas y provoca parpadeo visual en el frontend. Por otro lado, las citas de `Ask` no garantizan una apertura consistente en la página exacta del PDF y la pestaña `Knowledge` no aporta todavía una capa ejecutiva suficientemente útil para mantenimiento.

## Usuarios y Contexto

- Usuario principal: propietario o gestor del garaje que sube manuales y documentación grande.
- Contexto de uso: pestaña `Docs & AI` en `/vehicles/:id`.
- Frecuencia esperada: recurrente durante la carga inicial de manuales y documentación histórica.

## Objetivos

- Mostrar al usuario progreso claro durante la subida local del archivo y durante su procesamiento backend.
- Hacer que el borrado documental sea fiable aunque el documento siga indexándose o haya fallado a medias.
- Evitar refrescos visuales completos cuando solo cambia el estado de un documento en indexación.
- Abrir las citas de `Ask` directamente en la página concreta del documento cuando exista referencia paginada.
- Simplificar la experiencia retirando `Knowledge` hasta que exista una versión claramente útil para mantenimiento.

## Fuera de Alcance

- Procesamiento asíncrono distribuido con colas externas.
- OCR incremental por página con progreso real por página.
- Historial global de jobs o panel de observabilidad administrativa.
- Reimaginar `Knowledge` como módulo ejecutivo completo en esta iteración.

## Comportamiento Esperado

### Escenario Principal

1. El usuario selecciona uno o varios documentos en `Docs & AI`.
2. La UI muestra inmediatamente el progreso de subida de cada fichero.
3. Cuando la subida termina, solo la tarjeta del documento afectado actualiza su progreso backend de forma silenciosa y sin parpadeo del resto de la vista.
4. Si el procesamiento falla, el usuario ve el motivo directamente en la tarjeta.
5. Desde `Ask`, al pulsar una cita con página conocida, el PDF se abre en esa página concreta.
6. Si el usuario elimina un documento en cualquier estado, el sistema borra de forma consistente los datos derivados y evita que un proceso en background vuelva a dejar el documento en un estado incoherente.

### Casos Límite

- Documento grande con subida lenta: el usuario debe ver porcentaje de subida y no solo un spinner genérico.
- Documento ya subido pero procesándose: la UI debe mostrar fase actual y refrescarla automáticamente sin loader global ni parpadeo del resto de secciones.
- Documento eliminado mientras el worker lo está procesando: el worker debe abortar sin recrear estado ni devolver error visible al usuario.
- Documento con fichero físico ya ausente: el borrado lógico y de datos derivados debe seguir completándose.
- Documento fallido: el usuario debe ver el error persistido sin depender de un snackbar efímero.
- Cita con página de PDF: debe abrir el documento con fragmento de página válido aunque la URL ya tenga otros fragmentos.

## Requisitos Funcionales

- RF-1: la API documental debe exponer progreso y mensaje de procesamiento por documento.
- RF-2: la UI debe mostrar progreso de subida por fichero durante el `POST` multipart.
- RF-3: la UI debe mostrar progreso de procesamiento backend tras completar la subida.
- RF-4: el borrado debe marcar la eliminación solicitada de forma que cualquier proceso en background detecte la cancelación y termine sin reescribir estado final.
- RF-5: el borrado debe limpiar chunks y knowledge derivados incluso si el documento estaba fallido o incompleto.
- RF-6: el usuario debe ver errores de indexación de forma persistente dentro de la lista documental.
- RF-7: el polling de progreso no debe activar loaders o rerenderizados completos de secciones no afectadas.
- RF-8: la UI debe retirar la pestaña `Knowledge` mientras no haya una propuesta ejecutiva validada.
- RF-9: las citas con `page_number` deben abrir el PDF en esa página exacta.

## Requisitos No Funcionales

- Rendimiento: la solución no debe cargar el archivo completo en memoria solo para informar progreso.
- Seguridad: no se deben exponer rutas internas ni contenido del documento en mensajes de progreso.
- Accesibilidad: los estados de progreso y error deben ser legibles y distinguibles visualmente.
- Responsive: el detalle documental debe seguir siendo usable en móvil.
- Observabilidad: los logs deben diferenciar procesamiento normal, cancelación por borrado y fallo real.

## UX y Diseño

- Referencia visual: `system.md`
- Pantallas afectadas: `frontend/src/app/features/vehicles/components/vehicle-docs-ai/*`
- Estados requeridos: loading | uploading | indexing | ready | failed | deleting | success
- Componentes compartidos a reutilizar/extender: `app-page-loader`, `app-empty-state`, patrones `mg-surface-card`
- Capturas/mockups: no aplica

## Contratos de Datos

### Backend/API

- Endpoint(s):
  - `POST /api/v1/vehicles/{id}/documents/upload`
  - `GET /api/v1/vehicles/{id}/documents`
  - `DELETE /api/v1/vehicle-documents/{id}`
- Response:
  - `VehicleDocument` añade `processing_progress`, `processing_stage`, `processing_detail`
- Errores esperados:
  - `404` documento inexistente
  - `409` documento ya eliminado o en estado incompatible si aplica

### Frontend

- Servicio(s): `frontend/src/app/core/services/vehicle-rag.service.ts`
- Interface(s): `VehicleDocument` y nuevo estado local de uploads en progreso
- Estado local/global: estado local por fichero subido y por tarjeta documental

## Migraciones

- Requiere migración: sí
- Backfill: sí, con valores por defecto para documentos existentes
- Compatibilidad con datos existentes: documentos previos deben seguir listándose aunque no tengan progreso histórico detallado

## Criterios de Aceptación

- CA-1: Dado un documento grande, cuando el usuario lo sube, entonces ve el porcentaje de subida hasta completarse.
- CA-2: Dado un documento ya subido y en indexación, cuando el usuario consulta la lista, entonces ve una fase y porcentaje de procesamiento legibles.
- CA-3: Dado un documento que falla al procesarse, cuando el usuario revisa la tarjeta, entonces ve el error persistido y el progreso detenido.
- CA-4: Dado un documento que se elimina durante la indexación, cuando el worker continúa su ejecución, entonces detecta la cancelación y no restaura ni actualiza el registro eliminado.
- CA-5: Dado un documento indexándose, cuando el polling actualiza su estado, entonces la vista no muestra loader global ni parpadea el resto de secciones.
- CA-6: Dada una cita con `page_number`, cuando el usuario la pulsa desde `Ask`, entonces el PDF se abre en la página referida.
- CA-7: Dado el modo `Docs & AI`, cuando el usuario lo abre, entonces no ve la pestaña `Knowledge` en esta iteración.
- CA-8: Dado un documento con chunks o knowledge derivados, cuando el usuario lo elimina, entonces desaparecen el documento, sus chunks y sus facts asociados.

## Pruebas Esperadas

- Backend: tests de cancelación segura del procesamiento, limpieza en delete y serialización de progreso.
- Frontend: tests del servicio de upload con eventos de progreso, refresh silencioso y apertura de citas con página.
- Manual/UI: subida de fichero grande, fallo de indexación visible, borrado durante indexación y apertura de cita paginada.
- No ejecutable ahora: validación con documentos realmente muy pesados si no hay fixture representativo.

## Dependencias

- `docs/sdd/specs/2026-05-09-vehicle-document-rag/spec.md`
- `system.md`

## Preguntas Abiertas

- Si queremos exponer un ETA aproximado en una iteración futura.

## Decisiones Relacionadas

- ADR: no aplica
