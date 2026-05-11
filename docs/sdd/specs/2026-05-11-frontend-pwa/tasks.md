# Tasks: Convertir el Frontend en PWA

Spec: ./spec.md
Plan: ./plan.md

## Preparación

- [x] Revisar `docs/sdd/README.md`.
- [x] Revisar `docs/sdd/workflow.md`.
- [x] Revisar `docs/sdd/quality-gates.md`.
- [x] Revisar `system.md`.
- [x] Identificar configuración Angular y assets actuales del frontend.

## Implementación

- [x] Crear spec SDD de la iniciativa.
- [x] Registrar la spec en `docs/sdd/specs/index.md`.
- [x] Instalar y configurar Angular Service Worker.
- [x] Añadir manifiesto web e iconos PWA.
- [x] Implementar feedback global de actualización y conectividad.
- [x] Actualizar documentación SDD si cambia el alcance real.

## Verificación

- [x] Ejecutar `npx tsc -p tsconfig.app.json --noEmit`.
- [x] Ejecutar `npm run build`.
- [x] Validar presencia de `manifest.webmanifest` y `ngsw.json` en el build.
- [ ] Validar flujo manual de instalación PWA.
- [ ] Validar caso límite offline/online.
- [x] Revisar `git diff --check`.

## PR

- [ ] PR enlaza `spec.md`.
- [ ] PR enlaza `plan.md`.
- [ ] PR enlaza ADRs si existen.
- [ ] PR resume pruebas ejecutadas.
- [ ] PR documenta checks no ejecutados.
- [ ] PR incluye capturas si toca UI.
