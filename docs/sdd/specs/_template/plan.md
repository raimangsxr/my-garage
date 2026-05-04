# Plan Técnico: <titulo>

Spec: <enlace a spec.md>
Estado: Draft
Fecha: <yyyy-mm-dd>

## Enfoque

<Resumen técnico del camino elegido.>

## Impacto por Capa

### Backend

- Modelos: <archivos/clases>
- Schemas: <archivos/clases>
- Servicios: <archivos/clases>
- Endpoints: <archivos/rutas>
- Migraciones: <sí/no y nombre esperado>

### Frontend

- Rutas: <rutas afectadas>
- Servicios: <archivos>
- Componentes: <archivos>
- Estilos: <archivos>
- Componentes compartidos: <reutilizar/extender/crear>

### Datos

- Nuevos campos/tablas: <lista>
- Índices: <lista>
- Backfill: <estrategia>
- Compatibilidad: <notas>

### Seguridad

- Autenticación/autorización: <impacto>
- Datos sensibles: <impacto>
- Logs: <impacto>

### IA/Integraciones Externas

- Integración: <Gemini/Google/otra/no aplica>
- Estados de error: <estrategia>
- Retry/fallback: <estrategia>

## Cambios de Contrato

| Contrato | Cambio | Consumidores | Compatibilidad |
| --- | --- | --- | --- |
| <API/modelo> | <detalle> | <frontend/backend> | <compatible/ruptura> |

## Estrategia de Implementación

1. <Paso técnico>
2. <Paso técnico>
3. <Paso técnico>

## Estrategia de Pruebas

- Unitarias: <qué cubrir>
- Integración backend: <qué cubrir>
- Frontend: <qué cubrir>
- Manual/UI: <qué revisar>
- Migración: <cómo validar>

## Riesgos

- <Riesgo>: <mitigación>

## Rollback

<Cómo revertir o mitigar si falla en producción/staging.>

## Observabilidad

- Logs esperados: <eventos>
- Errores esperados: <mensajes/códigos>
- Métricas/manual checks: <si aplica>
