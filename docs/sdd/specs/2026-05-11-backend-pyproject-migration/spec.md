# Spec: Migrar empaquetado del backend a pyproject.toml

Estado: Implemented
Fecha: 2026-05-11
Tipo: chore
Owner: Codex

## Resumen

Unificar la instalación del backend FastAPI alrededor de `pyproject.toml` para que desarrollo local, Docker y tooling compartan una única fuente de verdad de dependencias.

## Problema

El backend mantiene dependencias en `requirements.txt` mientras el `Dockerfile` ya asume la existencia de `pyproject.toml`. Esta divergencia hace que el entorno local y la imagen no estén alineados y aumenta el riesgo de instalaciones incompletas o rotas.

Tras la primera migración, el `pyproject.toml` todavía dejaba parte de las dependencias reales solo implícitas vía extras o transitivas. Eso dificulta auditar el manifiesto y puede ocultar dependencias necesarias para hashing, criptografía o carga de configuración desde `.env`. Además, el manifiesto necesita dejar claro el uso correcto del stack `psycopg2` del backend en lugar de una combinación ambigua de nombres de paquete y driver.

## Usuarios y Contexto

- Usuario principal: desarrolladores del backend y agentes automatizados
- Contexto de uso: setup local, ejecución de tests y build de imagen Docker
- Frecuencia esperada: diaria durante desarrollo y despliegues

## Objetivos

- Definir las dependencias instalables del backend en `backend/pyproject.toml`.
- Alinear la documentación de setup para instalar el backend desde `pyproject.toml`.
- Ajustar el manifiesto según el `venv` real del backend para que las dependencias operativas queden declaradas explícitamente cuando corresponda.

## Fuera de Alcance

- Cambiar comportamiento funcional de endpoints o modelos.
- Introducir un nuevo gestor de entornos distinto de `pip` y `venv`.

## Comportamiento Esperado

### Escenario Principal

1. Un desarrollador entra en `backend/`.
2. Instala el proyecto con `pip install -e .[dev]`.
3. Puede arrancar `uvicorn`, ejecutar `pytest` y construir la imagen Docker usando las mismas dependencias declaradas en `pyproject.toml`.

### Casos Límite

- Dependencias usadas solo en tests o scripts auxiliares: deben quedar declaradas en extras de desarrollo si no forman parte del runtime principal.
- Referencias documentales a `requirements.txt`: deben actualizarse para no dejar instrucciones obsoletas.

## Requisitos Funcionales

- RF-1: El backend debe declarar sus dependencias runtime en `backend/pyproject.toml`.
- RF-2: El backend debe declarar un extra de desarrollo con las dependencias necesarias para ejecutar tests locales.
- RF-3: La documentación de arranque local debe usar el flujo basado en `pyproject.toml`.
- RF-4: Las dependencias usadas por autenticación/criptografía y carga de `.env` no deben quedar solo asumidas por inspección manual del `venv`.
- RF-5: El backend debe declarar y usar explícitamente el stack `psycopg2` compatible con `pgvector`, evitando ambigüedad entre nombre de import, paquete Python y driver SQLAlchemy.

## Requisitos No Funcionales

- Rendimiento: sin impacto apreciable en tiempo de arranque del servicio.
- Seguridad: no debe introducir nuevas credenciales ni cambios de permisos.
- Accesibilidad: no aplica.
- Responsive: no aplica.
- Observabilidad: los comandos de instalación y ejecución deben seguir siendo explícitos y reproducibles.

## UX y Diseño

- Referencia visual: `system.md`
- Pantallas afectadas: ninguna
- Estados requeridos: no aplica
- Componentes compartidos a reutilizar/extender: no aplica
- Capturas/mockups: no aplica

## Contratos de Datos

### Backend/API

- Endpoint(s): no aplica
- Request: no aplica
- Response: no aplica
- Errores esperados: instalación falla si falta una dependencia declarada

### Frontend

- Servicio(s): no aplica
- Interface(s): no aplica
- Estado local/global: no aplica

## Migraciones

- Requiere migración: no
- Backfill: no aplica
- Compatibilidad con datos existentes: sin impacto en datos

## Criterios de Aceptación

- CA-1: Dado un entorno limpio dentro de `backend/`, cuando se ejecuta `pip install -e .[dev]`, entonces la instalación resuelve las dependencias del backend sin depender de `requirements.txt`.
- CA-2: Dado el README del proyecto, cuando un desarrollador sigue la sección de backend, entonces encuentra instrucciones basadas en `pyproject.toml` y no en `requirements.txt`.
- CA-3: Dado el `Dockerfile` actual del backend, cuando se revisa junto al empaquetado, entonces la imagen instala el proyecto usando el mismo manifiesto declarado en `pyproject.toml`.
- CA-4: Dado el `venv` actual del backend, cuando se contrastan paquetes instalados e imports reales, entonces `pyproject.toml` declara explícitamente las dependencias críticas no obvias del runtime.
- CA-5: Dado el acceso a PostgreSQL del backend, cuando se instala el proyecto y se inicializa el engine SQLAlchemy, entonces el backend usa `psycopg2` de forma consistente con `pgvector`.

## Pruebas Esperadas

- Backend: `python -m pytest -q backend/test_storage_service.py backend/test_vehicle_document_rag_service.py`
- Backend: `backend/venv/bin/python -m pip list --not-required`
- Frontend: no aplica
- Manual/UI: validar instalación editable y arranque de imports principales
- No ejecutable ahora: recreación completa de un entorno limpio si la red impide descargar paquetes durante la verificación

## Dependencias

- `setuptools` como backend de build
- `pip` con soporte de PEP 621/extras

## Preguntas Abiertas

- Ninguna por ahora.

## Decisiones Relacionadas

- ADR: no aplica
