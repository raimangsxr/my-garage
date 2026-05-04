# Spec: Vehicle Detail Street

Estado: Baseline
Fecha: 2026-05-04
Tipo: baseline/vehicles

## Resumen

Vista detalle street del vehículo: hero, stats, mantenimientos, piezas, facturas y pares de apriete en columnas operativas.

## Comportamiento Actual

- `/vehicles/:id` carga detalle completo vía `/api/v1/vehicles/{id}/details`.
- La respuesta agrega vehículo, specs, mantenimientos, piezas, facturas y track records.
- La vista street muestra hero, stats bar y columnas de Maintenance, Parts, Invoices y Torque Specs.
- Cada columna usa componentes compartidos como `app-entity-column`, `app-entity-card`, `app-empty-state`.
- Se puede abrir diálogo de mantenimiento/pieza, subir factura asociada y editar torque specs.
- Para vehículos `track` o `both` aparece selector Street/Track.

## Contratos

- Endpoint detalle: `backend/app/api/v1/endpoints/vehicles.py`.
- Component: `frontend/src/app/features/vehicles/vehicle-detail/`.
- Componentes: `vehicle-hero`, `vehicle-stats-bar`, `maintenance-timeline`, `vehicle-parts-list`, `torque-specs`.

## Criterios de Aceptación Baseline

- Detalle carga toda la información relacionada en una llamada.
- Street view muestra mantenimientos, piezas, facturas y torque specs.
- Estados vacíos aparecen cuando no hay datos.
- El usuario puede volver al listado.

## Riesgos / Gaps

- La respuesta detalle es manual y puede desalinearse con modelos.
- Si crecen relaciones, una sola llamada puede volverse pesada.
- La pantalla mezcla varios subdominios; cambios deben revisar specs relacionadas.
