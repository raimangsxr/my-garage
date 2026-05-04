# AGENTS.md

Este repositorio trabaja imperativamente con SDD (*Spec-Driven Development*). Cualquier agente, asistente o contribuidor automatizado debe seguir estas reglas antes de modificar código, estilos, contratos, datos o configuración operativa.

## Regla Principal

No se implementa ningún cambio de comportamiento sin una spec SDD.

Antes de tocar código, crea o actualiza una carpeta:

```text
docs/sdd/specs/<yyyy-mm-dd-slug>/
  spec.md
  plan.md
  tasks.md
```

Usa las plantillas de `docs/sdd/specs/_template/`.

## Flujo Obligatorio

1. Leer `docs/sdd/README.md`, `docs/sdd/workflow.md`, `docs/sdd/quality-gates.md` y, si toca UI, `system.md`.
2. Crear o actualizar la spec de la iniciativa.
3. Definir criterios de aceptación verificables.
4. Crear o actualizar el plan técnico.
5. Crear o actualizar la lista de tareas.
6. Implementar siguiendo el plan.
7. Actualizar la spec si el comportamiento real cambia durante la implementación.
8. Ejecutar los checks razonables y documentar cualquier check no ejecutado.
9. Preparar el PR con enlaces a spec, plan, tasks y ADRs.

## Excepción de Hotfix

Los hotfixes urgentes también requieren SDD. Si el incidente exige actuar rápido:

1. Crear una spec mínima antes del cambio con problema, alcance y criterio de aceptación crítico.
2. Implementar el fix.
3. Completar `plan.md` y `tasks.md` antes del PR.
4. Añadir ADR si se tomó una decisión técnica duradera.

## Decisiones Técnicas

Crea un ADR en `docs/sdd/decisions/` cuando haya:

- cambio de arquitectura,
- cambio de modelo de datos,
- integración externa nueva,
- excepción a `system.md`,
- cambio de seguridad/autenticación,
- decisión difícil de revertir.

## Restricciones del Proyecto

- Frontend: Angular, Angular Material, componentes standalone y SCSS.
- Backend: FastAPI, SQLModel, Alembic y PostgreSQL.
- Diseño: `system.md` es obligatorio para UI.
- Contribución: `CONTRIBUTING.md` define branching, commit, push y PR.

## Qué No Hacer

- No implementar primero y documentar después, salvo hotfix con spec mínima.
- No abrir PR sin enlaces SDD.
- No crear patrones visuales nuevos sin revisar `system.md`.
- No cambiar contratos API sin actualizar frontend/backend afectados.
- No crear migraciones sin explicar compatibilidad de datos.
