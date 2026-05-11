# Spec: Convertir el Frontend en PWA

Estado: In Progress
Fecha: 2026-05-11
Tipo: feature
Owner: Codex

## Resumen

Habilitar el frontend Angular como Progressive Web App instalable para que My Garage pueda fijarse en móvil/desktop, cargar con recursos cacheados y avisar cuando exista una nueva versión publicada.

## Problema

Actualmente My Garage funciona como SPA web tradicional. El usuario no puede instalarla como aplicación, no existe un manifiesto web que describa la experiencia instalada y la carga depende totalmente de la red en cada visita. Esto degrada la percepción de producto, especialmente en uso móvil o en entornos con conectividad inestable.

## Usuarios y Contexto

- Usuario principal: propietario de vehículo que consulta My Garage desde móvil o portátil.
- Contexto de uso: acceso recurrente a dashboard, vehículos, mantenimientos, facturas y circuito desde navegador moderno.
- Frecuencia esperada: diaria o semanal.

## Objetivos

- Permitir que My Garage sea instalable como app desde navegadores compatibles.
- Cachear shell y assets estáticos para que la app arranque con mayor resiliencia de red.
- Informar al usuario cuando haya una actualización disponible para evitar quedarse en una versión obsoleta.

## Fuera de Alcance

- Soporte offline completo para operaciones autenticadas contra API.
- Sincronización en background o colas de escritura offline.
- Rediseño visual de pantallas operativas.

## Comportamiento Esperado

### Escenario Principal

1. Un usuario abre My Garage en un navegador compatible.
2. El navegador detecta manifiesto, iconos y service worker válidos.
3. El usuario puede instalar la app y volver a abrirla como aplicación con identidad propia.

### Escenario Secundario

1. El usuario ya tiene abierta una versión instalada o cacheada.
2. Se despliega una nueva versión del frontend.
3. La app detecta la actualización y ofrece recargar para aplicar la versión nueva.

## Casos Límite

- Si el navegador no soporta service workers o instalación PWA, la aplicación debe seguir funcionando como SPA normal.
- Si el usuario pierde red después de haber cargado la shell, la navegación cliente a rutas conocidas debe seguir resolviendo la app mientras los datos remotos mostrarán los errores existentes.
- Si no hay sesión iniciada, la pantalla de login también debe ser instalable y coherente visualmente.

## Requisitos Funcionales

- RF-1: el frontend debe exponer `manifest.webmanifest` con nombre, colores, iconos y modo de visualización instalable.
- RF-2: el build de producción debe registrar Angular Service Worker solo en producción.
- RF-3: el service worker debe cachear shell de aplicación, assets estáticos y navegación de cliente.
- RF-4: la aplicación debe mostrar un aviso visible cuando exista una nueva versión lista para activarse.
- RF-5: la aplicación debe reflejar el estado offline/online con feedback homogéneo sin bloquear la UI.

## Requisitos No Funcionales

- Rendimiento: sin regresiones severas en el build de producción.
- Seguridad: no cachear secretos ni introducir exposición de credenciales; mantener el comportamiento autenticado actual.
- Accesibilidad: mensajes de actualización y conectividad deben ser accionables y legibles.
- Responsive: la experiencia instalada debe funcionar en móvil y desktop.
- Observabilidad: registrar errores de service worker/actualización en el logger existente cuando aplique.

## UX y Diseño

- Referencia visual: `system.md`
- Pantallas afectadas: shell raíz `AppComponent`, documento HTML base y experiencia global de la app.
- Estados requeridos: online | offline | update-available | updating
- Componentes compartidos a reutilizar/extender: patrón de `snackbar` de Angular Material existente.
- Capturas/mockups: no aplica por ahora.

## Contratos de Datos

### Backend/API

- Sin cambios.

### Frontend

- Configuración: `angular.json`, `ngsw-config.json`, `src/app/app.config.ts`
- Shell: `src/app/app.component.*`
- Runtime PWA: nuevo servicio global para `SwUpdate` y conectividad

## Migraciones

- Requiere migración: no
- Backfill: no aplica
- Compatibilidad con datos existentes: total; solo cambia la entrega/caching del frontend

## Criterios de Aceptación

- CA-1: dado un build de producción, cuando se inspecciona el HTML servido, entonces referencia un `manifest.webmanifest` válido y el navegador puede ofrecer instalación.
- CA-2: dado un navegador compatible y un build de producción, cuando la app se inicia, entonces registra service worker sin afectar el modo desarrollo.
- CA-3: dado un usuario con una versión antigua abierta, cuando existe una nueva versión descargada, entonces la app muestra una acción para recargar y aplicar la actualización.
- CA-4: dado un usuario que pierde conectividad tras haber cargado la app, cuando cambia el estado de red, entonces recibe feedback visual de offline/online.

## Pruebas Esperadas

- Frontend: `npm run build`
- Frontend: `npx tsc -p tsconfig.app.json --noEmit`
- Manual/UI: validar manifest, service worker, prompt de update y estado offline/online en navegador.
- No ejecutable ahora: auditoría Lighthouse formal si no se dispone del flujo durante esta tarea.

## Dependencias

- `docs/sdd/README.md`
- `docs/sdd/workflow.md`
- `docs/sdd/quality-gates.md`
- `system.md`
- `@angular/service-worker`

## Preguntas Abiertas

- Ninguna por ahora.

## Decisiones Relacionadas

- ADR: no aplica por ahora.
