# Workflow SDD

Este workflow adapta SDD al protocolo de trabajo del repositorio.

## 1. Intake

Antes de crear rama o implementar:

- Identificar si la petición es `feature`, `hotfix`, `refactor`, `chore` o `docs`.
- Buscar specs existentes relacionadas en `docs/sdd/specs/`.
- Confirmar si el cambio toca frontend, backend, datos, IA, autenticación o diseño visual.
- Para frontend, revisar `system.md`.

Resultado esperado: carpeta nueva o existente de spec.

## 2. Crear Spec

Crear:

- `docs/sdd/specs/<yyyy-mm-dd-slug>/spec.md`
- `docs/sdd/specs/<yyyy-mm-dd-slug>/plan.md`
- `docs/sdd/specs/<yyyy-mm-dd-slug>/tasks.md`

Usar las plantillas de `docs/sdd/specs/_template/`.

La spec debe evitar lenguaje de implementación salvo en restricciones explícitas. El plan sí debe bajar a arquitectura y módulos.

## 3. Diseño y Decisiones

Crear un ADR en `docs/sdd/decisions/` cuando haya:

- cambio de patrón arquitectónico,
- cambio irreversible o difícil de revertir,
- decisión de modelo de datos,
- integración externa nueva,
- cambio en autenticación/seguridad,
- excepción consciente a `system.md`.

Formato sugerido: `0001-titulo-corto.md`.

## 4. Branching

Seguir `CONTRIBUTING.md`:

```bash
git checkout main
git pull
git checkout -b feature/<descripcion>
```

Para hotfix:

```bash
git checkout -b hotfix/<descripcion>
```

La descripción de la rama debe coincidir razonablemente con el slug de la spec.

## 5. Implementación

Orden recomendado:

1. Ajustar contratos compartidos: modelos, schemas, interfaces TypeScript.
2. Implementar backend: modelo, migración, servicio y endpoint.
3. Implementar frontend: servicio, estado, componentes y estilos.
4. Añadir o actualizar pruebas.
5. Revisar estados loading, empty, error y responsive.
6. Actualizar la spec si el diseño real cambió con justificación.

## 6. Quality Gates

Antes de abrir PR, revisar `quality-gates.md` y marcar en `tasks.md` qué se ejecutó.

Checks habituales:

```bash
cd backend
pytest -q
alembic upgrade head
```

```bash
cd frontend
npm run build
npm test
```

Si un check no puede ejecutarse, documentar motivo y riesgo.

## 7. PR

El PR debe incluir:

- enlace a `spec.md`,
- enlace a `plan.md`,
- checklist o enlace a `tasks.md`,
- ADRs relevantes,
- resumen de cambios,
- pruebas ejecutadas,
- capturas si hubo UI,
- notas de migración si hubo datos.

## 8. Mantenimiento de Specs

Las specs no son decoración. Si durante la implementación cambia el alcance:

- Actualizar `spec.md` si cambia comportamiento observable.
- Actualizar `plan.md` si cambia enfoque técnico.
- Actualizar `tasks.md` si cambian pasos o checks.
- Crear ADR si el cambio introduce una decisión duradera.
