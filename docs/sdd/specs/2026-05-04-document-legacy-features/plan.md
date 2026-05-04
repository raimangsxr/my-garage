# Plan Técnico: Documentar Features Legacy

Spec: ./spec.md
Estado: Implemented
Fecha: 2026-05-04

## Enfoque

Crear una baseline SDD retrospectiva con specs agrupadas por dominio. Cada spec describe el comportamiento actual y apunta a los archivos relevantes, pero no copia código ni documenta cada método línea por línea.

## Estructura

```text
docs/sdd/specs/baseline/
  platform/
  identity/
  vehicles/
  operations/
  invoices/
  tracks/
```

## Granularidad

La unidad de documentación será la capacidad funcional mantenible:

- suficientemente pequeña para servir de contexto en cambios futuros,
- suficientemente amplia para evitar specs microscópicas por botón o endpoint.

## Impacto

- Frontend: documentación de rutas, componentes y servicios existentes.
- Backend: documentación de endpoints, modelos, servicios y flujos existentes.
- Datos: documentación de entidades y relaciones existentes.
- Seguridad: documentación de autenticación y permisos actuales.
- UX: referencia a `system.md` y componentes compartidos actuales.

## Estrategia de Verificación

- Revisar existencia de carpetas y ficheros.
- Revisar enlaces desde `docs/sdd/specs/index.md`.
- Revisar que cada spec tenga spec, plan y tasks.
- No ejecutar tests runtime porque no hay cambios de aplicación.

## Riesgos

- Contratos inferidos incompletos: mantener specs concisas y actualizar cuando una feature vuelva a tocarse.
- Duplicación entre specs: usar README de baseline e índice como mapa, no repetir todo en cada documento.
