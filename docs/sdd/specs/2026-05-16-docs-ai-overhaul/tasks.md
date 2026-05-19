# Tasks: Overhaul de Docs & AI

Spec: `docs/sdd/specs/2026-05-16-docs-ai-overhaul/spec.md`
Plan: `docs/sdd/specs/2026-05-16-docs-ai-overhaul/plan.md`

## Preparación

- [ ] Confirmar rama basada en `main` actualizado.
- [x] Revisar `system.md` si toca frontend.
- [ ] Revisar migraciones Alembic existentes si toca datos.
- [x] Identificar tests existentes relacionados.

## Implementación

- [ ] Actualizar contratos/modelos compartidos.
- [ ] Implementar backend.
- [ ] Crear migración Alembic si aplica.
- [x] Implementar frontend.
- [x] Añadir estados loading/empty/error si toca UI.
- [x] Añadir o actualizar pruebas.
- [x] Actualizar documentación SDD si hubo cambios de alcance.

## Verificación

- [ ] Ejecutar checks backend.
- [x] Ejecutar checks frontend.
- [ ] Validar migración hacia adelante.
- [x] Validar flujo manual principal.
- [x] Validar caso límite principal.
- [x] Revisar responsive si toca UI.
- [x] Revisar consola/network si toca UI.

## PR

- [ ] PR enlaza `spec.md`.
- [ ] PR enlaza `plan.md`.
- [ ] PR enlaza ADRs si existen.
- [ ] PR resume pruebas ejecutadas.
- [ ] PR documenta checks no ejecutados.
- [ ] PR incluye capturas si toca UI.
