# Spec: Corregir Merge Parcial en Ask de Docs & AI

Estado: In Progress
Fecha: 2026-05-16
Tipo: hotfix
Owner: Codex

## Resumen

Corregir un merge parcial en `Docs & AI > Ask` que dejó el frontend en estado inconsistente: la pestaña `Ask` y el toggle de auto-submit sí llegaron a `main`, pero el bloque de sugerencias antiguas quedó en el template aunque su lógica ya no existe en el componente.

## Problema

La vista `Ask` referencia `suggestedQuestions` y `askSuggestedQuestion(...)` en el template, pero ambas piezas ya no existen en `VehicleDocsAiComponent`. Esto rompe el build de Angular y además contradice el comportamiento aprobado para eliminar las sugerencias predefinidas.

## Usuarios y Contexto

- Usuario principal: cualquier usuario que acceda a `Vehicle Detail > Docs & AI > Ask`.
- Contexto de uso: `frontend/src/app/features/vehicles/components/vehicle-docs-ai/*`
- Frecuencia esperada: recurrente.

## Objetivos

- Restaurar un estado compilable y coherente del panel `Ask`.
- Alinear `main` con el comportamiento esperado: sin sugerencias predefinidas.

## Fuera de Alcance

- Replantear el diseño completo de `Ask`.
- Cambiar el flujo de voz o el contrato RAG más allá de este arreglo.

## Comportamiento Esperado

### Escenario Principal

1. El usuario entra en `Docs & AI`.
2. La pestaña `Ask` abre por defecto.
3. La vista no muestra sugerencias predefinidas y el frontend compila correctamente.

### Casos Límite

- Historial vacío: la vista sigue siendo usable sin sugerencias.
- Auto-submit activado/desactivado: el comportamiento existente no debe cambiar.

## Requisitos Funcionales

- RF-1: el template de `Ask` no debe referenciar propiedades o métodos inexistentes en `VehicleDocsAiComponent`.
- RF-2: la vista `Ask` no debe mostrar el bloque de sugerencias predefinidas.
- RF-3: el resto del comportamiento ya mergeado en `main` debe mantenerse intacto.

## Requisitos No Funcionales

- Rendimiento: sin impacto apreciable.
- Seguridad: sin cambios.
- Accesibilidad: sin regresión respecto a controles existentes.
- Responsive: sin regresión respecto al layout actual.
- Observabilidad: no aplica.

## UX y Diseño

- Referencia visual: `system.md`
- Pantallas afectadas:
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.html`
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.scss`
- Estados requeridos: loading | empty | error | success | disabled
- Componentes compartidos a reutilizar/extender: no aplica
- Capturas/mockups: no aplica

## Contratos de Datos

### Backend/API

- Endpoint(s): sin cambios
- Request: sin cambios
- Response: sin cambios
- Errores esperados: sin cambios

### Frontend

- Servicio(s): sin cambios
- Interface(s): sin cambios
- Estado local/global: sin cambios

## Migraciones

- Requiere migración: no
- Backfill: no aplica
- Compatibilidad con datos existentes: total

## Criterios de Aceptación

- CA-1: Dado `main`, cuando se ejecuta `npm run build` en frontend, entonces la compilación vuelve a completarse sin errores por `suggestedQuestions` o `askSuggestedQuestion`.
- CA-2: Dado el panel `Ask`, cuando el historial está vacío, entonces no se muestran sugerencias predefinidas.
- CA-3: Dado el flujo actual de `Ask`, cuando el usuario utiliza la pestaña por defecto y el toggle de auto-submit, entonces esas capacidades siguen disponibles sin regresión.

## Pruebas Esperadas

- Backend: no aplica
- Frontend: `npm run build`
- Manual/UI: revisar que `Ask` abre por defecto y que ya no se renderizan sugerencias
- No ejecutable ahora: validación manual completa del flujo de voz en navegador real

## Dependencias

- `docs/sdd/specs/2026-05-16-vehicle-ask-restyling/spec.md`
- `system.md`

## Preguntas Abiertas

- Ninguna para este hotfix.

## Decisiones Relacionadas

- ADR: no aplica
