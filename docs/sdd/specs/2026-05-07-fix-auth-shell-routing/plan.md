# Plan Técnico: Corregir Shell y Redirecciones de Autenticación

Spec: ./spec.md
Estado: In Progress
Fecha: 2026-05-07

## Enfoque

Separar explícitamente rutas públicas y superficie autenticada en frontend. Añadir una guarda inversa para `login` y ajustar `AppComponent` para que la shell se pinte solo en rutas privadas.

## Impacto por Capa

### Backend

- Sin cambios.

### Frontend

- Routing: `app.routes.ts`
- Guardas: nuevo guard para rutas públicas autenticadas
- Shell raíz: `app.component.ts` / `app.component.html`
- Auth: reutilizar `AuthService.isAuthenticated$`

### Datos

- Sin cambios.

### Seguridad

- Mantener rutas privadas protegidas.
- Evitar exposición visual de shell autenticada en login.

## Cambios de Contrato

| Contrato | Cambio | Consumidores | Compatibilidad |
| --- | --- | --- | --- |
| Ruta `/login` | pasa a redirigir a `dashboard` si existe sesión válida | Frontend | Compatible |
| Shell raíz | se oculta en rutas públicas aunque exista estado auth inconsistente transitorio | Frontend | Compatible |

## Estrategia de Implementación

1. Crear spec, plan y tareas del hotfix.
2. Añadir un guard `PublicOnly`/`Guest` para `/login`.
3. Ajustar `AppComponent` para determinar cuándo renderizar shell autenticada.
4. Validar en navegador local con sesión válida y sesión invalidada.

## Estrategia de Pruebas

- TypeScript sin emisión.
- Build producción.
- Verificación manual en `localhost:4200`:
  - autenticado + `/login` => redirect
  - login sin sesión => full-screen sin shell
  - pérdida de sesión => `/login` sin shell

## Riesgos

- Riesgo: esconder shell en una ruta privada por una detección de ruta incorrecta.
  Mitigación: limitar la lógica a rutas públicas explícitas.

## Rollback

Revertir el nuevo guard y la condición de shell en `AppComponent`.

## Observabilidad

- Sin métricas nuevas.
- Validación principal mediante reproducción manual del flujo.
