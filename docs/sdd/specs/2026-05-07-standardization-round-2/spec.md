# Spec: Cerrar Segunda Ronda de Estandarización

Estado: Implemented
Fecha: 2026-05-07
Tipo: refactor
Owner: Codex

## Resumen

Cerrar los gaps residuales que quedaron tras la homogeneización principal: consistencia de dependencias y rutas en backend, semántica accesible pendiente en frontend y cierre administrativo de las specs SDD activas.

## Problema

La interfaz ya quedó alineada visualmente con `system.md`, pero todavía persisten pequeñas excepciones estructurales que impiden considerar la estandarización realmente cerrada: rutas backend no homogéneas, mezcla de `get_db/get_session`, una interacción clicable no semántica en perfil y specs activas que siguen abiertas aunque su trabajo ya se ejecutó.

## Usuarios y Contexto

- Usuario principal: equipo que mantiene y extiende My Garage con SDD.
- Contexto de uso: desarrollo incremental de frontend y backend sobre una base ya homogeneizada.
- Frecuencia esperada: continua en cada nueva feature o refactor.

## Objetivos

- Unificar la convención de dependencias de sesión en endpoints backend.
- Alinear `organizers` con el estándar de rutas y autenticación privada.
- Eliminar la última interacción clicable relevante sin semántica accesible.
- Dejar las specs de estandarización previas en un estado documental coherente.

## Fuera de Alcance

- Rediseñar UI o reabrir módulos ya homogeneizados visualmente.
- Reestructurar todos los servicios backend en capas nuevas.
- Cambiar contratos funcionales no relacionados con la estandarización.

## Comportamiento Esperado

### Escenario Principal

1. El equipo consulta o modifica endpoints backend relacionados con datos privados.
2. Los endpoints usan una convención homogénea de dependencia (`deps.get_db`) y autenticación cuando corresponde.
3. El frontend mantiene accesibilidad semántica también en la selección de avatar.
4. Las specs SDD reflejan que las iniciativas previas ya quedaron implementadas.

### Casos Límite

- Un consumidor actual de `/api/v1/organizers`: debe seguir funcionando con la ruta pública esperada sin duplicación `/organizers/organizers`.
- La selección de avatar debe seguir permitiendo ratón y teclado sin cambiar el flujo visual.
- El cierre documental no debe borrar trazabilidad de trabajo previo ni enlaces existentes.

## Requisitos Funcionales

- RF-1: Los endpoints backend de esta ronda deben depender de `deps.get_db` como convención estándar.
- RF-2: El endpoint de organizadores debe exponerse sin duplicar segmento de ruta y debe requerir usuario autenticado.
- RF-3: La selección de avatar en perfil debe usar un control semántico accesible por teclado.
- RF-4: Las specs de homogeneización ya ejecutadas deben actualizar su estado documental a un estado coherente.

## Requisitos No Funcionales

- Rendimiento: sin impacto material en latencia o carga.
- Seguridad: los endpoints privados deben seguir requiriendo autenticación cuando corresponde.
- Accesibilidad: la interacción de avatar debe ser navegable por teclado y anunciar estado seleccionado.
- Responsive: sin cambios de layout funcionales en mobile/desktop.
- Observabilidad: se mantienen errores y logs actuales.

## UX y Diseño

- Referencia visual: `system.md`
- Pantallas afectadas: perfil de usuario y documentación SDD.
- Estados requeridos: selected | hover | focus.
- Componentes compartidos a reutilizar/extender: no aplica; ajustar plantilla existente.
- Capturas/mockups: no requerido.

## Contratos de Datos

### Backend/API

- Endpoint(s): `GET /api/v1/organizers`
- Request: sin cambios
- Response: `list[str]`
- Errores esperados: `401` si no hay usuario autenticado; `200` con lista de organizadores

### Frontend

- Servicio(s): `frontend/src/app/services/organizer.service.ts`
- Interface(s): sin cambios
- Estado local/global: sin cambios

## Migraciones

- Requiere migración: no
- Backfill: no aplica
- Compatibilidad con datos existentes: total

## Criterios de Aceptación

- CA-1: Dado un endpoint backend privado dentro del alcance, cuando se revisa su dependencia de sesión, entonces usa `deps.get_db`.
- CA-2: Dado el endpoint de organizadores, cuando se consulta autenticado, entonces responde desde `/api/v1/organizers` sin segmento duplicado.
- CA-3: Dado el selector de avatar, cuando se navega con teclado, entonces se puede seleccionar un avatar sin depender de un `img` clicable.
- CA-4: Dado el índice SDD, cuando se revisan las iniciativas previas de estandarización, entonces ya no figuran como `In Progress` si su trabajo quedó ejecutado.

## Pruebas Esperadas

- Backend: validación estática de rutas/dependencias y smoke import.
- Frontend: `npx tsc -p tsconfig.app.json --noEmit`.
- Manual/UI: validar selección de avatar con teclado y ratón.
- No ejecutable ahora: autenticación real end-to-end si el backend local no está operativo.

## Dependencias

- Specs previas de homogeneización y remediación.
- `system.md`

## Preguntas Abiertas

- Ninguna prevista para esta ronda.

## Decisiones Relacionadas

- ADR: no aplica
