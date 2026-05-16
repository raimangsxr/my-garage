# Tasks: Robustecer Fallback Gemini en Ask

Spec: [docs/sdd/specs/2026-05-16-ask-gemini-fallback/spec.md](./spec.md)
Plan: [docs/sdd/specs/2026-05-16-ask-gemini-fallback/plan.md](./plan.md)

## Preparación

- [ ] Confirmar rama basada en `main` actualizado.
- [x] Revisar specs existentes de `Ask` y RAG documental.
- [x] Identificar el servicio backend real usado por `Ask`.
- [x] Identificar tests existentes de `VehicleDocumentRAGService`.

## Implementación

- [x] Ajustar el fallback backend de `Ask` para respuestas vacías.
- [x] Ajustar el fallback backend de `Ask` para JSON inválido cuando se espera JSON.
- [x] Mantener fallback ante 429 y otros errores de modelo.
- [x] Añadir o actualizar tests unitarios del servicio.
- [ ] Actualizar documentación SDD si el alcance cambia durante la implementación.

## Verificación

- [x] Ejecutar checks backend razonables.
- [x] Validar fallback al segundo modelo ante 429 en tests.
- [x] Validar fallback al segundo modelo ante JSON inválido en tests.
- [x] Validar que el resultado final exitoso conserva el contrato esperado.
- [x] Documentar checks no ejecutados.

## PR

- [ ] PR enlaza `spec.md`.
- [ ] PR enlaza `plan.md`.
- [ ] PR enlaza ADRs si existen.
- [ ] PR resume pruebas ejecutadas.
- [ ] PR documenta checks no ejecutados.
- [ ] PR incluye notas sobre resiliencia del fallback en `Ask`.
