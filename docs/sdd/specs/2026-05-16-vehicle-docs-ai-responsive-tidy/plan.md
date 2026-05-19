# Plan Técnico: Ordenar y Compactar Docs & AI en Detalle de Vehículo

Spec: [docs/sdd/specs/2026-05-16-vehicle-docs-ai-responsive-tidy/spec.md](./spec.md)
Estado: In Progress
Fecha: 2026-05-16

## Enfoque

Resolver el problema desde frontend con dos cambios coordinados: compactar el contexto del vehículo cuando el usuario está en modo `docs` dentro de `vehicle-detail`, y reestructurar la pestaña `Ask` para que la jerarquía principal sea compositor + conversación, dejando configuración y voz como utilidades secundarias pero accesibles.

## Impacto por Capa

### Backend

- Modelos: sin cambios
- Schemas: sin cambios
- Servicios: sin cambios
- Endpoints: sin cambios
- Migraciones: no

### Frontend

- Rutas: sin cambios
- Servicios: sin cambios
- Componentes:
  - `frontend/src/app/features/vehicles/vehicle-detail/vehicle-detail.component.html`
  - `frontend/src/app/features/vehicles/vehicle-detail/vehicle-detail.component.scss`
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.html`
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.scss`
- Estilos:
  - compactación del contexto superior en modo docs
  - nueva jerarquía y grid responsive en `Ask`
- Componentes compartidos:
  - reutilizar `mg-surface-card`
  - mantener `app-empty-state`

### Datos

- Nuevos campos/tablas: ninguno
- Índices: no aplica
- Backfill: no aplica
- Compatibilidad: total

### Seguridad

- Autenticación/autorización: sin cambios
- Datos sensibles: sin cambios
- Logs: sin cambios

### IA/Integraciones Externas

- Integración: sin cambios sobre RAG o Web Speech API
- Estados de error: se mantienen, solo cambia su presentación
- Retry/fallback: se mantienen flujos actuales

## Cambios de Contrato

| Contrato | Cambio | Consumidores | Compatibilidad |
| --- | --- | --- | --- |
| `POST /api/v1/vehicles/{id}/chat/ask` | Sin cambios | frontend/backend | compatible |
| `VehicleChatResponse` | Sin cambios | frontend | compatible |
| `VehicleDocsAiComponent` estado local | Sin cambios funcionales | frontend | compatible |

## Estrategia de Implementación

1. Ocultar la barra de stats completa cuando `viewMode === 'docs'` y sustituirla por un resumen contextual compacto dentro de `docs-ai-view`.
2. Reestructurar el markup de `Ask` en un layout con hero/resumen, columna principal y columna secundaria.
3. Dar prioridad responsive al compositor y al historial, compactando el bloque de voz y los ajustes.
4. Revisar estilos de mensajes, citas y acciones para evitar desorden visual y wraps problemáticos.
5. Sustituir copy secundario visible por tooltips contextuales donde la explicación siga siendo útil pero no deba ocupar layout.
6. Rehacer la columna lateral de `Ask` como stack vertical de utilidades para eliminar cards demasiado estrechas y prevenir overflows.

## Estrategia de Pruebas

- Unitarias: no se prevén nuevas pruebas unitarias salvo necesidad por templates
- Integración backend: no aplica
- Frontend:
  - `npm run build`
- Manual/UI:
  - revisión desktop de `Docs & AI`
  - revisión móvil de `Docs & AI`
  - envío de pregunta con respuesta y citas
  - validación de estado vacío y de error de voz
- Migración: no aplica

## Riesgos

- Riesgo: compactar demasiado el contexto del vehículo y perder señales útiles.
  Mitigación: mantener un resumen corto con los datos más relevantes en modo docs.
- Riesgo: reordenar `Ask` y empeorar el flujo de lectura.
  Mitigación: mantener conversación y compositor como bloques claros y testar desktop/móvil manualmente.
- Riesgo: desajustes con Angular Material en móvil.
  Mitigación: usar grids sencillos y acciones full width por breakpoint.

## Rollback

Al ser un cambio frontend-only, el rollback consiste en revertir los cambios de `vehicle-detail` y `vehicle-docs-ai`.

## Observabilidad

- Logs esperados: se conservan los actuales
- Errores esperados: mismos mensajes de carga/chat/voz existentes
- Métricas/manual checks:
  - número de bloques previos al compositor en móvil
  - claridad perceptiva de conversación y citas en desktop
