# Plan Técnico: Actualizar Fallback de Modelos Gemini

Spec: [docs/sdd/specs/2026-05-16-gemini-model-fallback/spec.md](./spec.md)
Estado: In Progress
Fecha: 2026-05-16

## Enfoque

Ajustar únicamente la constante `AVAILABLE_MODELS` de `GeminiService` para reflejar un orden de fallback más útil y actual. No se modificarán ni el prompt, ni el parsing, ni la estrategia general de retry.

## Impacto por Capa

### Backend

- Modelos: sin cambios
- Schemas: sin cambios
- Servicios:
  - `backend/app/core/gemini_service.py`
- Endpoints: sin cambios
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
- Logs: conservar logging por intento de modelo

### IA/Integraciones Externas

- Integración: Gemini
- Estados de error: se mantienen
- Retry/fallback: cambia solo el orden de modelos probados

## Cambios de Contrato

| Contrato | Cambio | Consumidores | Compatibilidad |
| --- | --- | --- | --- |
| `GeminiService.AVAILABLE_MODELS` | Nuevo orden de fallback | backend | compatible |

## Estrategia de Implementación

1. Actualizar `AVAILABLE_MODELS` en `GeminiService`.
2. Verificar que no existen referencias duras a modelos eliminados del orden anterior.
3. Ejecutar checks razonables de backend o validaciones ligeras.

## Estrategia de Pruebas

- Unitarias: no hay cobertura específica hoy; añadir en futuro si el fallback gana complejidad.
- Integración backend: validación razonable del módulo y, si es viable, test funcional de procesamiento.
- Frontend: no aplica
- Manual/UI: no aplica salvo prueba end-to-end de factura
- Migración: no aplica

## Riesgos

- Riesgo: que un modelo nuevo no esté disponible en todos los entornos o claves.
  Mitigación: mantener cadena de fallback y logging por intento.
- Riesgo: que eliminar modelos antiguos reduzca compatibilidad en ciertas cuentas.
  Mitigación: conservar varios niveles de fallback y validar en entorno real tras desplegar.

## Rollback

Revertir el orden de `AVAILABLE_MODELS` al listado anterior si aparecen errores sistemáticos en producción.

## Observabilidad

- Logs esperados: intento por modelo, éxito con modelo concreto, error final si todos fallan
- Errores esperados: cuota agotada, modelo no disponible, error genérico del proveedor
- Métricas/manual checks: revisar logs de facturas procesadas tras desplegar
