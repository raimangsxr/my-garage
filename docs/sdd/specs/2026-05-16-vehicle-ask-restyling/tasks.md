# Tasks: Restyling de Ask en Docs & AI

Spec: [docs/sdd/specs/2026-05-16-vehicle-ask-restyling/spec.md](./spec.md)
Plan: [docs/sdd/specs/2026-05-16-vehicle-ask-restyling/plan.md](./plan.md)

## Preparación

- [ ] Confirmar rama basada en `main` actualizado.
- [x] Revisar `system.md` por tratarse de un cambio frontend.
- [x] Revisar specs existentes de `Docs & AI`, feedback documental y voz.
- [x] Identificar tests existentes relacionados con `vehicle-docs-ai`.

## Implementación

- [x] Definir layout objetivo de `Ask` con jerarquía explícita entre contexto, conversación y compositor.
- [x] Configurar `Ask` como tab por defecto al entrar en `Docs & AI`.
- [x] Reestructurar el template HTML de `Ask` sin cambiar el flujo funcional de chat.
- [x] Eliminar las sugerencias predefinidas del estado inicial.
- [x] Corregir el saneado de voz para impedir que la wake phrase o fragmentos duplicados lleguen a la pregunta final.
- [x] Añadir toggle de auto-submit tras transcripción con valor por defecto desactivado.
- [x] Actualizar SCSS para reforzar jerarquía visual, estados y responsive.
- [x] Reforzar explícitamente la composición móvil de configuración, voz, chat y compositor.
- [x] Ajustar el bloque de voz para mejorar affordance visual de estados.
- [ ] Revisar si conviene extraer subcomponentes presentacionales o mantener el componente único.
- [ ] Añadir o actualizar pruebas frontend relacionadas.
- [ ] Actualizar documentación SDD si durante la implementación cambia el alcance real.

## Verificación

- [x] Ejecutar checks frontend razonables.
- [x] Validar que `Ask` se abre por defecto.
- [x] Validar flujo manual principal de pregunta y respuesta con citas.
- [ ] Validar historial vacío sin sugerencias.
- [ ] Validar estados de voz soportado y no soportado.
- [ ] Validar transcripción con auto-submit activado y desactivado.
- [ ] Validar que la wake phrase no aparece en la pregunta final aunque haya resultados solapados.
- [x] Revisar responsive en desktop y móvil.
- [x] Revisar consola/network si se toca interacción.

## PR

- [ ] PR enlaza `spec.md`.
- [ ] PR enlaza `plan.md`.
- [ ] PR enlaza ADRs si existen.
- [ ] PR resume pruebas ejecutadas.
- [ ] PR documenta checks no ejecutados.
- [ ] PR incluye capturas del antes/después de `Ask`.

## Notas de Verificación

- Checks ejecutados:
  - `frontend`: `npx vitest run src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai-voice.util.spec.ts`
  - `frontend`: `npm run build`
  - Validación manual en navegador: login local, apertura de `Docs & AI > Ask`, subida temporal de documento, consulta con cita y revisión responsive en viewport móvil.
- Checks no cerrados de extremo a extremo:
  - dictado real con micrófono dentro del navegador automatizado; riesgo mitigado con tests de utilidades y saneado explícito de transcripción.
