# Spec: Corregir Shell y Redirecciones de Autenticación

Estado: In Progress
Fecha: 2026-05-07
Tipo: hotfix
Owner: Codex

## Resumen

Corregir el comportamiento de autenticación y layout para que la ruta de login siempre se renderice a pantalla completa sin shell autenticada, y para que un usuario con sesión válida no pueda permanecer en `/login`.

## Problema

Actualmente se puede llegar a una combinación inconsistente:

- el login aparece dentro de la shell autenticada (header, sidenav, footer),
- al perder la sesión se navega a `/login` pero visualmente puede seguir mostrándose chrome de aplicación,
- si el usuario autenticado navega manualmente a `/login`, no siempre es redirigido a la home.

Esto rompe la separación esperada entre superficie pública y superficie autenticada.

## Usuarios y Contexto

- Usuario autenticado navegando por la aplicación.
- Usuario cuya sesión ha expirado o cuyo token ya no es válido.
- Usuario que abre manualmente `/login` teniendo ya una sesión válida.

## Objetivos

- Asegurar que `login` se vea siempre como vista pública a pantalla completa.
- Redirigir automáticamente a `dashboard` cuando un usuario autenticado accede a `/login`.
- Evitar que la shell autenticada quede visible cuando el estado de sesión obliga a ir a login.

## Fuera de Alcance

- Rediseñar la pantalla de login.
- Cambiar el backend de autenticación o la caducidad JWT.
- Rehacer el sistema completo de refresh token.

## Comportamiento Esperado

### Escenario Principal

1. Un usuario sin sesión o con sesión expirada accede a una ruta privada.
2. La aplicación le redirige a `/login`.
3. El login se renderiza sin header, sidenav ni footer autenticado.

### Escenario Secundario

1. Un usuario con sesión válida accede a `/login`.
2. La aplicación lo redirige automáticamente a `/dashboard`.

## Casos Límite

- Si la app arranca con un token inválido almacenado, la shell autenticada no debe quedarse visible una vez la ruta resulte ser pública.
- Si el usuario escribe manualmente `/login` con sesión válida, no debe ver un frame intermedio de login incrustado en la shell.

## Requisitos Funcionales

- RF-1: la ruta `login` debe estar protegida por una regla inversa que redirija a `dashboard` cuando hay sesión válida.
- RF-2: la shell autenticada no debe renderizarse en rutas públicas.
- RF-3: al expirar o invalidarse sesión y navegar a `login`, el usuario debe ver solo la vista pública de login.

## Requisitos No Funcionales

- Accesibilidad: sin regresiones de navegación o foco.
- Rendimiento: sin impacto material.
- Seguridad: mantener el bloqueo de rutas privadas sin sesión.
- UX: evitar parpadeos evidentes de layout incoherente.

## UX y Diseño

- Referencia visual: `system.md`
- Pantallas afectadas: `login`, shell raíz, navegación protegida.
- Estados requeridos: autenticado | público | sesión expirada.

## Contratos de Datos

### Backend/API

- Sin cambios.

### Frontend

- Servicios: `AuthService`
- Guardas: `AuthGuard` y nuevo guard de ruta pública si aplica
- Shell raíz: `AppComponent`

## Migraciones

- Requiere migración: no
- Compatibilidad con datos existentes: total

## Criterios de Aceptación

- CA-1: dado un usuario autenticado, cuando navega a `/login`, entonces es redirigido a `/dashboard`.
- CA-2: dado un usuario no autenticado, cuando se muestra `/login`, entonces no aparece header, sidenav ni footer autenticado.
- CA-3: dado un usuario cuya sesión expira en una ruta privada, cuando la app lo manda a `/login`, entonces el login se presenta a pantalla completa como vista pública.

## Pruebas Esperadas

- Frontend: `npx tsc -p tsconfig.app.json --noEmit`
- Frontend: `npm run build`
- Manual/UI: validar login público, redirección desde `/login` autenticado y expiración/redirección.

## Dependencias

- `docs/sdd/README.md`
- `docs/sdd/workflow.md`
- `docs/sdd/quality-gates.md`
- `system.md`

## Preguntas Abiertas

- Ninguna por ahora.

## Decisiones Relacionadas

- ADR: no aplica
