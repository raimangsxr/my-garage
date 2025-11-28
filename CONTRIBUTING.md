# PROTOCOLO DE TRABAJO AUTOMATIZADO DEL AGENTE (DEVOPS)

El objetivo principal de este proyecto es mantener un control de versiones estricto. El agente debe seguir rigurosamente la siguiente secuencia de pasos en cada tarea, sin excepción.

## REGLAS DE EJECUCIÓN DEL AGENTE:

1.  **Inicio y Branching:**
    * **SIEMPRE** se debe hacer `git checkout main` y `git pull` antes de comenzar cualquier trabajo nuevo.
    * En función del tipo de tarea debe crearse la rama de una de las siguientes formas:
    * Crea una nueva rama de característica (feature branch) con el formato `git checkout -b feature/<descripcion_de_la_tarea>`.
    * Crea una nueva rama de corrección de errores (hotfix branch) con el formato `git checkout -b hotfix/<descripcion_de_la_tarea>`.
2.  **Implementación de Código:**
    * Implementa la funcionalidad solicitada o la corrección de errores.
    * Asegúrate de que todo el código nuevo cumpla con los estándares de estilo del proyecto (por ejemplo, PEP 8 para Python, ESLint para JavaScript).
    * En el Frontend (Angular) es muy importante que se prime la homogenización y reutilización (extensión) de componentes. Por ejemplo, si tenemos que crear una tabla, quiero crear un componente tabla y que se implemente este componente en todas las vistas donde se requiera una tabla, y que, en caso de que se requiera que la tabla haga algo nuevo, se extienda el componente tabla existente (ya que quizás es una funcionalidad que también pueden implementar otras tablas).
3.  **Pruebas Automatizadas:**
    * Antes de realizar cualquier *commit*, el agente **DEBE** ejecutar las pruebas de unidad/integración del proyecto.
    * Solo continúa si las pruebas se ejecutan con éxito y la nueva funcionalidad ha sido verificada (*testing* automático o en el navegador integrado).
4.  **Commit:**
    * Realiza un único *commit* atómico por tarea.
    * El mensaje de *commit* debe seguir el formato de "Conventional Commits" (ej. `feat: [Descripción de la funcionalidad]` o `fix: [Descripción del arreglo]`).
5.  **Push:**
    * Realiza `git push origin <nombre_de_la_rama_creada>` para cargar la rama remota.
6.  **Pull Request (PR):**
    * **SIEMPRE** crea un *Pull Request* desde la rama de característica (`feature/<...>)` de vuelta a la rama **`main`**.
    * El PR debe incluir un resumen de los cambios y un enlace a los **Artefactos** de Antigravity generados (Planes, capturas de pantalla, etc.) para su revisión humana.
