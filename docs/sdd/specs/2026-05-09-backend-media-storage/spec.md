# Spec: Unificar Storage Backend en Media

Estado: In Progress
Fecha: 2026-05-09
Tipo: refactor
Owner: Codex

## Resumen

Mover el almacenamiento documental del backend a `backend/media/` para que los documentos subidos por la aplicación se guarden y se sirvan desde una ruta coherente con el despliegue actual.

## Problema

El backend sigue guardando y publicando documentos bajo `uploads`, mientras que el despliegue Kubernetes y parte de la documentación ya operan con `media`. Esta divergencia complica la operación, genera configuraciones duplicadas y aumenta el riesgo de rutas rotas entre entornos.

## Usuarios y Contexto

- Usuario principal: usuario autenticado que sube facturas o documentación de vehículo
- Contexto de uso: flujos de upload y consulta de documentos en backend y frontend
- Frecuencia esperada: recurrente

## Objetivos

- Guardar nuevos documentos subidos por la aplicación dentro de `backend/media/`.
- Servir los nuevos documentos públicos bajo URLs `/media/...` sin romper la lectura de rutas legacy ya persistidas.

## Fuera de Alcance

- Migrar retroactivamente registros ya persistidos en base de datos de `/uploads/...` a `/media/...`.
- Cambiar el almacenamiento binario de imágenes de vehículo en base de datos.

## Comportamiento Esperado

### Escenario Principal

1. Un usuario sube una factura o documento de vehículo.
2. El backend guarda el archivo físico dentro de `backend/media/<subdirectorio>/`.
3. El backend persiste y expone una `file_url` pública bajo `/media/<subdirectorio>/<archivo>`.

### Casos Límite

- Documento legacy con `file_url` apuntando a `/uploads/...`: el backend sigue pudiendo resolverlo para lectura o borrado.
- Entorno local con frontend en proxy: las URLs `/media/...` siguen siendo accesibles durante desarrollo.

## Requisitos Funcionales

- RF-1: El sistema debe guardar nuevas facturas en `media/invoices`.
- RF-2: El sistema debe guardar nueva documentación de vehículo en `media/vehicle-documents`.
- RF-3: El sistema debe publicar nuevos archivos con `file_url` bajo `/media/...`.
- RF-4: El sistema debe mantener compatibilidad operativa con `file_url` legacy bajo `/uploads/...`.

## Requisitos No Funcionales

- Rendimiento: la escritura streaming existente debe mantenerse para archivos grandes.
- Seguridad: no se amplían permisos ni exposición pública fuera del directorio de media.
- Accesibilidad: no aplica.
- Responsive: no aplica.
- Observabilidad: los errores de acceso o borrado deben seguir usando el manejo actual.

## UX y Diseño

- Referencia visual: `system.md`
- Pantallas afectadas: vistas de facturas y documentación de vehículo que consumen `file_url`
- Estados requeridos: success | error
- Componentes compartidos a reutilizar/extender: no aplica
- Capturas/mockups: no aplica

## Contratos de Datos

### Backend/API

- Endpoint(s): `POST /api/v1/invoices/upload`, `POST /api/v1/vehicles/{vehicle_id}/documents/upload`
- Request: multipart con archivo y metadatos existentes
- Response: mantiene el contrato actual, cambiando `file_url` nueva a `/media/...`
- Errores esperados: `400` para tipos inválidos, `404` cuando el recurso no existe

### Frontend

- Servicio(s): consumo de `file_url` en vistas ya existentes
- Interface(s): sin cambios de forma
- Estado local/global: sin cambios

## Migraciones

- Requiere migración: no
- Backfill: no
- Compatibilidad con datos existentes: se conserva compatibilidad con URLs legacy `/uploads/...`

## Criterios de Aceptación

- CA-1: Dado un upload nuevo de factura, cuando el backend guarda el archivo, entonces lo escribe bajo `backend/media/invoices` y devuelve `file_url` con prefijo `/media/invoices/`.
- CA-2: Dado un upload nuevo de documento de vehículo, cuando el backend guarda el archivo, entonces lo escribe bajo `backend/media/vehicle-documents` y devuelve `file_url` con prefijo `/media/vehicle-documents/`.
- CA-3: Dado un registro legacy con `file_url` bajo `/uploads/...`, cuando el backend necesita resolver su ruta física, entonces sigue localizando el archivo sin requerir migración previa.

## Pruebas Esperadas

- Backend: tests unitarios del storage y del resolvedor de rutas legacy.
- Frontend: no aplica.
- Manual/UI: validar acceso HTTP a una URL `/media/...`.
- No ejecutable ahora: validación end-to-end completa frontend/backend si no hay entorno levantado.

## Dependencias

- Configuración de proxy frontend en desarrollo.
- Montaje de volumen `/app/media` en despliegue Kubernetes.

## Preguntas Abiertas

- Ninguna por ahora.

## Decisiones Relacionadas

- ADR: no aplica
