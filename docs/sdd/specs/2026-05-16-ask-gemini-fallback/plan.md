# Plan Técnico: Robustecer Fallback Gemini en Ask

Spec: [docs/sdd/specs/2026-05-16-ask-gemini-fallback/spec.md](./spec.md)
Estado: In Progress
Fecha: 2026-05-16

## Enfoque

Hacer más robusta la capa de generación usada por `Ask` dentro de `VehicleDocumentRAGService`, de forma que el servicio no considere exitoso un modelo hasta verificar que la respuesta recibida es usable para el tipo esperado. En generación JSON eso implica validar el payload antes de salir del loop de modelos; en cualquier generación implica tratar respuestas vacías como fallo recuperable.

## Impacto por Capa

### Backend

- Modelos: sin cambios
- Schemas: sin cambios
- Servicios:
  - `backend/app/services/vehicle_document_rag_service.py`
- Endpoints:
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
- Datos sensibles: sin cambios
- Logs: mantener logs útiles sin incluir contenido documental sensible completo

### IA/Integraciones Externas

- Integración: Gemini
- Estados de error: distinguir en logs entre límite/cuota, respuesta vacía y payload inválido
- Retry/fallback: continuar al siguiente modelo ante excepción del proveedor, 429, respuesta vacía o JSON inválido

## Cambios de Contrato

| Contrato | Cambio | Consumidores | Compatibilidad |
| --- | --- | --- | --- |
| `POST /api/v1/vehicles/{vehicle_id}/chat/ask` | Sin cambios | frontend/backend | compatible |
| `VehicleDocumentRAGService._generate_content` | Valida usabilidad de la respuesta antes de considerar éxito | backend | compatible |

## Estrategia de Implementación

1. Ajustar `_generate_content` para validar respuesta vacía antes de devolver éxito.
2. Validar JSON dentro del loop cuando `expect_json=True`, de modo que un payload inválido dispare fallback al siguiente modelo.
3. Mejorar logging para hacer visible si el fallback se debe a 429/cuota o a payload no usable.
4. Añadir tests unitarios que cubran fallback por 429 y por JSON inválido antes de un modelo exitoso.

## Estrategia de Pruebas

- Unitarias:
  - fallback al segundo modelo cuando el primero lanza 429
  - fallback al segundo modelo cuando el primero devuelve JSON inválido
  - mantenimiento del resultado válido cuando el segundo modelo responde correctamente
- Integración backend: no aplica
- Frontend: no aplica
- Manual/UI: validar `Ask` contra backend real si se dispone de API key/entorno
- Migración: no aplica

## Riesgos

- Riesgo: clasificar como inválida una respuesta que luego pudiera parsearse en otra capa.
  Mitigación: reutilizar el parser existente `_parse_json_payload` como criterio de validez.
- Riesgo: generar más intentos por petición cuando un modelo responde con payload defectuoso.
  Mitigación: mantener la misma cadena acotada de modelos y sin introducir retries adicionales.

## Rollback

Revertir los cambios en `VehicleDocumentRAGService` y restaurar la lógica anterior que aceptaba la primera respuesta no excepcional.

## Observabilidad

- Logs esperados: fallo por modelo con motivo de cuota/429, respuesta vacía o JSON inválido
- Errores esperados: `All Gemini models failed` si ninguno produce respuesta usable
- Métricas/manual checks: revisar logs del backend al forzar modelos fallidos o payload inválido en tests
