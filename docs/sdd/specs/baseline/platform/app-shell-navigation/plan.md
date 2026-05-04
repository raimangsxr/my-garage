# Plan Técnico: App Shell y Navegación

Spec: ./spec.md
Estado: Baseline

## Frontend

- `app.routes.ts` define acceso público/privado.
- `app.config.ts` registra router, animaciones, HTTP client e interceptores.
- `AppComponent` compone layout y estado global.
- `SidenavComponent` contiene la lista visible de módulos.

## Backend

- Sin endpoints propios; depende de auth para resolver usuario/token.

## Notas de Evolución

- Nueva feature visible debe añadir ruta, navegación si aplica y spec propia.
- Cambios en shell deben validarse en desktop y móvil.
