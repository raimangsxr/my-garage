# Tasks: Actualizar Fallback de Modelos Gemini

Spec: [docs/sdd/specs/2026-05-16-gemini-model-fallback/spec.md](./spec.md)
Plan: [docs/sdd/specs/2026-05-16-gemini-model-fallback/plan.md](./plan.md)

## Preparación

- [x] Revisar baseline del procesamiento de facturas con Gemini.
- [x] Identificar el punto exacto del fallback en `GeminiService`.
- [ ] Identificar tests backend existentes relacionados.

## Implementación

- [x] Actualizar el orden de `AVAILABLE_MODELS`.
- [ ] Añadir o actualizar pruebas backend si compensa para esta complejidad.
- [x] Actualizar documentación SDD de la iniciativa.

## Verificación

- [ ] Ejecutar checks backend razonables.
- [ ] Validar procesamiento de factura en entorno real si es posible.
- [ ] Revisar logs de fallback esperados.

## PR

- [ ] PR enlaza `spec.md`.
- [ ] PR enlaza `plan.md`.
- [ ] PR enlaza ADRs si existen.
- [ ] PR resume pruebas ejecutadas.
- [ ] PR documenta checks no ejecutados.
