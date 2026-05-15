# Tasks: Mejorar Feedback y Borrado de Documentos RAG

Spec: ./spec.md
Plan: ./plan.md

## Preparación

- [x] Confirmar rama basada en `main` actualizado.
- [x] Revisar `system.md` si toca frontend.
- [x] Revisar migraciones Alembic existentes si toca datos.
- [x] Identificar tests existentes relacionados.

## Implementación

- [x] Actualizar contrato documental con progreso persistido.
- [x] Implementar cancelación segura y limpieza robusta en backend.
- [x] Crear migración Alembic para nuevos campos.
- [x] Implementar progreso de subida en frontend.
- [x] Mostrar progreso de procesamiento y errores persistidos en UI.
- [x] Añadir o actualizar pruebas.
- [x] Actualizar documentación SDD si cambia el alcance.

## Verificación

- [x] Ejecutar checks backend.
- [x] Ejecutar checks frontend.
- [ ] Validar migración hacia adelante.
- [ ] Validar flujo manual principal.
- [ ] Validar caso límite de borrado durante indexación.
- [ ] Revisar responsive si toca UI.
- [ ] Revisar consola/network si toca UI.

## PR

- [ ] PR enlaza `spec.md`.
- [ ] PR enlaza `plan.md`.
- [ ] PR enlaza ADRs si existen.
- [ ] PR resume pruebas ejecutadas.
- [ ] PR documenta checks no ejecutados.
- [ ] PR incluye capturas si toca UI.
