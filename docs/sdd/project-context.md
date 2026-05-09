# Contexto del Proyecto

Fecha de análisis: 2026-05-04

## Producto

My Garage es una PWA para gestión personal de vehículos. El producto cubre:

- Gestión de vehículos con datos básicos, imagen, uso, fechas legales y especificaciones técnicas.
- Historial de mantenimiento, kilometraje, costes, proveedores y piezas.
- Inventario de piezas con referencias, cantidades, precios y proveedor.
- Facturas con subida de archivo, procesamiento con Gemini, revisión humana y aprobación.
- Proveedores, ajustes, perfil de usuario y notificaciones.
- Circuitos, tiempos por vuelta, comparativas y registros de uso en pista.
- Dashboard de métricas operativas y actividad reciente.

## Arquitectura Actual

### Frontend

- Angular con componentes standalone y rutas lazy-loaded.
- Angular Material como librería UI principal.
- SCSS global en `frontend/src/styles.scss`.
- Servicios HTTP en `frontend/src/app/core/services/`.
- Modelos compartidos básicos en `frontend/src/app/core/models/`.
- Interceptores para autenticación y errores.
- Guard de autenticación para todas las rutas privadas.
- Componentes compartidos relevantes:
  - `app-page-loader`
  - `app-empty-state`
  - `app-stat-card`
  - `app-entity-card`
  - `app-entity-column`
  - `app-circuit-evolution-chart`
  - componentes de imagen, Google sign-in y vistas específicas de vehículo.

### Backend

- FastAPI con prefijo `/api/v1`.
- SQLModel sobre SQLAlchemy.
- Alembic para migraciones.
- PostgreSQL esperado por configuración.
- Autenticación con JWT.
- Configuración vía `.env` en backend.
- Middleware de request id y handlers de excepciones propios.
- Integración con Gemini para extracción de datos de facturas.
- Almacenamiento documental público bajo `/media` con compatibilidad legacy para `/uploads`; las imágenes de vehículo están migradas a binario en base de datos.

## Superficie de API

Rutas principales expuestas por `backend/app/api/v1/api.py`:

- `/auth`: login local, Google login y recuperación.
- `/users`: usuario actual, avatar y cambio de contraseña.
- `/vehicles`: CRUD de vehículos, imagen, detalles, especificaciones y track records anidados.
- `/maintenance`: CRUD/listado de mantenimientos.
- `/parts`: CRUD/listado de piezas.
- `/suppliers`: CRUD/listado de proveedores.
- `/invoices`: listado, upload, extracción, revisión, aprobación, rechazo, retry y borrado.
- `/notifications`: listado, leído/no leído y comprobación de avisos.
- `/dashboard`: estadísticas agregadas.
- `/tracks`: circuitos/tracks y detalle.
- `/circuits`: resumen/detalle de circuitos basado en registros.
- `/settings`: configuración de aplicación e integraciones.
- `/organizers`: organizadores detectados en registros de pista.

## Modelo de Dominio

Entidades centrales:

- `Vehicle`: marca, modelo, año, matrícula única, kilómetros, tipo de uso, fechas legales, costes recurrentes, imagen y relaciones.
- `VehicleSpecs`: VIN, color, motor, transmisión, fluidos, neumáticos y otras especificaciones.
- `Maintenance`: fecha, descripción, kilometraje, coste, vehículo, proveedor y piezas.
- `Part`: nombre, referencia, precio, cantidad, mantenimiento, proveedor y factura.
- `Invoice`: archivo, estado de procesamiento, datos extraídos, error, vehículo, proveedor y piezas.
- `Supplier`: proveedor de piezas/mantenimientos/facturas.
- `Track`: circuito normalizado con ubicación, longitud, descripción e imagen.
- `TrackRecord`: vuelta rápida por vehículo, circuito, fecha, meteorología, compuesto, grupo, organizador y notas.
- `Notification`: avisos del sistema para fechas y estados relevantes.
- `Settings`: configuración de integración y aplicación.
- `User` y `GoogleAuthToken`: identidad local y federada.

## Flujos Importantes

### Facturas

1. El usuario sube una factura.
2. Se crea una factura en estado `pending` o `processing`.
3. Gemini extrae datos estructurados.
4. La factura pasa a `review`.
5. El usuario corrige datos extraídos.
6. Al aprobar, el sistema crea o vincula proveedor, piezas, mantenimiento y relación con vehículo.
7. Si falla, se conserva `error_message` y puede ejecutarse retry.

Este flujo requiere specs especialmente cuidadosas porque toca IA, persistencia, relaciones de dominio y experiencia de revisión.

### Vehículos

El vehículo es el agregado principal. Cualquier cambio en mantenimiento, piezas, facturas, especificaciones o registros de pista debe declarar explícitamente cómo afecta a la pantalla de detalle del vehículo y al dashboard.

### Circuitos y Registros

Los registros de pista combinan datos normalizados (`track_id`) y compatibilidad con `circuit_name`. Las specs que toquen circuitos deben contemplar backfill, consistencia visual de gráficas y formato `M:SS.mmm`.

## Convenciones Existentes

### Frontend

- Respetar `system.md` como contrato visual.
- Reutilizar componentes compartidos antes de crear variantes por pantalla.
- Mantener los listados con búsqueda, ordenación, paginación y estados homogéneos cuando aplique.
- Usar `app-page-loader` para carga de pantalla.
- Usar `app-empty-state` para estados vacíos.
- Mantener rutas lazy-loaded.

### Backend

- Mantener endpoints bajo `/api/v1`.
- Usar modelos SQLModel y migraciones Alembic para cambios persistentes.
- Indexar campos de búsqueda, joins frecuentes y fechas operativas.
- No introducir cambios de contrato sin actualizar el servicio Angular correspondiente.
- Usar excepciones y handlers existentes para errores esperados.

### Git y PR

El `CONTRIBUTING.md` exige:

- partir de `main` actualizado,
- crear rama `feature/<descripcion>` o `hotfix/<descripcion>`,
- un commit atómico con Conventional Commits,
- push de la rama,
- PR hacia `main`.

Con SDD, cada PR debe enlazar además la carpeta de spec que originó el trabajo.

## Riesgos y Huecos Detectados

- La cobertura de tests automatizados es limitada; hay pruebas backend de integración/manual y configuración frontend para test, pero no se ve una suite amplia de specs unitarias.
- Los cambios de facturas tienen alto riesgo porque combinan IA, archivos, datos extraídos y creación de entidades relacionadas.
- Hay historial amplio de migraciones Alembic; cualquier cambio de modelo debe declarar impacto en migración y datos existentes.
- Algunas estructuras frontend ya están en proceso de homogeneización visual según `system.md`; una spec de UI debe indicar si crea, reutiliza o extiende componentes compartidos.
- Existe una modificación local en `backend/alembic.ini` al momento del análisis. No se considera parte de esta base SDD y debe preservarse.

## Definition of Ready

Una spec está lista para implementar cuando:

- El problema y el usuario afectado están claros.
- El alcance incluye explícitamente lo que queda fuera.
- Hay criterios de aceptación comprobables.
- Están documentados los cambios de contrato API y datos.
- El plan declara migraciones, seguridad, UX responsive y pruebas.
- Las dudas abiertas están resueltas o marcadas como decisión pendiente.

## Definition of Done

Una iniciativa está terminada cuando:

- La implementación cumple todos los criterios de aceptación.
- Los ficheros SDD se actualizaron con cualquier desviación real.
- Las migraciones, si existen, están revisadas.
- Se ejecutaron los checks razonables y quedaron documentados en el PR.
- El PR enlaza spec, plan, tareas y ADRs relacionadas.
