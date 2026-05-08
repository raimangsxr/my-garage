# Plan Técnico: Corregir Tarjetas Vacías en Detalle de Vehículo

Spec: ./spec.md
Estado: Implemented
Fecha: 2026-05-07

## Enfoque

Corregir el bug en el patrón compartido `app-entity-card` para que la superficie clickable use un contenedor semántico accesible compatible con contenido de bloque, y ajustar `vehicle-detail` para abrir parts en modo editable con refresco posterior.

Actualización 2026-05-07: ajustar las reglas responsive de `app-entity-column`, `app-entity-card`, `vehicle-parts-list` y las invoices embebidas para que los grid/flex items puedan encogerse (`min-width: 0`) y los textos largos no fuercen overflow horizontal.

## Impacto por Capa

### Backend

- Modelos: sin cambios.
- Schemas: sin cambios.
- Servicios: sin cambios.
- Endpoints: sin cambios.
- Migraciones: no.

### Frontend

- Rutas: sin cambios.
- Servicios: sin cambios.
- Componentes: `entity-card`, `vehicle-detail`, `vehicle-parts-list`.
- Estilos: `entity-card.component.scss`, `entity-column.component.scss`, `vehicle-detail.component.scss`, `vehicle-parts-list.component.scss`.
- Componentes compartidos: `app-entity-card`.

### Datos

- Nuevos campos/tablas: ninguno.
- Índices: ninguno.
- Backfill: no aplica.
- Compatibilidad: total.

### Seguridad

- Autenticación/autorización: sin cambios.
- Datos sensibles: sin cambios.
- Logs: se mantienen logs existentes.

### IA/Integraciones Externas

- Integración: no aplica.
- Estados de error: sin cambios.
- Retry/fallback: no aplica.

## Cambios de Contrato

| Contrato | Cambio | Consumidores | Compatibilidad |
| --- | --- | --- | --- |
| `app-entity-card` | cambia la implementación interna de la superficie clickable | Frontend | Compatible |
| `vehicle-detail` part dialog | deja de abrir en read-only y refresca al guardar | Frontend | Compatible |
| Layout de cards de entidad | cards y columnas permiten encogimiento y wrap controlado | Frontend | Compatible |

## Estrategia de Implementación

1. Actualizar la spec, plan y tasks del fix.
2. Corregir `app-entity-card` para usar un contenedor válido con semántica de botón.
3. Ajustar `openPartDialog()` para edición y refresco tras cierre.
4. Verificar que invoices y parts vuelven a renderizar contenido visible.
5. Añadir `min-width: 0`, `box-sizing: border-box` y wrapping/truncado controlado en las superficies afectadas para eliminar scroll horizontal.

## Estrategia de Pruebas

- Frontend: TypeScript sin emisión.
- Frontend: build completo.
- Manual/UI: comprobar visualización de tarjetas y edición de part.
- Manual/UI: comprobar que no aparece scroll horizontal en `Parts` ni `Invoices` en la vista street.

## Riesgos

- Riesgo: cambiar `app-entity-card` afecte otros usos.
  Mitigación: conservar roles, teclado y clases existentes.
- Riesgo: ocultar datos por truncado excesivo.
  Mitigación: aplicar truncado solo a campos secundarios largos y permitir wrap donde el dato completo sea prioritario.

## Rollback

Revertir `entity-card` y el cambio de `vehicle-detail` si aparece regresión en otras superficies.

Para la actualización de overflow, revertir los cambios SCSS de `entity-column`, `entity-card`, `vehicle-detail` y `vehicle-parts-list`.

## Observabilidad

- Logs esperados: logs actuales de actualización de parts.
- Errores esperados: errores actuales de guardado si fallan servicios.
- Métricas/manual checks: revisión visual de `vehicle-detail` street.
- Métricas/manual checks: inspección visual de scroll horizontal en parts/invoices.
