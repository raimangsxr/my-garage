# Gobernanza SDD

Este documento define cómo se aplica SDD de forma obligatoria en My Garage.

## Principio

Toda feature, hotfix, refactor funcional, cambio visual, integración, migración o modificación de contrato debe estar gobernada por una spec SDD.

La spec no es una formalidad: es el contrato de producto e ingeniería que guía la implementación.

## Clasificación de Cambios

### Requiere SDD completo

- Nueva feature.
- Cambio visual o UX observable.
- Cambio de API.
- Cambio de modelo de datos.
- Migración Alembic.
- Integración con servicios externos.
- Cambios de autenticación, permisos o seguridad.
- Refactor que altere comportamiento o contratos.
- Cambios en procesamiento de facturas, IA o archivos.

### Requiere SDD ligero

- Hotfix urgente.
- Corrección muy pequeña con comportamiento acotado.
- Ajuste menor de copy visible.

El SDD ligero debe incluir al menos problema, alcance, criterio de aceptación, plan corto y verificación.

### No requiere spec nueva

- Corrección tipográfica en documentación.
- Formato mecánico sin cambio de comportamiento.
- Actualización de una spec existente.
- Cambios internos de comentario sin impacto funcional.

Si hay duda, crear spec ligera.

## Estados de una Spec

- `Draft`: todavía se está definiendo.
- `Ready`: tiene criterios de aceptación y plan suficientes para implementar.
- `In Progress`: implementación activa.
- `Implemented`: código terminado y checks ejecutados o documentados.
- `Accepted`: revisado y aceptado en PR.
- `Superseded`: reemplazada por otra spec.
- `Abandoned`: descartada con motivo.

El estado vive en el encabezado de `spec.md` y se refleja en `docs/sdd/specs/index.md`.

## Definition of Ready

Una spec puede pasar a implementación cuando:

- Describe el problema y el usuario afectado.
- Define objetivos y fuera de alcance.
- Tiene criterios de aceptación verificables.
- Declara impacto en frontend, backend, datos, seguridad, UX y pruebas cuando aplica.
- Identifica migraciones y cambios de contrato.
- Registra preguntas abiertas o las resuelve.

## Definition of Done

Una iniciativa está lista para PR cuando:

- Todos los criterios de aceptación están cubiertos.
- `tasks.md` refleja el trabajo real.
- `plan.md` refleja desviaciones técnicas importantes.
- Los ADRs necesarios existen.
- Los checks ejecutados y no ejecutados están documentados.
- El PR enlaza spec, plan, tasks y ADRs.

## Reglas para PR

Un PR está incompleto si:

- No enlaza una spec cuando el cambio lo requiere.
- La spec no tiene criterios de aceptación.
- Hay migraciones sin plan de datos.
- Hay UI sin referencia a `system.md` o verificación visual.
- Hay cambios de API sin consumidores actualizados o nota de compatibilidad.

## Reglas para Agentes

- `AGENTS.md` es la instrucción raíz.
- Ante una petición nueva, el agente debe iniciar por SDD.
- El agente debe crear la spec antes de editar código.
- Si el usuario pide implementar directamente, el agente debe crear primero la spec mínima y continuar.
- Si el usuario pide saltarse SDD, debe confirmarse explícitamente y dejar constancia en la respuesta o PR.

## Mantenimiento

- `docs/sdd/specs/index.md` debe actualizarse con cada spec nueva.
- Specs abandonadas deben conservarse con motivo.
- ADRs aceptados no se editan para cambiar historia; se superseden con uno nuevo.
