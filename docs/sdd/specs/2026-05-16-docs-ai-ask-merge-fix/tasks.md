# Tasks: Corregir Merge Parcial en Ask de Docs & AI

Spec: [docs/sdd/specs/2026-05-16-docs-ai-ask-merge-fix/spec.md](./spec.md)
Plan: [docs/sdd/specs/2026-05-16-docs-ai-ask-merge-fix/plan.md](./plan.md)

## Preparación

- [x] Confirmar rama basada en `main` actualizado.
- [x] Revisar `system.md` por tratarse de un cambio frontend.
- [x] Identificar el punto exacto del merge roto en `vehicle-docs-ai`.
- [x] Identificar el error de compilación asociado.

## Implementación

- [x] Eliminar el bloque de sugerencias del template de `Ask`.
- [x] Limpiar estilo residual asociado si existe.
- [x] Actualizar documentación SDD del hotfix.

## Verificación

- [x] Ejecutar checks frontend.
- [ ] Validar que `Ask` abre por defecto.
- [ ] Validar que no aparecen sugerencias.
- [x] Revisar consola/build para confirmar que desaparece el error de compilación.

## PR

- [ ] PR enlaza `spec.md`.
- [ ] PR enlaza `plan.md`.
- [ ] PR enlaza ADRs si existen.
- [ ] PR resume pruebas ejecutadas.
- [ ] PR documenta checks no ejecutados.
