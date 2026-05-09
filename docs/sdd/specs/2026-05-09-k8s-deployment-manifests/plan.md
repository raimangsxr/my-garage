# Plan Técnico: Añadir Manifests Kubernetes Base

Spec: [./spec.md](./spec.md)
Estado: In Progress
Fecha: 2026-05-09

## Enfoque

Versionar un paquete inicial de manifests Kubernetes en `deploy/k8s/` acompañado de una guía de uso, manteniendo los valores sensibles fuera del repositorio mediante un `Secret` de ejemplo.

## Impacto por Capa

### Backend

- Modelos: no aplica
- Schemas: no aplica
- Servicios: no aplica
- Endpoints: los manifests asumen exposición de `/api`, `/media` y probes HTTP
- Migraciones: no aplica a nivel de esquema; se añade un job operativo de Alembic

### Frontend

- Rutas: no aplica
- Servicios: no aplica
- Componentes: no aplica
- Estilos: no aplica
- Componentes compartidos: no aplica

### Datos

- Nuevos campos/tablas: ninguno
- Índices: ninguno
- Backfill: ninguno
- Compatibilidad: la persistencia de media depende del PVC NFS documentado

### Seguridad

- Autenticación/autorización: sin cambios de producto
- Datos sensibles: secretos fuera del repositorio, sólo plantilla de ejemplo
- Logs: sin cambios

### IA/Integraciones Externas

- Integración: no aplica
- Estados de error: no aplica
- Retry/fallback: no aplica

## Cambios de Contrato

| Contrato | Cambio | Consumidores | Compatibilidad |
| --- | --- | --- | --- |
| Operación/despliegue | se añaden manifests base versionados en `deploy/k8s/` | operadores del proyecto | compatible |

## Estrategia de Implementación

1. Documentar la iniciativa con spec, plan y tasks.
2. Añadir los manifests Kubernetes y la guía operativa en `deploy/k8s/README.md`.
3. Registrar la iniciativa en `docs/sdd/specs/index.md`.
4. Revisar estáticamente el contenido antes de crear el PR.

## Estrategia de Pruebas

- Unitarias: no aplica
- Integración backend: no aplica
- Frontend: no aplica
- Manual/UI: revisión estática de YAML y README
- Migración: validar que el job documentado usa `alembic upgrade head`

## Riesgos

- Los placeholders pueden asumirse como listos para producción: mitigado documentando explícitamente qué valores personalizar.
- Los probes usan rutas compatibles con la app actual: `/health` en backend y `/` en frontend.

## Rollback

Eliminar `deploy/k8s/` y la spec asociada si se decide adoptar otro mecanismo de despliegue.

## Observabilidad

- Logs esperados: no aplica
- Errores esperados: fallos de readiness/liveness o de mounting si el operador no personaliza manifests
- Métricas/manual checks: revisión visual de YAML y pasos documentados
