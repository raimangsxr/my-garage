# Spec: Corregir instalación de dependencias del backend en Docker

Estado: Implemented
Fecha: 2026-05-12
Tipo: hotfix
Owner: Codex

## Resumen

Corregir el empaquetado y arranque del contenedor del backend para que la imagen instale sus dependencias de forma reproducible y el servicio pueda iniciar sin fallar por problemas de build o imports.

## Problema

El backend sigue fallando al arrancar su contenedor porque la instalación de dependencias dentro de la imagen no está completamente alineada con el empaquetado real del proyecto. Esto bloquea pruebas locales, despliegues y validación de cambios del backend.

La reproducción confirmó que el build fallaba al compilar `psycopg2` dentro de `python:3.12-slim` porque la imagen instalaba `gcc` y `libpq-dev`, pero no incluía los headers estándar de libc requeridos para compilar extensiones nativas.

Después del fix de build apareció un segundo fallo en el contenedor de migración: el secreto Kubernetes de ejemplo seguía publicando `DATABASE_URL` con el driver `postgresql+psycopg://`, mientras la imagen instala y registra `psycopg2`. Eso hace que SQLAlchemy intente importar `psycopg` al ejecutar Alembic y termine en `ModuleNotFoundError`.

## Usuarios y Contexto

- Usuario principal: desarrolladores del backend y agentes automatizados
- Contexto de uso: build local de imagen Docker y arranque del backend en contenedor
- Frecuencia esperada: diaria durante desarrollo y despliegues

## Objetivos

- Conseguir que `docker build` del backend complete la instalación del proyecto sin errores.
- Conseguir que el contenedor del backend arranque con `uvicorn` usando la imagen generada.
- Mantener una instalación reproducible y consistente con `backend/pyproject.toml`.
- Conseguir que el backend y el job de migración acepten o documenten correctamente el driver PostgreSQL alineado con la imagen.

## Fuera de Alcance

- Cambios funcionales en endpoints, modelos o lógica de negocio.
- Cambios en frontend o despliegue Kubernetes fuera de lo necesario para reflejar el build del backend.

## Comportamiento Esperado

### Escenario Principal

1. Un desarrollador ejecuta `docker build` sobre `backend/`.
2. La imagen instala dependencias y el paquete del backend correctamente.
3. El contenedor arranca `uvicorn` sin fallar por imports o binarios faltantes.

### Casos Límite

- Dependencias con extensiones nativas: la imagen debe incluir los paquetes de sistema necesarios para compilarlas o instalarlas.
- Ficheros requeridos por el empaquetado: el build debe copiar todo lo imprescindible para que `pip install .` funcione dentro de la imagen.
- `DATABASE_URL` legacy con `postgresql+psycopg://`: el backend debe poder resolverlo de forma compatible o la configuración publicada debe evitar ese driver.

## Requisitos Funcionales

- RF-1: El `Dockerfile` del backend debe instalar el proyecto definido en `pyproject.toml` sin depender de pasos manuales posteriores.
- RF-2: La imagen resultante debe incluir los binarios y módulos Python necesarios para ejecutar `uvicorn app.main:app`.
- RF-3: El proceso de build debe copiar al contexto de instalación los archivos requeridos por el backend para resolverse como paquete instalable.
- RF-4: El backend debe usar un driver PostgreSQL coherente entre `DATABASE_URL`, SQLAlchemy, Alembic y `pgvector`.

## Requisitos No Funcionales

- Rendimiento: el build no debe introducir pasos innecesarios que degraden significativamente el tiempo de construcción.
- Seguridad: la imagen debe seguir ejecutándose con usuario no root.
- Accesibilidad: no aplica.
- Responsive: no aplica.
- Observabilidad: los fallos de build o arranque deben ser reproducibles con comandos estándar de Docker.

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
- Errores esperados: no aplica

### Frontend

- Servicio(s): no aplica
- Interface(s): no aplica
- Estado local/global: no aplica

## Migraciones

- Requiere migración: no
- Backfill: no aplica
- Compatibilidad con datos existentes: sin impacto

## Criterios de Aceptación

- CA-1: Dado un entorno con Docker disponible, cuando se ejecuta `docker build -f backend/Dockerfile backend`, entonces la imagen del backend se construye sin errores de instalación de dependencias.
- CA-2: Dada la imagen recién construida, cuando se ejecuta el contenedor con un comando de arranque mínimo, entonces `uvicorn` puede iniciar el backend sin errores de importación del paquete.
- CA-3: Dado el `Dockerfile` del backend, cuando se revisa junto a `backend/pyproject.toml`, entonces el flujo de instalación es coherente con el empaquetado actual del proyecto.
- CA-4: Dado un `DATABASE_URL` con prefijo `postgresql+psycopg://`, cuando el backend o Alembic crean el engine, entonces la resolución del driver no falla por ausencia del módulo `psycopg`.

## Pruebas Esperadas

- Backend: `docker build -t my-garage-backend-test ./backend`
- Backend: `docker run --rm my-garage-backend-test python -c "import app.main"`
- Backend: `docker run --rm -e DATABASE_URL='postgresql+psycopg://user:pass@localhost:5432/mygarage' my-garage-backend-test python -c "from app.database import engine; print(engine.url)"`
- Manual/UI: no aplica
- No ejecutable ahora: prueba completa contra PostgreSQL real si faltan variables o servicios externos

## Dependencias

- Docker local
- `backend/pyproject.toml`

## Preguntas Abiertas

- Ninguna por ahora.

## Decisiones Relacionadas

- ADR: no aplica
