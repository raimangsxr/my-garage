# Plan Técnico: Centralizar Fallbacks Gemini en GeminiService

Spec: [docs/sdd/specs/2026-05-16-centralize-gemini-fallbacks/spec.md](./spec.md)
Estado: In Progress
Fecha: 2026-05-16

## Enfoque

Extender `GeminiService` con soporte genérico para validación de payload y ejecución de fallback por llamada, de forma que los servicios de dominio describan el payload mínimo aceptable y la degradación deseada, pero no gestionen directamente el `try/except` ni la decisión de fallback.

## Impacto por Capa

### Backend

- Servicios:
  - `backend/app/core/gemini_service.py`
  - `backend/app/services/vehicle_document_rag_service.py`
- Endpoints: sin cambios
- Migraciones: no

### IA/Integraciones Externas

- Integración: Gemini
- Estados de error: centralizados en `GeminiService`
- Retry/fallback: la política ligada a Gemini sale del dominio y se ejecuta desde el proxy

## Estrategia de Implementación

1. Añadir a `GeminiService` una API de generación JSON con `validator` y `fallback_resolver`.
2. Adaptar `VehicleDocumentRAGService` para usar esa API en expansión de query, facts y transcripción de imagen.
3. Separar la lista de `ANSWER_MODELS` de la de `TRANSCRIPTION_MODELS` para reflejar prioridades distintas sin sacar el fallback del proxy.
4. Mantener intactos los fallbacks de negocio no ligados a Gemini.
5. Añadir tests unitarios de la nueva capacidad del proxy.

## Estrategia de Pruebas

- Unitarias:
  - `GeminiService` ejecuta fallback cuando el validador rechaza el payload
  - `VehicleDocumentRAGService` sigue resolviendo query expansion y facts sin `try/except` de fallback local
- Integración backend: compilación/import
- Manual/UI: opcional

## Riesgos

- Riesgo: que el fallback configurable vuelva demasiado genérica la API.
  Mitigación: mantenerla pequeña y acotada a JSON Gemini.

## Rollback

Revertir el soporte de fallback configurable en `GeminiService` y restaurar la gestión local previa.

## Observabilidad

- Logs esperados: fallback Gemini activado por excepción o por validación fallida
