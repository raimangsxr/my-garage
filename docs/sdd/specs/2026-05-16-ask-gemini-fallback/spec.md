# Spec: Robustecer Fallback Gemini en Ask

Estado: In Progress
Fecha: 2026-05-16
Tipo: hotfix
Owner: Codex

## Resumen

Corregir el flujo de `Ask` en `Docs & AI` para que el backend pruebe el siguiente modelo Gemini no solo cuando la llamada falla con error del proveedor, sino también cuando el modelo devuelve una respuesta vacía o JSON inválido para el contrato esperado.

## Problema

El flujo actual de `Ask` sí itera entre modelos cuando Gemini lanza una excepción, pero da por buena la primera respuesta que llega sin error técnico aunque el contenido no sea utilizable. Si el primer modelo responde con un payload vacío, malformado o incompatible con el JSON esperado, el usuario recibe el error inmediatamente y no se prueba el siguiente modelo de la cadena.

## Usuarios y Contexto

- Usuario principal: usuario que consulta documentación en `Vehicle Detail > Docs & AI > Ask`.
- Contexto de uso: endpoint `POST /api/v1/vehicles/{vehicle_id}/chat/ask` y expansión previa de query documental.
- Frecuencia esperada: recurrente en consultas técnicas y operativas sobre el vehículo.

## Objetivos

- Mantener el fallback entre modelos Gemini cuando haya errores del proveedor, incluidos límites 429.
- Extender el fallback a respuestas vacías o JSON inválido en los pasos de expansión de query y respuesta final.
- Mantener el contrato actual de `Ask` sin cambios para frontend.

## Fuera de Alcance

- Cambiar el orden de modelos Gemini.
- Cambiar prompts, retrieval, citas o el contrato HTTP de `Ask`.
- Añadir retries temporales, backoff o circuit breakers.

## Comportamiento Esperado

### Escenario Principal

1. El usuario envía una pregunta en `Ask`.
2. El backend intenta resolver la expansión de query o la respuesta final con el primer modelo configurado.
3. Si el modelo falla con 429 u otro error recuperable, o devuelve una respuesta vacía/JSON inválido, el backend prueba el siguiente modelo.
4. Si un modelo posterior devuelve una respuesta válida, el usuario recibe la respuesta normal con citas y nota de confianza.

### Casos Límite

- Primer modelo responde 429: el servicio debe pasar al siguiente modelo sin abortar la petición.
- Primer modelo responde texto vacío: el servicio debe tratarlo como fallo recuperable y continuar.
- Primer modelo responde JSON malformado o con forma no válida: el servicio debe tratarlo como fallo recuperable y continuar.
- Todos los modelos fallan: el error final debe seguir siendo coherente con el comportamiento actual.

## Requisitos Funcionales

- RF-1: `VehicleDocumentRAGService` debe mantener fallback ante excepciones de Gemini en `Ask`.
- RF-2: `VehicleDocumentRAGService` debe considerar recuperables las respuestas vacías en generación para `Ask`.
- RF-3: `VehicleDocumentRAGService` debe considerar recuperables las respuestas JSON inválidas cuando espera JSON.
- RF-4: `answer_question` y `expand_query_for_retrieval` deben seguir usando el mismo contrato externo actual.

## Requisitos No Funcionales

- Rendimiento: sin cambios materiales más allá de probar el siguiente modelo cuando el anterior no produce una respuesta usable.
- Seguridad: sin cambios en API keys, permisos o exposición de datos.
- Accesibilidad: no aplica.
- Responsive: no aplica.
- Observabilidad: los logs deben seguir identificando el modelo fallido y distinguir razonablemente límites 429 de payload inválido.

## UX y Diseño

- Referencia visual: no aplica
- Pantallas afectadas: `Ask` en `Docs & AI` de forma indirecta por resiliencia backend
- Estados requeridos: success | error
- Componentes compartidos a reutilizar/extender: no aplica
- Capturas/mockups: no aplica

## Contratos de Datos

### Backend/API

- Endpoint(s): `POST /api/v1/vehicles/{vehicle_id}/chat/ask`
- Request: sin cambios
- Response: sin cambios
- Errores esperados: sin cambios de contrato; mejora la resiliencia antes de devolver error

### Frontend

- Servicio(s): sin cambios de contrato
- Interface(s): sin cambios
- Estado local/global: sin cambios

## Migraciones

- Requiere migración: no
- Backfill: no aplica
- Compatibilidad con datos existentes: total

## Criterios de Aceptación

- CA-1: Dada una pregunta en `Ask`, cuando el primer modelo responde con 429, entonces el backend intenta el siguiente modelo configurado.
- CA-2: Dada una pregunta en `Ask`, cuando el primer modelo responde vacío o con JSON inválido, entonces el backend intenta el siguiente modelo configurado.
- CA-3: Dada una pregunta en `Ask`, cuando un modelo posterior devuelve JSON válido, entonces el endpoint mantiene la misma respuesta estructurada actual.
- CA-4: Dado que todos los modelos fallan o producen payload no usable, cuando termina la cadena, entonces el backend devuelve un error coherente con el comportamiento actual.

## Pruebas Esperadas

- Backend: tests unitarios del fallback por 429 y por payload JSON inválido en `VehicleDocumentRAGService`.
- Frontend: no aplica
- Manual/UI: preguntar en `Ask` con entorno Gemini real si está disponible.
- No ejecutable ahora: provocar respuestas reales inválidas o límites por proveedor de forma determinista en entorno local.

## Dependencias

- `docs/sdd/specs/2026-05-09-vehicle-document-rag/spec.md`
- `backend/app/services/vehicle_document_rag_service.py`
- `backend/test_vehicle_document_rag_service.py`

## Preguntas Abiertas

- Si en una iteración futura conviene introducir backoff o clasificación más fina de errores recuperables vs definitivos.

## Decisiones Relacionadas

- ADR: no aplica
