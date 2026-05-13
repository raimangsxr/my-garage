# Spec: Corregir Bucle de Arranque con Sesión Persistida

Estado: In Progress
Fecha: 2026-05-13
Tipo: hotfix
Owner: Codex

## Resumen

Corregir el arranque del frontend cuando el navegador ya conserva una sesión válida para que la aplicación no quede atrapada en un estado de carga o redirección infinita tras un despliegue.

## Problema

En Producción, un usuario con datos persistidos de sesión en una ventana normal puede ver la app quedarse cargando indefinidamente, mientras la misma URL abre correctamente en una ventana de incógnito. Esto bloquea el acceso justo después del despliegue y degrada la confianza en la publicación.

## Usuarios y Contexto

- Usuario principal: usuario autenticado recurrente de My Garage.
- Contexto de uso: apertura de la app en navegador habitual tras un despliegue o recarga de página.
- Frecuencia esperada: puntual por despliegue, pero crítica cuando ocurre.

## Objetivos

- Evitar bucles de redirección o bootstrap cuando existe un token persistido válido.
- Hacer que guards y shell partan de un estado de autenticación coherente desde el primer render.

## Fuera de Alcance

- Rediseñar el flujo completo de autenticación.
- Añadir refresh token o cambios de backend.
- Cambiar la estrategia PWA más allá de validar que no sea la causa raíz del incidente.

## Comportamiento Esperado

### Escenario Principal

1. Un usuario abre la app en su navegador habitual con una sesión persistida.
2. El frontend resuelve de forma coherente el estado autenticado inicial.
3. La app entra en la ruta privada o expulsa a login sin quedarse cargando ni alternando rutas.

### Casos Límite

- Si existe un token localmente válido pero la API ya no lo acepta, la app puede intentar la ruta privada inicialmente, pero debe cerrar sesión y llevar a `/login` sin bucle.
- Si no existe token persistido, `/login` debe seguir cargando normalmente como vista pública.
- Si el usuario abre `/login` teniendo sesión persistida válida, debe seguir siendo redirigido a `dashboard`.

## Requisitos Funcionales

- RF-1: `AuthGuard` y la shell raíz deben poder derivar un estado autenticado inicial coherente desde el token persistido.
- RF-2: la aplicación no debe oscilar entre `/login` y rutas privadas durante el arranque.
- RF-3: el flujo de logout por token inválido en backend debe seguir terminando en `/login`.

## Requisitos No Funcionales

- Rendimiento: sin añadir esperas visibles extra al arranque.
- Seguridad: no considerar autenticada una sesión sin token local válido.
- Accesibilidad: sin regresiones de navegación o foco durante las redirecciones.
- Responsive: no aplica cambio visual.
- Observabilidad: mantener logs y errores existentes para fallos de autenticación.

## UX y Diseño

- Referencia visual: `system.md`
- Pantallas afectadas: `login`, `dashboard`, shell raíz.
- Estados requeridos: autenticado | público | token persistido | token rechazado por API.
- Componentes compartidos a reutilizar/extender: ninguno nuevo.
- Capturas/mockups: no aplica.

## Contratos de Datos

### Backend/API

- Sin cambios.

### Frontend

- Servicios: `AuthService`, `UserService`
- Guardas: `AuthGuard`, `PublicOnlyGuard`
- Estado local/global: bootstrap inicial de `isAuthenticated$`

## Migraciones

- Requiere migración: no
- Backfill: no aplica
- Compatibilidad con datos existentes: total

## Criterios de Aceptación

- CA-1: dado un usuario con token persistido válido, cuando recarga la app en una ventana normal, entonces no se queda en carga infinita ni entra en bucle entre `/login` y `dashboard`.
- CA-2: dado un usuario sin token persistido, cuando abre la app, entonces ve `/login` como vista pública normal.
- CA-3: dado un usuario con token persistido local pero rechazado por la API, cuando la validación falla, entonces la app termina en `/login` sin bucle.

## Pruebas Esperadas

- Frontend: `npx tsc -p tsconfig.app.json --noEmit`
- Frontend: `npm run build`
- Manual/UI: validar recarga con token persistido y acceso en ventana sin sesión.
- No ejecutable ahora: validación manual en el navegador real del usuario con caché previa exacta de Producción.

## Dependencias

- `docs/sdd/README.md`
- `docs/sdd/workflow.md`
- `docs/sdd/quality-gates.md`
- `system.md`

## Preguntas Abiertas

- Ninguna por ahora.

## Decisiones Relacionadas

- ADR: no aplica.
