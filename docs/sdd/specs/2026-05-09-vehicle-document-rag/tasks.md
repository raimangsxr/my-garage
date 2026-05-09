# Tasks: RAG de Documentación de Vehículo

Spec: ./spec.md
Plan: ./plan.md

## Preparación

- [ ] Confirmar rama basada en `main` actualizado.
- [x] Revisar `system.md` si toca frontend.
- [x] Revisar migraciones Alembic existentes si toca datos.
- [x] Identificar tests existentes relacionados.
- [x] Revisar specs baseline de `vehicle-detail`, `invoice-ai-processing` y `settings`.
- [x] Crear ADR arquitectónico para RAG documental por vehículo.

## Implementación

- [x] Actualizar contratos/modelos compartidos.
- [x] Implementar backend de documentos por vehículo.
- [x] Crear migración Alembic para tablas documentales y storage persistido de chunks/embeddings.
- [x] Implementar pipeline de chunking/indexación.
- [x] Eliminar límite fijo de tamaño y guardar uploads documentales en streaming.
- [x] Implementar endpoint de chat con citas.
- [x] Hacer el retrieval y la respuesta tolerantes a consultas en idioma distinto al de la documentación.
- [x] Corregir el fallback de chat sin fuentes para que respete el idioma de la pregunta.
- [x] Implementar frontend del modo `Docs & AI` en detalle de vehículo.
- [x] Añadir pestañas `Documents`, `Knowledge` y `Ask`.
- [x] Añadir estados loading/empty/error/indexing en la UI.
- [x] Hacer que las citas de `Ask` abran el PDF en la página referenciada cuando exista `page_number`.
- [x] Añadir o actualizar pruebas.
- [x] Actualizar documentación SDD si hubo cambios de alcance.

## Verificación

- [x] Ejecutar checks backend.
- [x] Ejecutar checks frontend.
- [x] Validar migración hacia adelante.
- [ ] Validar flujo manual principal.
- [x] Validar caso límite principal.
- [ ] Validar apertura manual de cita PDF en página concreta.
- [ ] Revisar responsive si toca UI.
- [x] Revisar consola/network si toca UI.

## PR

- [ ] PR enlaza `spec.md`.
- [ ] PR enlaza `plan.md`.
- [ ] PR enlaza ADRs si existen.
- [ ] PR resume pruebas ejecutadas.
- [ ] PR documenta checks no ejecutados.
- [ ] PR incluye capturas si toca UI.
