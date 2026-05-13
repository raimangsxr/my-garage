# Tasks: Corregir Bucle de Arranque con Sesión Persistida

Spec: ./spec.md
Plan: ./plan.md

## Preparación

- [x] Revisar `docs/sdd/README.md`.
- [x] Revisar `docs/sdd/workflow.md`.
- [x] Revisar `docs/sdd/quality-gates.md`.
- [x] Revisar `system.md`.
- [x] Identificar la causa raíz en bootstrap, guards y shell.

## Implementación

- [x] Crear spec SDD del hotfix.
- [x] Registrar la spec en `docs/sdd/specs/index.md`.
- [x] Ajustar el estado inicial de autenticación en frontend.
- [x] Verificar que el flujo de validación remota siga expulsando a login cuando corresponda.
- [x] Actualizar documentación SDD si cambia el alcance real.

## Verificación

- [x] Ejecutar `npx tsc -p tsconfig.app.json --noEmit`.
- [x] Ejecutar `npm run build`.
- [ ] Validar recarga con token persistido.
- [ ] Validar acceso sin token a `/login`.
- [x] Revisar consola/network si toca UI.

## PR

- [ ] PR enlaza `spec.md`.
- [ ] PR enlaza `plan.md`.
- [ ] PR enlaza ADRs si existen.
- [ ] PR resume pruebas ejecutadas.
- [ ] PR documenta checks no ejecutados.
- [ ] PR incluye capturas si toca UI.
