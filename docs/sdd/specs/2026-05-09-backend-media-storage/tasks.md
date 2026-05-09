# Tasks: Unificar Storage Backend en Media

Spec: [./spec.md](./spec.md)
Plan: [./plan.md](./plan.md)

## Preparación

- [ ] Confirmar rama basada en `main` actualizado.
- [x] Revisar `system.md` si toca frontend.
- [x] Revisar migraciones Alembic existentes si toca datos.
- [x] Identificar tests existentes relacionados.

## Implementación

- [x] Actualizar contratos/modelos compartidos.
- [x] Implementar backend.
- [x] Crear migración Alembic si aplica.
- [x] Implementar frontend.
- [x] Añadir estados loading/empty/error si toca UI.
- [x] Añadir o actualizar pruebas.
- [x] Actualizar documentación SDD si hubo cambios de alcance.

## Verificación

- [x] Ejecutar checks backend.
- [ ] Ejecutar checks frontend.
- [x] Validar migración hacia adelante.
- [ ] Validar flujo manual principal.
- [x] Validar caso límite principal.
- [x] Revisar responsive si toca UI.
- [x] Revisar consola/network si toca UI.

## PR

- [ ] PR enlaza `spec.md`.
- [ ] PR enlaza `plan.md`.
- [x] PR enlaza ADRs si existen.
- [ ] PR resume pruebas ejecutadas.
- [ ] PR documenta checks no ejecutados.
- [x] PR incluye capturas si toca UI.
