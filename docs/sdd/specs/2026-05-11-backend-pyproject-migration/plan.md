# Plan Técnico: Migrar empaquetado del backend a pyproject.toml

Spec: [spec.md](./spec.md)
Estado: Implemented
Fecha: 2026-05-11

## Enfoque

<<<<<<< feature/backend-pyproject-runtime-fixes
Mantener `backend/pyproject.toml` como fuente única de dependencias y completarlo contrastándolo con el `venv` real y los imports del backend. La corrección se centrará en declarar explícitamente dependencias críticas que hoy quedan implícitas por extras o paquetes transitivos, además de alinear explícitamente el stack `psycopg2` con el registro de `pgvector`.
=======
Crear `backend/pyproject.toml` como fuente única de dependencias y metadatos mínimos del paquete, mover ahí runtime y extras de desarrollo, actualizar la documentación de arranque y retirar la dependencia operativa de `requirements.txt`.
>>>>>>> main

## Impacto por Capa

### Backend

- Modelos: sin cambios
- Schemas: sin cambios
- Servicios: sin cambios
- Endpoints: sin cambios
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
- Logs: sin cambios

### IA/Integraciones Externas

- Integración: no aplica
- Estados de error: no aplica
- Retry/fallback: no aplica

## Cambios de Contrato

| Contrato | Cambio | Consumidores | Compatibilidad |
| --- | --- | --- | --- |
| Setup backend local | instalación desde `pip install -e .[dev]` | desarrolladores/agentes | compatible con `pip`, cambia el comando |
| Build backend Docker | usa `pyproject.toml` existente | despliegue backend | compatible |
<<<<<<< feature/backend-pyproject-runtime-fixes
| Runtime auth/config | dependencias críticas pasan a quedar declaradas explícitamente | backend | compatible |
| Runtime PostgreSQL | se declara explícitamente `psycopg2` y se mantiene el registro `pgvector` sobre ese driver | backend | compatible con ajuste de empaquetado |
=======
>>>>>>> main

## Estrategia de Implementación

1. Crear la iniciativa SDD y registrarla en el índice.
2. Añadir `backend/pyproject.toml` con metadatos, dependencias runtime y extra `dev`.
3. Actualizar README para usar el flujo de instalación desde `pyproject.toml`.
4. Retirar `backend/requirements.txt` para evitar doble fuente de verdad.
<<<<<<< feature/backend-pyproject-runtime-fixes
5. Contrastar el `venv` del backend con `pyproject.toml` e imports reales.
6. Sustituir `psycopg2-binary` por `psycopg2` y mantener el registro `pgvector` sobre ese driver.
7. Ajustar el empaquetado Docker para compilar/instalar `psycopg2`.
8. Ejecutar validaciones de imports y tests unitarios sin dependencia externa.
=======
5. Ejecutar validaciones de instalación/imports y tests unitarios sin dependencia externa.
>>>>>>> main

## Estrategia de Pruebas

- Unitarias: ejecutar tests puros actuales (`test_storage_service.py`, `test_vehicle_document_rag_service.py`)
- Integración backend: no aplica sin DB configurada
- Frontend: no aplica
<<<<<<< feature/backend-pyproject-runtime-fixes
- Manual/UI: comprobar imports principales, revisar `backend/venv/bin/pip list --not-required` para detectar dependencias críticas no declaradas explícitamente y verificar consistencia del stack `psycopg2`
=======
- Manual/UI: comprobar que `pip install -e .[dev]` resuelve dependencias y que `uvicorn app.main:app` sigue siendo el comando documentado
>>>>>>> main
- Migración: no aplica

## Riesgos

<<<<<<< feature/backend-pyproject-runtime-fixes
- Dependencia omitida en `pyproject.toml`: mitigarlo contrastando imports reales, `venv` existente y ejecutando tests.
=======
- Dependencia omitida en `pyproject.toml`: mitigarlo contrastando imports reales y ejecutando tests.
>>>>>>> main
- Scripts auxiliares que usen paquetes no declarados: incluir dependencias de soporte en runtime o `dev` según uso.

## Rollback

Revertir `pyproject.toml`, restaurar `requirements.txt` y volver a documentar la instalación previa si la instalación editable falla en entornos objetivo.

## Observabilidad

- Logs esperados: no aplica
- Errores esperados: errores de resolución de `pip` o imports faltantes si alguna dependencia se omitió
- Métricas/manual checks: instalación editable exitosa y tests unitarios verdes
