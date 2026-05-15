# Tasks: Invocación por voz en Ask de Docs & AI

Spec: ./spec.md
Plan: ./plan.md

## Preparación

- [ ] Confirmar rama basada en `main` actualizado.
- [x] Revisar `system.md` si toca frontend.
- [x] Revisar la spec existente de RAG documental por vehículo.
- [x] Identificar el flujo actual de `Docs & AI > Ask` en frontend y backend.
- [x] Cerrar la decisión de arquitectura para palabra clave y transcripción.
- [x] Confirmar que la primera versión no requiere ADR al mantenerse en frontend y sin nueva integración backend.

## Diseño Técnico

- [x] Definir el alcance exacto de la escucha por palabra clave.
- [x] Definir la máquina de estados de voz en frontend.
- [x] Definir la política de sobrescritura o combinación con texto existente.
- [x] Definir keyword, idioma y timeout de dictado.
- [x] Definir estrategia de degradación para navegadores no soportados.

## Implementación

- [x] Actualizar contratos/frontend para voz y transcripción.
- [x] Implementar control UI de auto-armado y cancelación en `Ask`.
- [x] Implementar reconocimiento de keyword y dictado con Web Speech API.
- [x] Integrar la transcripción con el textarea existente sin autoenvío.
- [x] Añadir síntesis de voz automática para respuestas del asistente.
- [x] Añadir feedback visual de estados y errores.
- [x] Añadir observabilidad y manejo de fallos.
- [x] Extraer lógica a utilidades de apoyo para limitar complejidad del componente.
- [x] Actualizar documentación SDD si cambia el alcance o la decisión técnica.

## Verificación

- [ ] Ejecutar checks backend.
- [x] Ejecutar checks frontend.
- [ ] Validar flujo manual principal.
- [ ] Validar denegación de permisos de micrófono.
- [ ] Validar caso límite con texto previo en el textarea.
- [ ] Validar fallback o degradación en navegador no soportado.
- [ ] Revisar responsive si toca UI.
- [ ] Revisar consola/network si toca UI.

## PR

- [ ] PR enlaza `spec.md`.
- [ ] PR enlaza `plan.md`.
- [ ] PR enlaza ADRs si existen.
- [ ] PR resume pruebas ejecutadas.
- [ ] PR documenta checks no ejecutados.
- [ ] PR incluye capturas si toca UI.
