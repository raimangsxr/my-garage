# Tasks: Corregir Fiabilidad de PWA, Ask y Uploads Documentales

Spec: ./spec.md
Plan: ./plan.md

## Preparación

- [x] Revisar specs relacionadas de PWA, RAG y restyling de `Ask`.
- [x] Identificar tests existentes relacionados con chat documental y uploads.
- [x] Confirmar las piezas de despliegue versionadas implicadas en el `504`.

## Implementación

- [x] Ajustar manifest/metadatos PWA para instalación móvil más robusta.
- [x] Reforzar backend RAG para no perder fuentes accionables cuando Gemini no cite bien.
- [x] Actualizar `Ask` para renderizar fuentes relacionadas y abrir documento/página.
- [x] Hacer que `Enter` envíe la pregunta y `Shift+Enter` inserte nueva línea.
- [x] Mejorar diagnóstico y mitigación versionada del `504` en uploads grandes.
- [x] Actualizar documentación SDD si cambia el alcance real.

## Verificación

- [x] Ejecutar checks backend relevantes.
- [x] Ejecutar checks frontend relevantes.
- [ ] Validar manualmente `Ask` con fuentes y navegación a página.
- [ ] Validar manualmente `Enter` y `Shift+Enter`.
- [x] Revisar manifest/build PWA y señales de instalación.
- [x] Documentar cualquier check no ejecutado o no reproducible en local.

## PR

- [ ] PR enlaza `spec.md`.
- [ ] PR enlaza `plan.md`.
- [ ] PR resume pruebas ejecutadas.
- [ ] PR documenta checks no ejecutados.
- [ ] PR incluye notas visuales si hace falta.
