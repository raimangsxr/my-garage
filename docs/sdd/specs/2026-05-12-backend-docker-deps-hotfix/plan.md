# Plan Técnico: Corregir instalación de dependencias del backend en Docker

Spec: [spec.md](./spec.md)
Estado: Implemented
Fecha: 2026-05-12

## Enfoque

Reproducir el build y el arranque de la imagen actual para capturar el fallo exacto, corregir el `backend/Dockerfile` o el empaquetado mínimo necesario y revalidar el flujo completo con `docker build` y `docker run`.

## Impacto por Capa

### Backend

- Modelos: sin cambios previstos
- Schemas: sin cambios previstos
- Servicios: sin cambios previstos
- Endpoints: sin cambios previstos
- Migraciones: no

### Frontend

- Rutas: no aplica
- Servicios: no aplica
- Componentes: no aplica
- Estilos: no aplica
- Componentes compartidos: no aplica

### Datos

- Nuevos campos/tablas: ninguno
- Índices: ninguno
- Backfill: no aplica
- Compatibilidad: sin impacto

### Seguridad

- Autenticación/autorización: sin cambios
- Datos sensibles: sin cambios
- Logs: sin cambios esperados más allá de errores reproducibles de build/arranque

### IA/Integraciones Externas

- Integración: no aplica
- Estados de error: no aplica
- Retry/fallback: no aplica

## Cambios de Contrato

| Contrato | Cambio | Consumidores | Compatibilidad |
| --- | --- | --- | --- |
| Build backend Docker | ajuste del flujo de instalación dentro de la imagen | desarrolladores y despliegue | compatible |
| Arranque backend en contenedor | asegurar imports y binarios presentes | desarrolladores y despliegue | compatible |

## Estrategia de Implementación

1. Crear la iniciativa SDD y registrar el problema del contenedor.
2. Ejecutar `docker build` y `docker run` para identificar el fallo exacto.
3. Ajustar `backend/Dockerfile` y cualquier archivo estrictamente necesario para una instalación reproducible.
4. Instalar un toolchain de compilación completo en la imagen para cubrir dependencias que aún compilan desde fuente, en particular `psycopg2`.
5. Repetir build y validaciones mínimas de import/arranque.
6. Actualizar spec, plan y tasks con el comportamiento final verificado.

## Estrategia de Pruebas

- Unitarias: no aplica salvo que el fallo obligue a tocar código Python de arranque
- Integración backend: `docker build`, `docker run ... python -c "import app.main"` y arranque con `/health`
- Frontend: no aplica
- Manual/UI: no aplica
- Migración: no aplica

## Riesgos

- Dependencia nativa faltante en la imagen: mitigarlo reproduciendo el error real y ajustando paquetes del sistema.
- Archivo de proyecto no copiado durante el build: mitigarlo revisando el contexto mínimo necesario para `pip install .`.
- Falso positivo por import que no conecta a servicios reales: separar validación de import/arranque de validación con PostgreSQL real.

## Rollback

Revertir los cambios del `Dockerfile` y de la documentación SDD si el nuevo flujo empeora el build o rompe el arranque.

## Observabilidad

- Logs esperados: salida estándar de `docker build` y `uvicorn`
- Errores esperados: fallos de compilación de wheels, archivos faltantes en build context o `ModuleNotFoundError`
- Métricas/manual checks: build completo, import de `app.main` y arranque básico del contenedor
