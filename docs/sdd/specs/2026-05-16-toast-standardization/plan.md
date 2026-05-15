# Plan Técnico: Homogeneizar Toasts y Snackbars

Spec: [spec.md](./spec.md)
Estado: In Progress
Fecha: 2026-05-16

## Enfoque

Crear un `ToastService` `providedIn: 'root'` que envuelva `MatSnackBar`, aplique por defecto `bottom-right`, traduzca tonos semánticos a las clases globales existentes y mantenga soporte para acciones persistentes. Después migrar todas las aperturas directas de `MatSnackBar` a este servicio y fijar la regla en `system.md`.

## Impacto por Capa

### Backend

- Modelos: no aplica
- Schemas: no aplica
- Servicios: no aplica
- Endpoints: no aplica
- Migraciones: no

### Frontend

- Rutas: sin cambios
- Servicios:
  - crear `frontend/src/app/core/services/toast.service.ts`
  - actualizar `frontend/src/app/core/services/pwa.service.ts`
- Componentes:
  - actualizar componentes/módulos que abren snackbar directamente
  - actualizar `frontend/src/app/core/interceptors/error.interceptor.ts`
- Estilos:
  - reutilizar `success-snackbar`, `warning-snackbar`, `info-snackbar`, `error-snackbar`
  - documentar regla visual en `system.md`
- Componentes compartidos: crear servicio compartido de feedback emergente

### Datos

- Nuevos campos/tablas: ninguno
- Índices: ninguno
- Backfill: no aplica
- Compatibilidad: sin impacto en persistencia

### Seguridad

- Autenticación/autorización: sin impacto
- Datos sensibles: sin impacto
- Logs: sin cambios, salvo que los puntos actuales continúan logando como hasta ahora

### IA/Integraciones Externas

- Integración: no aplica
- Estados de error: se mantienen y se canalizan al servicio compartido
- Retry/fallback: no aplica

## Cambios de Contrato

| Contrato | Cambio | Consumidores | Compatibilidad |
| --- | --- | --- | --- |
| Feedback UI frontend | Nueva abstracción `ToastService` para snackbars | Componentes, servicios e interceptor Angular | Compatible |
| `system.md` | Regla explícita de ubicación `bottom-right` | Frontend y revisiones UI futuras | Compatible |

## Estrategia de Implementación

1. Crear `ToastService` y registrar el provider global de snackbar en `app.config.ts`.
2. Migrar interceptor, servicio PWA y componentes actuales para dejar de inyectar `MatSnackBar` directamente.
3. Ajustar `system.md` y la spec SDD para reflejar la regla obligatoria de `bottom-right`.
4. Verificar por búsqueda estática y build que no queden aperturas directas pendientes en el frontend.

## Estrategia de Pruebas

- Unitarias: no añadir si el riesgo queda suficientemente cubierto por build y migración mecánica; priorizar verificación estática
- Integración backend: no aplica
- Frontend:
  - `npm run build`
  - `npm test -- --watch=false`
  - `rg` para comprobar migración de aperturas directas
- Manual/UI:
  - validar toast de error global
  - validar toast de éxito CRUD
  - validar toast persistente de PWA con acción
- Migración: no aplica

## Riesgos

- Snackbar con acción podría perder comportamiento si el servicio no devuelve `MatSnackBarRef`: mitigación, el wrapper devuelve la referencia original.
- Algún módulo podría seguir usando `MatSnackBar` directo por omisión: mitigación, búsqueda estática final con `rg`.
- Cambiar posición a `bottom-right` podría afectar expectativas visuales en mobile: mitigación, mantener el patrón consistente y revisar al menos una pantalla en viewport reducido cuando sea posible.

## Rollback

Revertir el commit de la migración restaura el uso directo de `MatSnackBar` y la regla previa. No hay migraciones ni cambios de datos.

## Observabilidad

- Logs esperados: sin nuevos logs
- Errores esperados: mismos mensajes actuales, con entrega homogénea vía `ToastService`
- Métricas/manual checks: confirmación visual de posición y acción en snackbars críticos
