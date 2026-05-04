# PROTOCOLO DE TRABAJO AUTOMATIZADO DEL AGENTE (DEVOPS)

El objetivo principal de este proyecto es mantener un control de versiones estricto. El agente debe seguir rigurosamente la siguiente secuencia de pasos en cada tarea, sin excepción.

## REGLAS DE EJECUCIÓN DEL AGENTE:

0.  **SDD antes de implementar:**
    * **No se implementa código antes de crear o actualizar la spec SDD**, salvo hotfix urgente con spec mínima previa.
    * Para cualquier cambio funcional, visual, de datos o integración, crea o actualiza una especificación en `docs/sdd/specs/<fecha-descripcion>/` usando las plantillas de `docs/sdd/specs/_template/`.
    * La especificación debe incluir criterios de aceptación verificables antes de escribir código.
    * El plan técnico debe declarar impacto en Frontend, Backend, datos, seguridad, UX y pruebas cuando aplique.
    * El PR debe enlazar la especificación, el plan, las tareas y cualquier ADR relacionado.
    * Mantén actualizado `docs/sdd/specs/index.md` con el estado de la iniciativa.

1.  **Inicio y Branching:**
    * **SIEMPRE** se debe hacer `git checkout main` y `git pull` antes de comenzar cualquier trabajo nuevo.
    * En función del tipo de tarea debe crearse la rama de una de las siguientes formas:
    * Crea una nueva rama de característica (feature branch) con el formato `git checkout -b feature/<descripcion_de_la_tarea>`.
    * Crea una nueva rama de corrección de errores (hotfix branch) con el formato `git checkout -b hotfix/<descripcion_de_la_tarea>`.

2.  **Implementación de Código:**
    * Implementa la funcionalidad solicitada o la corrección de errores.
    * Asegúrate de que todo el código nuevo cumpla con los estándares de estilo del proyecto (por ejemplo, PEP 8 para Python, ESLint para JavaScript).
    * En el Frontend (Angular) es muy importante que se prime la homogenización y reutilización (extensión) de componentes. Por ejemplo, si tenemos que crear una tabla, quiero crear un componente tabla y que se implemente este componente en todas las vistas donde se requiera una tabla, y que, en caso de que se requiera que la tabla haga algo nuevo, se extienda el componente tabla existente (ya que quizás es una funcionalidad que también pueden implementar otras tablas).
    * En el Backend (FastAPI) es importante construir un modelo de datos sólido y escalable, de forma que las consultas a base de datos estén optimizadas y que la serialización se realice de la forma más adecuada de acuerdo a cómo se consumen los modelos en el Frontend.
3.  **Commit:**
    * Realiza un único *commit* atómico por tarea.
    * El mensaje de *commit* debe seguir el formato de "Conventional Commits" (ej. `feat: [Descripción de la funcionalidad]` o `fix: [Descripción del arreglo]`).

4.  **Push:**
    * Realiza `git push origin <nombre_de_la_rama_creada>` para cargar la rama remota.

5.  **Pull Request (PR):**
    * **SIEMPRE** crea un *Pull Request* desde la rama de característica o hotfix (`feature/<...> o hotfix/<...>)` de vuelta a la rama **`main`**.
    * El PR debe incluir un resumen de los cambios y enlaces a los artefactos SDD: spec, plan, tasks y ADRs si existen.
    * Si hubo cambios de UI, el PR debe incluir capturas o notas de validación visual y responsive.
    * Si hubo migraciones, el PR debe explicar impacto de datos, validación y rollback o mitigación.
