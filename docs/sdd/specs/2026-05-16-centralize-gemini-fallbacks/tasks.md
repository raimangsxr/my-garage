# Tasks: Centralizar Fallbacks Gemini en GeminiService

Spec: [docs/sdd/specs/2026-05-16-centralize-gemini-fallbacks/spec.md](./spec.md)
Plan: [docs/sdd/specs/2026-05-16-centralize-gemini-fallbacks/plan.md](./plan.md)

## Preparación

- [x] Identificar fallbacks Gemini aún presentes fuera de `GeminiService`.
- [x] Delimitar qué degradaciones son de proveedor y cuáles son de negocio.

## Implementación

- [ ] Añadir soporte de `validator` y `fallback_resolver` en `GeminiService`.
- [ ] Adaptar `VehicleDocumentRAGService` para usar el fallback centralizado.
- [ ] Ajustar las listas de modelos de `Ask` para separar respuesta y transcripción.
- [ ] Mantener fuera solo fallbacks de negocio no Gemini.
- [ ] Añadir o actualizar tests backend.

## Verificación

- [ ] Ejecutar checks backend razonables.
- [ ] Validar tests del proxy y de `Ask`.
- [ ] Documentar checks no ejecutados.
