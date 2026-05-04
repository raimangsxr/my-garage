# Baseline SDD

Esta carpeta documenta retrospectivamente las capacidades existentes de My Garage. Son specs baseline: describen comportamiento actual ya implementado y sirven como punto de partida para cambios futuros.

## Cómo Usar Esta Baseline

- Para modificar una feature existente, lee primero la spec baseline correspondiente.
- Si el cambio altera comportamiento, crea una spec fechada nueva y enlaza la baseline.
- Si la baseline está incompleta, actualízala como parte del trabajo.
- Los riesgos/gaps documentados no son tareas activas por sí mismos; deben convertirse en specs nuevas antes de implementarse.

## Dominios

- `platform`: arquitectura transversal, shell y componentes compartidos.
- `identity`: autenticación, perfil, Google OAuth y ajustes.
- `vehicles`: gestión de vehículos, detalle, especificaciones y modo pista.
- `operations`: dashboard, mantenimientos, piezas, proveedores y avisos.
- `invoices`: gestión de facturas, procesamiento IA y revisión/aprobación.
- `tracks`: circuitos, tracks normalizados y registros de vueltas.

## Estado

Todas las specs baseline se consideran `Baseline` salvo que el índice indique otro estado. Este estado significa que documentan el producto existente, no una iniciativa futura.
