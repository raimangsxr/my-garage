# Spec: Centralizar Fallbacks Gemini en GeminiService

Estado: In Progress
Fecha: 2026-05-16
Tipo: refactor
Owner: Codex

## Resumen

Reforzar la arquitectura backend para que cualquier fallback relacionado con llamadas a Gemini o con payloads devueltos por Gemini se gestione exclusivamente dentro de `GeminiService`, manteniendo en los servicios de dominio solo la lógica de negocio no ligada al proveedor.

## Problema

Tras la unificación inicial de llamadas LLM, aún quedan fallbacks ligados a Gemini fuera de `GeminiService`, especialmente en `VehicleDocumentRAGService`. Esto difumina la frontera arquitectónica del proxy, complica la observabilidad y hace menos predecible dónde se decide degradar comportamiento cuando Gemini falla o responde con datos no utilizables.

## Usuarios y Contexto

- Usuario principal: usuario que usa facturas o `Ask`.
- Contexto de uso: backend FastAPI en integraciones Gemini centralizadas.
- Frecuencia esperada: recurrente en cualquier flujo que invoque Gemini.

## Objetivos

- Mover a `GeminiService` la gestión de fallbacks vinculados a errores o payloads de Gemini.
- Mantener en servicios de dominio solo prompts, modelos, parsing y decisiones de negocio no vinculadas al proveedor.
- Hacer explícita la frontera arquitectónica: `GeminiService` es el proxy único hacia Gemini.

## Fuera de Alcance

- Eliminar fallbacks de negocio no relacionados con Gemini, como la respuesta cuando no hay fuentes recuperadas.
- Cambiar contratos HTTP de facturas o `Ask`.
- Redefinir prompts o listas de modelos salvo lo necesario para el refactor.

## Comportamiento Esperado

### Escenario Principal

1. Un servicio de dominio solicita una operación a `GeminiService`.
2. Si Gemini falla, responde vacío, devuelve JSON inválido o el payload no supera la validación requerida por el dominio, `GeminiService` decide y ejecuta el fallback configurado.
3. El servicio de dominio recibe un resultado final o un error ya resuelto desde el proxy.

### Casos Límite

- Expansión de query en `Ask` falla: el valor por defecto debe resolverse desde `GeminiService`.
- Extracción de facts falla: el resultado degradado debe resolverse desde `GeminiService`.
- Transcripción documental devuelve estructura vacía en imagen: el fallback a texto plano debe resolverse desde `GeminiService`.
- `Ask` usa listas distintas para respuesta y transcripción: la selección de modelos debe seguir viviendo en `VehicleDocumentRAGService`, mientras el fallback permanece centralizado en `GeminiService`.

## Requisitos Funcionales

- RF-1: `GeminiService` debe poder ejecutar fallbacks configurables por llamada para JSON Gemini.
- RF-2: `GeminiService` debe poder validar payloads Gemini con reglas aportadas por el dominio antes de considerar éxito.
- RF-3: `VehicleDocumentRAGService` no debe capturar errores Gemini para decidir degradaciones; debe delegar esa decisión al proxy.
- RF-4: los fallbacks de negocio no relacionados con acceso a Gemini pueden permanecer en el dominio.
- RF-5: `VehicleDocumentRAGService` debe poder definir listas de modelos distintas para `ANSWER_MODELS` y `TRANSCRIPTION_MODELS`.

## Requisitos No Funcionales

- Rendimiento: sin impacto material fuera de un pequeño coste de validación.
- Seguridad: sin cambios en secretos o permisos.
- Accesibilidad: no aplica.
- Responsive: no aplica.
- Observabilidad: logs de fallback Gemini deben salir del punto central.

## Contratos de Datos

### Backend/API

- Endpoint(s): sin cambios
- Request: sin cambios
- Response: sin cambios
- Errores esperados: sin cambios de contrato

### Frontend

- Servicio(s): sin cambios
- Interface(s): sin cambios
- Estado local/global: sin cambios

## Migraciones

- Requiere migración: no
- Backfill: no aplica
- Compatibilidad con datos existentes: total

## Criterios de Aceptación

- CA-1: Dado un fallback de expansión de query Gemini, cuando falle la generación, entonces `GeminiService` devuelve el payload degradado sin que `VehicleDocumentRAGService` gestione el fallback.
- CA-2: Dado un payload Gemini estructuralmente válido pero no usable para transcripción de imagen, cuando falle la validación, entonces `GeminiService` ejecuta el fallback configurado.
- CA-3: Dado un fallo de extracción de facts con Gemini, cuando se degrade a resultado vacío, entonces esa degradación queda centralizada en `GeminiService`.

## Pruebas Esperadas

- Backend: tests unitarios del nuevo mecanismo de fallback configurable en `GeminiService` y de los consumidores afectados.
- Frontend: no aplica
- Manual/UI: validación funcional opcional de `Ask`.
- No ejecutable ahora: simulación real de errores proveedor en todos los entornos.

## Dependencias

- `docs/sdd/specs/2026-05-16-unify-llm-gemini-service/spec.md`
- `backend/app/core/gemini_service.py`
- `backend/app/services/vehicle_document_rag_service.py`

## Preguntas Abiertas

- Si más adelante conviene declarar políticas de fallback reutilizables con nombres explícitos.

## Decisiones Relacionadas

- ADR: no aplica
