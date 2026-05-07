# Plan Técnico: Cerrar Segunda Ronda de Estandarización

Spec: ./spec.md
Estado: Implemented
Fecha: 2026-05-07

## Enfoque

Ejecutar una ronda corta y segura que cierre la deuda residual no visual: homogeneizar la convención `deps.get_db` en endpoints aún divergentes, corregir el endpoint de organizadores, migrar la selección de avatar a un control semántico y actualizar el estado de las specs SDD previas.

## Impacto por Capa

### Backend

- Modelos: sin cambios.
- Schemas: sin cambios.
- Servicios: sin cambios.
- Endpoints: `auth.py`, `organizers.py`, y módulos que aún usan `deps.get_session`.
- Migraciones: no.

### Frontend

- Rutas: sin cambios.
- Servicios: `frontend/src/app/services/organizer.service.ts` solo validación de compatibilidad.
- Componentes: `user-profile.html` y estilos asociados.
- Estilos: `user-profile.scss`.
- Componentes compartidos: no aplica.

### Datos

- Nuevos campos/tablas: ninguno.
- Índices: ninguno.
- Backfill: no aplica.
- Compatibilidad: total.

### Seguridad

- Autenticación/autorización: `organizers` pasa a requerir usuario autenticado.
- Datos sensibles: sin cambios.
- Logs: sin cambios.

### IA/Integraciones Externas

- Integración: no aplica.
- Estados de error: sin cambios.
- Retry/fallback: no aplica.

## Cambios de Contrato

| Contrato | Cambio | Consumidores | Compatibilidad |
| --- | --- | --- | --- |
| `GET /api/v1/organizers` | El endpoint deja de duplicar segmento y exige auth | Frontend track record dialog | Compatible para la URL esperada; mejora seguridad |
| Dependencia de sesión en endpoints | Convención única `deps.get_db` | Backend | Compatible |
| Selector de avatar | Control semántico en vez de `img` clicable | Frontend | Compatible |

## Estrategia de Implementación

1. Crear la spec, plan y tareas de esta ronda.
2. Actualizar el índice SDD.
3. Corregir `organizers.py` y su convención de auth.
4. Migrar endpoints restantes de `deps.get_session` / `get_session` a `deps.get_db`.
5. Convertir el selector de avatar a botones accesibles con estado seleccionado.
6. Marcar las specs previas de estandarización como implementadas.
7. Ejecutar checks estáticos y build razonables.

## Estrategia de Pruebas

- Unitarias: no se añaden.
- Integración backend: smoke estático de imports/rutas.
- Frontend: TypeScript sin emisión y build.
- Manual/UI: selección de avatar con teclado.
- Migración: no aplica.

## Riesgos

- Riesgo: cambiar la ruta efectiva de `organizers` rompa al frontend si hubiera consumidores con la ruta duplicada.
  Mitigación: verificar el servicio actual y mantener la URL pública esperada `/api/v1/organizers`.
- Riesgo: la autenticación nueva en `organizers` revele usos no autenticados.
  Mitigación: el flujo actual ya opera dentro de sesión autenticada en la app.

## Rollback

Revertir los cambios de endpoint y plantilla si apareciera una regresión. No hay migraciones ni datos que restaurar.

## Observabilidad

- Logs esperados: sin cambios.
- Errores esperados: `401` para acceso no autenticado a organizadores.
- Métricas/manual checks: búsqueda de `Depends(deps.get_session)` en endpoints y validación de la ruta pública de organizadores.
