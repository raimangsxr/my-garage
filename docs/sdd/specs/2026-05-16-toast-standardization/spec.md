# Spec: Homogeneizar Toasts y Snackbars

Estado: In Progress
Fecha: 2026-05-16
Tipo: refactor
Owner: Codex

## Resumen

Unifica todas las notificaciones tipo toast/snackbar del frontend bajo un servicio compartido y fija su ubicación en la esquina inferior derecha.

## Problema

La aplicación muestra feedback emergente con aperturas directas de `MatSnackBar` dispersas por módulos, sin posición uniforme y sin un wrapper del design system. Esto provoca una UX inconsistente y hace fácil que nuevos cambios reintroduzcan divergencias.

## Usuarios y Contexto

- Usuario principal: propietario del garaje y mecánico que opera la app
- Contexto de uso: cualquier flujo con feedback breve de éxito, error, advertencia o información
- Frecuencia esperada: diaria

## Objetivos

- Garantizar que todos los toast/snackbar emergentes se muestren en `bottom-right`.
- Centralizar la apertura y semántica visual de los toast en un servicio compartido reutilizable.

## Fuera de Alcance

- Cambiar el contenido textual de todos los mensajes más allá de lo necesario para migrarlos.
- Sustituir snackbars por otro patrón de feedback como banners, dialogs o alerts inline.

## Comportamiento Esperado

### Escenario Principal

1. El usuario realiza una acción que dispara feedback breve.
2. La aplicación abre la notificación mediante el servicio compartido del design system.
3. La notificación aparece en la esquina inferior derecha, con estilo coherente según su severidad.

### Casos Límite

- Snackbar con acción persistente: debe seguir apareciendo en `bottom-right` y mantener su acción funcional.
- Error global interceptado por HTTP interceptor: debe mostrarse también mediante el servicio compartido y no quedar en una posición distinta al resto.

## Requisitos Funcionales

- RF-1: El sistema debe exponer un servicio frontend compartido para abrir toast/snackbar con posición por defecto `bottom-right`.
- RF-2: El sistema debe soportar variantes `success`, `warning`, `info` y `error` reutilizando las clases visuales globales existentes.
- RF-3: El sistema debe permitir snackbars con acción, incluyendo duración persistente cuando un flujo lo requiera.
- RF-4: Todos los puntos actuales que abren toast/snackbar en el frontend deben migrarse al servicio compartido.

## Requisitos No Funcionales

- Rendimiento: la migración no debe introducir trabajo extra perceptible ni lógica asíncrona adicional.
- Seguridad: no cambia permisos ni exposición de datos.
- Accesibilidad: la acción del snackbar debe seguir siendo accesible por teclado y visible.
- Responsive: la ubicación debe mantenerse consistente en desktop y mobile.
- Observabilidad: los errores globales y avisos PWA deben seguir trazables desde sus servicios/interceptores actuales.

## UX y Diseño

- Referencia visual: `system.md`
- Pantallas afectadas: login, perfil, settings, notifications, maintenance, parts, suppliers, invoices, vehicle detail docs & AI, PWA/global errors
- Estados requeridos: success | error | warning | info
- Componentes compartidos a reutilizar/extender: nuevo `ToastService` sobre Angular Material snackbar
- Capturas/mockups: no aplica

## Contratos de Datos

### Backend/API

- Endpoint(s): no aplica
- Request: no aplica
- Response: no aplica
- Errores esperados: no aplica

### Frontend

- Servicio(s): `frontend/src/app/core/services/toast.service.ts`
- Interface(s): opciones de toast para mensaje, acción, duración y tono visual
- Estado local/global: no añade estado global persistente; centraliza apertura de feedback efímero

## Migraciones

- Requiere migración: no
- Backfill: no aplica
- Compatibilidad con datos existentes: no afecta datos persistidos ni contratos API

## Criterios de Aceptación

- CA-1: Dado cualquier flujo existente que abra un snackbar, cuando se muestre una notificación, entonces aparece en la esquina inferior derecha.
- CA-2: Dado un flujo de éxito, error, advertencia o información, cuando se abra su toast, entonces usa el estilo semántico homogéneo del design system.
- CA-3: Dado un snackbar con acción como actualización PWA, cuando el usuario pulse la acción, entonces el comportamiento previo sigue funcionando.
- CA-4: Dado un error HTTP no silencioso, cuando el interceptor lo capture, entonces el feedback al usuario usa el servicio compartido y la misma posición que el resto.

## Pruebas Esperadas

- Backend: no aplica
- Frontend: build del frontend y búsqueda estática para asegurar que no queden aperturas directas de `MatSnackBar` en los puntos migrados
- Manual/UI: validar al menos un toast de éxito, uno de error y uno con acción persistente
- No ejecutable ahora: validación visual exhaustiva cross-browser/manual completa si no hay entorno interactivo levantado

## Dependencias

- Angular Material snackbar
- `system.md`

## Preguntas Abiertas

- Ninguna bloqueante para esta implementación.

## Decisiones Relacionadas

- ADR: no aplica
