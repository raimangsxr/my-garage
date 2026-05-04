# SDD en My Garage

Este directorio contiene la base para trabajar con SDD (*Spec-Driven Development*) en My Garage. SDD es obligatorio para cualquier feature, hotfix, cambio visual, cambio de datos, integración o modificación de contrato.

La intención es que cada cambio relevante empiece por una especificación clara, derive en un plan técnico trazable y termine con tareas verificables antes de abrir PR.

## Cómo se trabaja

1. Crear una carpeta para la iniciativa en `docs/sdd/specs/<yyyy-mm-dd-slug>/`.
2. Copiar las plantillas desde `docs/sdd/specs/_template/`.
3. Rellenar `spec.md` con problema, usuarios, alcance, criterios de aceptación y casos límite.
4. Rellenar `plan.md` con impacto en frontend, backend, datos, migraciones, seguridad, UX y pruebas.
5. Desglosar `tasks.md` en pasos pequeños y verificables.
6. Implementar siguiendo la especificación aprobada.
7. Actualizar el PR con enlaces a la spec, plan, tareas y decisiones relevantes.

## Ficheros base

- `project-context.md`: mapa actual del producto, arquitectura, dominios y riesgos detectados.
- `governance.md`: reglas obligatorias, excepciones, estados y Definition of Ready/Done.
- `workflow.md`: proceso SDD adaptado al protocolo de branching/PR del proyecto.
- `quality-gates.md`: checks mínimos antes de considerar una tarea lista.
- `specs/index.md`: registro vivo de specs activas, implementadas o descartadas.
- `specs/_template/spec.md`: plantilla de especificación funcional.
- `specs/_template/plan.md`: plantilla de plan técnico.
- `specs/_template/tasks.md`: plantilla de ejecución.
- `decisions/0000-template.md`: plantilla de ADR para decisiones técnicas.

## Reglas de oro

- Ningún cambio de comportamiento sin spec.
- Ninguna spec sin criterios de aceptación verificables.
- Ninguna implementación que contradiga `system.md` en frontend.
- Ninguna migración de datos sin plan de compatibilidad y rollback razonable.
- Ningún PR sin enlazar la spec que explica por qué existe.
- Ante la duda, crear una spec ligera.
