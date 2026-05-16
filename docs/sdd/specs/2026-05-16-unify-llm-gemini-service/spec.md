# Spec: Unificar Llamadas LLM en GeminiService

Estado: In Progress
Fecha: 2026-05-16
Tipo: refactor
Owner: Codex

## Resumen

Reorganizar la arquitectura backend para que las integraciones de facturas y `Ask` usen un único `GeminiService` compartido como puerta de entrada al proveedor LLM, mientras cada servicio de dominio conserva sus prompts, reglas de interpretación y modelos priorizados.

## Problema

Hoy existen dos patrones distintos para hablar con Gemini:

- facturas concentra prompt, llamada al proveedor y fallback en `GeminiService`
- `Ask` concentra prompt, llamada al proveedor, subida de archivos y fallback dentro de `VehicleDocumentRAGService`

Esto dispersa la lógica de integración, duplica responsabilidades y dificulta controlar desde un único punto temas como fallback, validación de payload, subida multimodal y futuras mejoras transversales. Además, la configuración por API key vive acoplada al estado mutable de la instancia, lo que complica una arquitectura limpia para servicios compartidos.

## Usuarios y Contexto

- Usuario principal: usuarios que procesan facturas o preguntan sobre documentación de vehículo.
- Contexto de uso: backend FastAPI en flujos de `invoices` y `vehicle_rag`.
- Frecuencia esperada: recurrente en ambos módulos asistidos por Gemini.

## Objetivos

- Centralizar las llamadas al proveedor Gemini en `GeminiService`.
- Mantener prompts, listas de modelos y parsing de dominio en `InvoiceService` y `VehicleDocumentRAGService`.
- Reducir duplicación de lógica de fallback, validación JSON y carga multimodal.
- Mantener sin cambios los contratos HTTP existentes.

## Fuera de Alcance

- Cambiar endpoints, payloads o respuestas de facturas y `Ask`.
- Rediseñar la recuperación RAG, los prompts de producto o el orden de modelos más allá de mover su definición al servicio de dominio adecuado.
- Introducir nuevos proveedores LLM o abstracciones multiproveedor.

## Comportamiento Esperado

### Escenario Principal

1. El módulo de facturas o `Ask` construye su prompt y decide qué modelos quiere intentar.
2. El servicio de dominio llama a `GeminiService` pasando prompt, contenido, modelos, temperatura y API key.
3. `GeminiService` ejecuta la llamada al proveedor, aplica fallback y valida la respuesta genérica.
4. El servicio de dominio interpreta el payload y devuelve el resultado en su contrato actual.

### Casos Límite

- Facturas PDF e imagen: la preparación multimodal debe seguir funcionando desde el punto compartido.
- `Ask` con JSON inválido o 429: el fallback debe mantenerse desde `GeminiService`.
- API key ausente: el error debe mantenerse coherente con el comportamiento actual.
- Todos los modelos fallan: el error final debe seguir propagándose al servicio de dominio correspondiente.

## Requisitos Funcionales

- RF-1: debe existir un `InvoiceService` de dominio que procese facturas y delegue la llamada LLM en `GeminiService`.
- RF-2: `VehicleDocumentRAGService` debe delegar las llamadas LLM y la subida multimodal en `GeminiService`.
- RF-3: `GeminiService` debe concentrar fallback, validación genérica de JSON y generación de texto/JSON.
- RF-4: los prompts, listas de modelos y validación de esquema de cada flujo deben permanecer en su servicio de dominio.
- RF-5: el flujo debe evitar depender de estado mutable compartido para cambiar la API key entre peticiones.

## Requisitos No Funcionales

- Rendimiento: sin impacto material fuera de la capa de delegación.
- Seguridad: sin exposición adicional de API keys ni documentos.
- Accesibilidad: no aplica.
- Responsive: no aplica.
- Observabilidad: logs de fallo de modelo y fallback deben mantenerse desde el punto centralizado.

## UX y Diseño

- Referencia visual: no aplica
- Pantallas afectadas: no aplica directamente
- Estados requeridos: no aplica
- Componentes compartidos a reutilizar/extender: no aplica
- Capturas/mockups: no aplica

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

- CA-1: Dado el procesamiento de facturas, cuando el servicio necesita extraer datos, entonces el prompt y el parsing viven en `InvoiceService` y la llamada LLM en `GeminiService`.
- CA-2: Dado `Ask`, cuando el servicio necesita expandir query, transcribir o responder, entonces `VehicleDocumentRAGService` delega la llamada LLM en `GeminiService`.
- CA-3: Dado un error de modelo, 429 o JSON inválido, cuando se realiza la generación, entonces el fallback se resuelve desde `GeminiService`.
- CA-4: Dado que se despliega el refactor, cuando se usan los endpoints actuales de facturas y `Ask`, entonces sus contratos externos siguen siendo compatibles.

## Pruebas Esperadas

- Backend: tests unitarios razonables de `VehicleDocumentRAGService` y del nuevo `InvoiceService` o `GeminiService` donde el riesgo lo justifique.
- Frontend: no aplica
- Manual/UI: prueba funcional de facturas y `Ask` si se dispone de entorno Gemini.
- No ejecutable ahora: validación real de cuotas del proveedor o respuestas defectuosas en todos los flujos.

## Dependencias

- `docs/sdd/specs/baseline/invoices/invoice-ai-processing/spec.md`
- `docs/sdd/specs/2026-05-09-vehicle-document-rag/spec.md`
- `backend/app/core/gemini_service.py`
- `backend/app/services/vehicle_document_rag_service.py`

## Preguntas Abiertas

- Si en una iteración futura conviene mover también la resolución de API key a una capa de integración compartida.

## Decisiones Relacionadas

- ADR: no aplica por ahora
