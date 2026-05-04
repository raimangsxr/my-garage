# Plan Técnico: Institucionalizar SDD

Spec: ./spec.md
Estado: Implemented
Fecha: 2026-05-04

## Enfoque

Convertir SDD en política explícita mediante documentación raíz, gobernanza, índice de specs y PR template. La implementación no toca código runtime.

## Impacto por Capa

### Backend

- Modelos: no aplica.
- Schemas: no aplica.
- Servicios: no aplica.
- Endpoints: no aplica.
- Migraciones: no.

### Frontend

- Rutas: no aplica.
- Servicios: no aplica.
- Componentes: no aplica.
- Estilos: no aplica.
- Componentes compartidos: no aplica.

### Datos

- Nuevos campos/tablas: no.
- Índices: no.
- Backfill: no.
- Compatibilidad: no aplica.

### Seguridad

- Autenticación/autorización: sin impacto.
- Datos sensibles: sin impacto.
- Logs: sin impacto.

### IA/Integraciones Externas

- Integración: no aplica.
- Estados de error: no aplica.
- Retry/fallback: no aplica.

## Cambios de Contrato

| Contrato | Cambio | Consumidores | Compatibilidad |
| --- | --- | --- | --- |
| Proceso de contribución | SDD obligatorio antes de implementar | Agentes y contribuidores | Compatible |
| PR template | Enlaces SDD obligatorios o justificación | Revisores y autores | Compatible |

## Estrategia de Implementación

1. Crear `AGENTS.md` con instrucciones obligatorias.
2. Crear `docs/sdd/governance.md`.
3. Crear `docs/sdd/specs/index.md`.
4. Crear esta meta-spec con plan y tareas.
5. Reforzar `README.md`, `CONTRIBUTING.md`, `docs/sdd/README.md` y PR template.

## Estrategia de Pruebas

- Documentación: verificar que los ficheros existen y están enlazados.
- Git: revisar `git status` para asegurar que no se toca `backend/alembic.ini`.
- Runtime: no aplica.

## Riesgos

- Exceso de proceso para cambios pequeños: mitigado con SDD ligero.
- Specs desactualizadas: mitigado con índice vivo y reglas de Definition of Done.
- Agentes ignorando la regla: mitigado con `AGENTS.md` en raíz.

## Rollback

Revertir los ficheros de documentación/proceso añadidos o modificar la gobernanza para volver a un SDD recomendado en vez de obligatorio.

## Observabilidad

- No hay logs runtime.
- La observabilidad del proceso se consigue con enlaces SDD en PRs y estado en `docs/sdd/specs/index.md`.
