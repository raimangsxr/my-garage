# Plan Técnico: Corregir Merge Parcial en Ask de Docs & AI

Spec: [docs/sdd/specs/2026-05-16-docs-ai-ask-merge-fix/spec.md](./spec.md)
Estado: In Progress
Fecha: 2026-05-16

## Enfoque

Aplicar un hotfix frontend mínimo para eliminar del template de `Ask` el bloque que aún referencia sugerencias eliminadas, y ajustar cualquier estilo residual asociado. No se tocará la lógica del flujo de voz ni el contrato de datos.

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
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.html`
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.scss`
- Estilos: limpieza del selector asociado a sugerencias si sigue presente
- Componentes compartidos: no aplica

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

- Integración: no aplica
- Estados de error: no aplica
- Retry/fallback: no aplica

## Cambios de Contrato

| Contrato | Cambio | Consumidores | Compatibilidad |
| --- | --- | --- | --- |
| Template de `Ask` | Elimina referencias huérfanas a sugerencias | frontend | compatible |

## Estrategia de Implementación

1. Eliminar del template el bloque de sugerencias antiguas.
2. Eliminar estilo residual asociado si sigue existiendo.
3. Ejecutar build de frontend para confirmar que el merge roto queda resuelto.

## Estrategia de Pruebas

- Unitarias: no aplica en esta iteración mínima
- Integración backend: no aplica
- Frontend: `npm run build`
- Manual/UI: comprobar que `Ask` abre por defecto y no muestra sugerencias
- Migración: no aplica

## Riesgos

- Riesgo: dejar otra referencia residual en el componente.
  Mitigación: validar con compilación completa de Angular.

## Rollback

Revertir el commit del hotfix si apareciera una regresión inesperada en `Ask`.

## Observabilidad

- Logs esperados: no aplica
- Errores esperados: no aplica
- Métricas/manual checks: compilación del frontend y comprobación visual mínima
