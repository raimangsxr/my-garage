# Tasks: Corregir Shell y Redirecciones de Autenticación

Spec: ./spec.md
Plan: ./plan.md

## Preparación

- [x] Revisar `docs/sdd/README.md`.
- [x] Revisar `docs/sdd/workflow.md`.
- [x] Revisar `docs/sdd/quality-gates.md`.
- [x] Revisar `system.md`.
- [x] Identificar la causa raíz en routing, guard y shell raíz.

## Implementación

- [x] Crear spec SDD del hotfix.
- [x] Añadir guard para evitar `/login` con sesión válida.
- [x] Ajustar la shell raíz para no renderizar chrome autenticado en rutas públicas.
- [x] Actualizar el índice SDD.

## Verificación

- [x] Ejecutar `npx tsc -p tsconfig.app.json --noEmit`.
- [x] Ejecutar `npm run build`.
- [ ] Validar en navegador autenticado que `/login` redirige a home.
- [ ] Validar en navegador no autenticado que `login` aparece sin shell.
- [x] Revisar `git diff --check`.
