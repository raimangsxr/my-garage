# Plan Técnico: Corregir Fiabilidad de PWA, Ask y Uploads Documentales

Spec: ./spec.md
Estado: In Progress
Fecha: 2026-05-16

## Enfoque

Atacar el problema en tres capas. En frontend PWA, endurecer metadatos y señales de instalación. En `Ask`, reforzar el contrato entre recuperación real y render de fuentes para que el usuario siga viendo referencias accionables aunque el modelo falle parcial o silenciosamente. En uploads grandes, analizar el camino completo y aplicar la mitigación factible en manifests/configuración versionada y en el feedback del cliente.

## Impacto por Capa

### Backend

- Modelos: sin cambios persistentes previstos
- Schemas: `backend/app/api/v1/endpoints/vehicle_rag.py`
- Servicios: `backend/app/services/vehicle_document_rag_service.py`
- Endpoints: `POST /vehicles/{id}/chat/ask`, validación indirecta de `POST /vehicles/{id}/documents/upload`
- Migraciones: no

### Frontend

- Rutas: sin cambios
- Servicios:
  - `frontend/src/app/core/services/pwa.service.ts`
  - `frontend/src/app/core/services/vehicle-rag.service.ts`
- Componentes:
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.ts`
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.html`
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.scss`
- Estilos:
  - `frontend/src/index.html`
  - `frontend/public/manifest.webmanifest`
- Componentes compartidos: reutilizar `ToastService` y botones/chips Material existentes

### Datos

- Nuevos campos/tablas: no
- Índices: no
- Backfill: no aplica
- Compatibilidad: total

### Seguridad

- Autenticación/autorización: sin cambios en permisos
- Datos sensibles: no mostrar rutas o contenido adicional fuera del flujo actual
- Logs: añadir contexto útil sin registrar documentos completos

### IA/Integraciones Externas

- Integración: Gemini sigue respondiendo el contenido de `Ask`
- Estados de error: degradar cuando el modelo no devuelva citas válidas
- Retry/fallback: completar fuentes desde recuperación real si el payload del modelo es parcial

## Cambios de Contrato

| Contrato | Cambio | Consumidores | Compatibilidad |
| --- | --- | --- | --- |
| `VehicleChatAskResponse` | reforzar `citations`/fuentes accionables aunque el modelo falle en citarlas | frontend `Ask` | Compatible |
| `manifest.webmanifest` | añadir metadatos de instalación más robustos | navegador | Compatible |
| `deploy/k8s/ingress.yaml` | posible mitigación de timeout/buffering para uploads grandes | despliegue | Compatible |

## Estrategia de Implementación

1. Crear la spec/plan/tasks y registrar la iniciativa en `docs/sdd/specs/index.md`.
2. Revisar y ajustar PWA (`manifest`, `index.html`, servicio runtime) para cubrir carencias de instalación móvil.
3. Reforzar backend RAG para que las fuentes visibles no dependan únicamente de un payload perfecto de Gemini.
4. Ajustar `Ask` para renderizar esas fuentes y soportar envío con `Enter` y nueva línea con `Shift+Enter`.
5. Analizar el `504` de uploads grandes; si la causa probable está en manifests/versionado, aplicar la mitigación y mejorar feedback del cliente ante gateway timeout.
6. Validar build/tests y documentar lo no reproducible en local.

## Estrategia de Pruebas

- Unitarias:
  - servicio RAG con payload sin citas válidas pero con fuentes recuperadas
  - helpers de URL de fuente/página si aplica
- Integración backend:
  - endpoint de `ask` devolviendo fuentes accionables
- Frontend:
  - `npm run build`
  - tipado del componente `Ask`
- Manual/UI:
  - teclado `Enter`/`Shift+Enter`
  - fuentes clicables con página
  - inspección de manifest/service worker
  - error de upload grande claramente visible
- Migración: no aplica

## Riesgos

- Riesgo: mostrar demasiadas fuentes poco precisas si el fallback es agresivo.
  Mitigación: limitar el fallback a fuentes recuperadas top-ranked y mantener notas de confianza.
- Riesgo: el problema PWA real provenga de comportamiento específico del navegador/dispositivo y no solo de metadatos.
  Mitigación: corregir las carencias objetivas del manifiesto y documentar lo pendiente si hace falta validación física.
- Riesgo: el `504` dependa de infraestructura externa no definida en este repo.
  Mitigación: dejar identificado que la app no emite `504`, endurecer manifests propios y mejorar mensaje de error para el usuario.

## Rollback

Revertir cambios en manifest/PWA, serialización de fuentes en RAG, comportamiento de `Enter` y cualquier anotación de ingress añadida. El comportamiento volvería al estado actual, con las limitaciones detectadas.

## Observabilidad

- Logs esperados:
  - errores PWA de update/instalación
  - payloads/casos de fuentes sin citas válidas
  - errores `504`/gateway en uploads documentales
- Errores esperados:
  - fallbacks de citas incompletas del modelo
  - timeouts de gateway fuera de la app
- Métricas/manual checks:
  - manifest válido con iconos y `id`
  - respuesta de `Ask` con fuentes visibles
  - apertura correcta de documento/página
