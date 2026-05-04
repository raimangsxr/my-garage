# Tasks: <titulo>

Spec: <enlace a spec.md>
Plan: <enlace a plan.md>

## Preparación

- [ ] Confirmar rama basada en `main` actualizado.
- [ ] Revisar `system.md` si toca frontend.
- [ ] Revisar migraciones Alembic existentes si toca datos.
- [ ] Identificar tests existentes relacionados.

## Implementación

- [ ] Actualizar contratos/modelos compartidos.
- [ ] Implementar backend.
- [ ] Crear migración Alembic si aplica.
- [ ] Implementar frontend.
- [ ] Añadir estados loading/empty/error si toca UI.
- [ ] Añadir o actualizar pruebas.
- [ ] Actualizar documentación SDD si hubo cambios de alcance.

## Verificación

- [ ] Ejecutar checks backend.
- [ ] Ejecutar checks frontend.
- [ ] Validar migración hacia adelante.
- [ ] Validar flujo manual principal.
- [ ] Validar caso límite principal.
- [ ] Revisar responsive si toca UI.
- [ ] Revisar consola/network si toca UI.

## PR

- [ ] PR enlaza `spec.md`.
- [ ] PR enlaza `plan.md`.
- [ ] PR enlaza ADRs si existen.
- [ ] PR resume pruebas ejecutadas.
- [ ] PR documenta checks no ejecutados.
- [ ] PR incluye capturas si toca UI.
