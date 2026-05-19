# Plan Técnico: Overhaul de Docs & AI

Spec: `docs/sdd/specs/2026-05-16-docs-ai-overhaul/spec.md`
Estado: In Progress
Fecha: 2026-05-16

## Enfoque

Reordenar `Docs & AI` alrededor de la acción principal y simplificar su composición. La implementación se apoya en dos frentes: limpiar la estructura visual de `vehicle-detail` para que la entrada a `Docs & AI` sea más ligera y rehacer el layout interno de `VehicleDocsAiComponent` con bloques más robustos, estados explícitos y restricciones responsive seguras.

## Impacto por Capa

### Backend

- Modelos: sin cambios
- Schemas: sin cambios
- Servicios: sin cambios
- Endpoints: sin cambios
- Migraciones: no

### Frontend

- Rutas: sin cambios
- Servicios:
  - `frontend/src/app/core/services/vehicle-rag.service.ts` sin cambios de contrato
- Componentes:
  - `frontend/src/app/features/vehicles/vehicle-detail/vehicle-detail.component.ts`
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.ts`
- Estilos:
  - `frontend/src/app/features/vehicles/vehicle-detail/vehicle-detail.component.scss`
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.scss`
- Componentes compartidos:
  - reutilizar `app-empty-state`
  - reutilizar `app-page-loader`
  - mantener `mg-surface-card`
  - evaluar extensión ligera de patrón visual mediante clases del módulo, no nuevos shared components todavía

### Datos

- Nuevos campos/tablas: ninguno
- Índices: no aplica
- Backfill: no aplica
- Compatibilidad: total

### Seguridad

- Autenticación/autorización: sin impacto
- Datos sensibles: sin impacto
- Logs: se conservan logs existentes del flujo de voz/chat

### IA/Integraciones Externas

- Integración: RAG documental existente, sin cambios
- Estados de error: añadir representación visible de error en frontend
- Retry/fallback: retry manual desde la interfaz para cargas/consultas fallidas

## Cambios de Contrato

| Contrato | Cambio | Consumidores | Compatibilidad |
| --- | --- | --- | --- |
| `VehicleRagService` | Sin cambios | frontend | compatible |
| `VehicleDocsAiComponent` API pública | Sin cambios en inputs | `vehicle-detail` | compatible |

## Estrategia de Implementación

1. Documentar la iniciativa SDD y preservar el contexto de specs previas.
2. Simplificar la entrada visual a `Docs & AI` en `vehicle-detail`, reduciendo el peso del contexto previo.
3. Reordenar `Ask` para que compositor e historial lideren la jerarquía y los paneles secundarios no rompan el layout.
4. Replantear `Documents` con una composición más densa y operativa.
5. Introducir estados de error explícitos para la carga documental y la consulta.
6. Validar build y experiencia real en `localhost:4200`.

## Estrategia de Pruebas

- Unitarias: no se prevén tests nuevos en esta iteración salvo que emerja lógica nueva aislable
- Integración backend: no aplica
- Frontend:
  - `npm run build`
- Manual/UI:
  - login en `localhost:4200`
  - `vehicles/2` en modo `Docs & AI`
  - `Ask` desktop
  - `Documents` desktop
  - `Docs & AI` móvil
  - revisión básica de voz soportada
- Migración: no aplica

## Riesgos

- Layout compartido entre `Ask` y `Documents`: mitigar con validación visual real en ambos tabs.
- Árbol local con cambios previos en los mismos archivos: mitigar trabajando incrementalmente sobre el estado actual y evitando revertir trabajo existente.
- Componente demasiado grande: mitigar con una primera reestructuración clara aunque la extracción completa de subcomponentes quede para una siguiente fase.

## Rollback

Revertir los cambios en los archivos frontend afectados y mantener el comportamiento previo. No hay impacto en datos ni backend.

## Observabilidad

- Logs esperados: se mantienen logs actuales de voz y errores de chat/documentos
- Errores esperados: mensajes visibles de error de carga y consulta
- Métricas/manual checks: comprobación visual de ausencia de colapsos, scroll excesivo y regresiones funcionales
