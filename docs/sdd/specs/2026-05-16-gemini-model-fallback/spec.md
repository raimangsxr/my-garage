# Spec: Actualizar Fallback de Modelos Gemini

Estado: In Progress
Fecha: 2026-05-16
Tipo: refactor
Owner: Codex

## Resumen

Actualizar la prioridad de modelos usada por `GeminiService` al procesar facturas para que el fallback pruebe modelos disponibles y más adecuados antes de agotar la cadena de reintentos.

## Problema

La lista actual de fallback de Gemini puede intentar modelos menos deseables o ya desfasados antes de probar opciones mejores disponibles para extracción de facturas. Cuando una cuota o un modelo falla, el orden de degradación impacta directamente en la probabilidad de completar el procesamiento sin intervención manual.

## Usuarios y Contexto

- Usuario principal: usuario que sube facturas para extracción asistida por IA.
- Contexto de uso: procesamiento de facturas en backend mediante `backend/app/core/gemini_service.py`.
- Frecuencia esperada: recurrente en cualquier ingestión de facturas.

## Objetivos

- Priorizar un orden de modelos Gemini más útil para el fallback operativo.
- Mantener intacto el contrato del procesamiento de facturas.
- Reducir la probabilidad de caer en modelos obsoletos o menos adecuados.

## Fuera de Alcance

- Cambiar prompts, parsing JSON o contrato de `InvoiceExtractedData`.
- Añadir nuevas integraciones externas o nuevos mecanismos de retry.
- Rediseñar la estrategia de cuotas más allá del orden de modelos.

## Comportamiento Esperado

### Escenario Principal

1. El backend intenta procesar una factura con el primer modelo priorizado.
2. Si ese modelo falla por cuota u otro error recuperable, prueba el siguiente en el orden definido.
3. El flujo devuelve la misma estructura de extracción actual cuando cualquiera de los modelos responde correctamente.

### Casos Límite

- Falla por cuota del primer modelo: el servicio debe pasar al siguiente modelo disponible.
- Falla de todos los modelos: el error final debe mantenerse coherente con el comportamiento actual.
- Facturas PDF e imagen: el cambio de fallback no debe alterar la preparación del contenido.

## Requisitos Funcionales

- RF-1: `GeminiService` debe actualizar el orden de `AVAILABLE_MODELS`.
- RF-2: la lista debe incluir los modelos nuevos priorizados para esta iteración.
- RF-3: el servicio debe mantener el mismo loop de fallback y la misma serialización final.

## Requisitos No Funcionales

- Rendimiento: sin impacto material fuera del orden de reintentos.
- Seguridad: sin cambios en API keys ni permisos.
- Accesibilidad: no aplica.
- Responsive: no aplica.
- Observabilidad: deben conservarse los logs por modelo intentado y fallo final.

## UX y Diseño

- Referencia visual: no aplica
- Pantallas afectadas: no aplica
- Estados requeridos: no aplica
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

- CA-1: Dada una factura procesada con Gemini, cuando el primer modelo priorizado falla, entonces el backend intenta el siguiente modelo definido en `AVAILABLE_MODELS`.
- CA-2: Dado el cambio de fallback, cuando un modelo responde correctamente, entonces la estructura de `InvoiceExtractedData` sigue siendo compatible con el flujo actual.
- CA-3: Dado que todos los modelos fallan, cuando termina el loop, entonces el servicio mantiene el error final coherente con el comportamiento existente.

## Pruebas Esperadas

- Backend: validación razonable del orden de fallback y de que el módulo sigue cargando.
- Frontend: no aplica
- Manual/UI: prueba funcional de procesamiento de factura si se dispone de entorno con Gemini.
- No ejecutable ahora: simulación real de cuotas por modelo sin entorno controlado del proveedor.

## Dependencias

- `docs/sdd/specs/baseline/invoices/invoice-ai-processing/spec.md`
- `backend/app/core/gemini_service.py`

## Preguntas Abiertas

- Si conviene externalizar la lista de modelos a configuración en una iteración futura.

## Decisiones Relacionadas

- ADR: no aplica
