# Plan Técnico: Unificar Llamadas LLM en GeminiService

Spec: [docs/sdd/specs/2026-05-16-unify-llm-gemini-service/spec.md](./spec.md)
Estado: In Progress
Fecha: 2026-05-16

## Enfoque

Extraer la integración con Gemini a una API genérica en `GeminiService` y mover la orquestación de facturas a un `InvoiceService` de dominio. El refactor mantendrá la lógica específica de cada módulo en su servicio, pero evitará llamadas directas a `google.generativeai` fuera de `GeminiService`.

## Impacto por Capa

### Backend

- Modelos: sin cambios
- Schemas: sin cambios
- Servicios:
  - `backend/app/core/gemini_service.py`
  - `backend/app/services/invoice_service.py`
  - `backend/app/services/vehicle_document_rag_service.py`
  - compatibilidad razonable en `backend/app/core/invoice_processor.py`
- Endpoints:
  - `backend/app/api/v1/endpoints/invoices.py`
  - `backend/app/api/v1/endpoints/vehicle_rag.py` sin cambios de contrato
- Migraciones: no

### Frontend

- Rutas: sin cambios
- Servicios: sin cambios
- Componentes: sin cambios
- Estilos: sin cambios
- Componentes compartidos: no aplica

### Datos

- Nuevos campos/tablas: ninguno
- Índices: no aplica
- Backfill: no aplica
- Compatibilidad: total

### Seguridad

- Autenticación/autorización: sin cambios
- Datos sensibles: mantener manejo actual de documentos y API keys
- Logs: no registrar documentos completos ni secretos

### IA/Integraciones Externas

- Integración: Gemini
- Estados de error: centralizar clasificación y fallback en `GeminiService`
- Retry/fallback: único punto de control en `GeminiService`, con listas de modelos definidas por cada servicio de dominio

## Cambios de Contrato

| Contrato | Cambio | Consumidores | Compatibilidad |
| --- | --- | --- | --- |
| `POST /api/v1/invoices/*` | Sin cambios | frontend/backend | compatible |
| `POST /api/v1/vehicles/{id}/chat/ask` | Sin cambios | frontend/backend | compatible |
| `GeminiService` | Pasa de flujo específico de facturas a API genérica de generación Gemini | backend | compatible interno |

## Estrategia de Implementación

1. Refactorizar `GeminiService` a una API genérica para generar JSON/texto y manejar contenido multimodal con API key por llamada.
2. Crear `InvoiceService` y mover ahí prompt, modelos y parsing de `InvoiceExtractedData`.
3. Adaptar `VehicleDocumentRAGService` para delegar en `GeminiService` las generaciones y la carga de PDFs/imágenes.
4. Actualizar endpoints e importaciones para usar `InvoiceService`.
5. Mantener una capa de compatibilidad mínima donde ayude a no romper imports internos existentes.
6. Ajustar tests afectados y añadir cobertura razonable del nuevo reparto de responsabilidades.

## Estrategia de Pruebas

- Unitarias:
  - `VehicleDocumentRAGService` sigue haciendo fallback vía `GeminiService`
  - `InvoiceService` extrae datos con payload válido delegando en `GeminiService`
- Integración backend:
  - compilación/import del módulo refactorizado
- Frontend: no aplica
- Manual/UI:
  - subir factura y lanzar `Ask` si se dispone de entorno real
- Migración: no aplica

## Riesgos

- Riesgo: romper el flujo multimodal al mover la subida de archivos a `GeminiService`.
  Mitigación: reutilizar un helper compartido con cleanup garantizado.
- Riesgo: dejar código duplicado o caminos mixtos tras el refactor.
  Mitigación: actualizar endpoints para apuntar al nuevo `InvoiceService` y eliminar la lógica directa restante en `VehicleDocumentRAGService`.
- Riesgo: introducir fallos por API key compartida entre peticiones.
  Mitigación: pasar la API key por llamada y evitar depender del estado mutable de la instancia.

## Rollback

Revertir el refactor de `GeminiService`, `InvoiceService` y `VehicleDocumentRAGService`, restaurando las llamadas directas previas a Gemini.

## Observabilidad

- Logs esperados: intentos por modelo y fallos desde `GeminiService`; fallos de dominio desde `InvoiceService` y `VehicleDocumentRAGService`
- Errores esperados: coherentes con los flujos actuales
- Métricas/manual checks: validación manual de facturas y `Ask` si el entorno lo permite
