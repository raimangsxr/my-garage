# Tasks: Unificar Llamadas LLM en GeminiService

Spec: [docs/sdd/specs/2026-05-16-unify-llm-gemini-service/spec.md](./spec.md)
Plan: [docs/sdd/specs/2026-05-16-unify-llm-gemini-service/plan.md](./plan.md)

## Preparación

- [ ] Confirmar rama basada en `main` actualizado.
- [x] Revisar specs existentes de facturas y RAG documental.
- [x] Identificar puntos actuales de llamada directa a Gemini.
- [x] Identificar imports/endpoints afectados.

## Implementación

- [x] Refactorizar `GeminiService` a API genérica de generación y contenido multimodal.
- [x] Crear `InvoiceService` con prompt y parsing propios.
- [x] Adaptar el flujo de facturas para usar `InvoiceService`.
- [x] Adaptar `VehicleDocumentRAGService` para delegar completamente la llamada LLM en `GeminiService`.
- [x] Mantener compatibilidad razonable de imports internos si aplica.
- [x] Añadir o actualizar pruebas backend.
- [ ] Actualizar documentación SDD si el alcance cambia durante la implementación.

## Verificación

- [x] Ejecutar checks backend razonables.
- [x] Validar tests afectados por el refactor.
- [x] Validar compilación/import de servicios backend refactorizados.
- [x] Documentar checks no ejecutados.

## PR

- [ ] PR enlaza `spec.md`.
- [ ] PR enlaza `plan.md`.
- [ ] PR enlaza ADRs si existen.
- [ ] PR resume pruebas ejecutadas.
- [ ] PR documenta checks no ejecutados.
- [ ] PR explica la nueva arquitectura de integración con Gemini.
