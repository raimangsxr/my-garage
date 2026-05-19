# Tasks: Ordenar y Compactar Docs & AI en Detalle de Vehículo

Spec: [docs/sdd/specs/2026-05-16-vehicle-docs-ai-responsive-tidy/spec.md](./spec.md)
Plan: [docs/sdd/specs/2026-05-16-vehicle-docs-ai-responsive-tidy/plan.md](./plan.md)

## Preparación

- [ ] Confirmar rama basada en `main` actualizado.
- [x] Revisar `system.md` por tratarse de un cambio frontend.
- [x] Revisar specs existentes relacionadas con `Docs & AI`.
- [x] Auditar manualmente la experiencia publicada en desktop y móvil.
- [x] Identificar archivos y tests relacionados.

## Implementación

- [x] Compactar el contexto del vehículo en modo `docs`.
- [x] Reestructurar la jerarquía visual de `Ask`.
- [x] Priorizar compositor e historial en responsive móvil.
- [x] Ajustar estilos de conversación, citas y voz para reducir desorden.
- [x] Actualizar la documentación SDD si el alcance real cambia.
- [ ] Eliminar desbordes visuales en encabezados, tarjetas y controles con textos reales.

## Verificación

- [x] Ejecutar checks frontend razonables.
- [x] Validar flujo manual principal con respuesta y citas.
- [x] Validar estado vacío del historial.
- [x] Validar estado de error/soporte de voz.
- [x] Revisar responsive desktop y móvil.
- [x] Documentar checks no ejecutados.

## PR

- [ ] PR enlaza `spec.md`.
- [ ] PR enlaza `plan.md`.
- [ ] PR enlaza ADRs si existen.
- [ ] PR resume pruebas ejecutadas.
- [ ] PR documenta checks no ejecutados.
- [ ] PR incluye capturas del antes/después.
