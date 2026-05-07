# Spec: Corregir Tarjetas Vacías en Detalle de Vehículo

Estado: Implemented
Fecha: 2026-05-07
Tipo: hotfix
Owner: Codex

## Resumen

Corregir la visualización y edición de partes e invoices dentro del detalle de vehículo en modo street, donde actualmente se renderizan tarjetas vacías aunque el click siga funcionando y las partes se abran en modo solo lectura.

## Problema

En el detalle de vehículo, las listas de `Parts` e `Invoices` muestran múltiples items sin contenido visible. Aun así, al hacer click en partes se abre un modal con información, lo que indica que los datos existen pero la presentación está rota. Además, las partes se abren en modo no editable desde un contexto donde el usuario espera poder modificarlas.

## Usuarios y Contexto

- Usuario principal: propietario o gestor del garaje trabajando sobre el detalle de un vehículo.
- Contexto de uso: vista street de un vehículo con parts, invoices y mantenimientos relacionados.
- Frecuencia esperada: recurrente.

## Objetivos

- Hacer que las tarjetas de parts e invoices se rendericen correctamente con su contenido visible.
- Permitir editar partes desde el detalle de vehículo.
- Mantener la accesibilidad y el patrón compartido de `app-entity-card`.

## Fuera de Alcance

- Rediseñar el flujo completo de edición de invoices.
- Cambiar contratos backend del detalle de vehículo si no es necesario.

## Comportamiento Esperado

### Escenario Principal

1. El usuario abre un vehículo en modo street.
2. Las columnas de `Parts` e `Invoices` muestran cada item con su contenido visible.
3. Al hacer click en una parte, se abre el diálogo con edición habilitada.
4. Al guardar, el detalle del vehículo se refresca y muestra la información actualizada.

### Casos Límite

- Una parte sin proveedor o referencia sigue renderizando una tarjeta útil con los datos disponibles.
- Una invoice en estado de procesamiento sin número sigue mostrando un fallback visible.
- El patrón compartido de tarjeta sigue siendo accesible por teclado.

## Requisitos Funcionales

- RF-1: `app-entity-card` debe soportar contenido de bloque válido sin romper el DOM.
- RF-2: Las listas de parts e invoices del detalle de vehículo deben renderizar contenido visible.
- RF-3: El diálogo de parte abierto desde `vehicle-detail` no debe forzar `readOnly`.
- RF-4: Al cerrar el diálogo con cambios guardados, `vehicle-detail` debe refrescar sus datos.

## Requisitos No Funcionales

- Rendimiento: sin impacto material.
- Seguridad: sin cambios.
- Accesibilidad: la tarjeta compartida debe seguir siendo navegable con teclado.
- Responsive: sin cambios de layout.
- Observabilidad: se mantienen logs y snackbars existentes.

## UX y Diseño

- Referencia visual: `system.md`
- Pantallas afectadas: `vehicle-detail`, `vehicle-parts-list`, patrón compartido `entity-card`.
- Estados requeridos: default | hover | focus | empty.
- Componentes compartidos a reutilizar/extender: `app-entity-card`.
- Capturas/mockups: no requerido.

## Contratos de Datos

### Backend/API

- Endpoint(s): sin cambios previstos.
- Request: sin cambios.
- Response: sin cambios.
- Errores esperados: sin cambios.

### Frontend

- Servicio(s): `vehicle.service`, `part.service` sin cambios de contrato.
- Interface(s): sin cambios.
- Estado local/global: refresco local de `vehicle-detail` tras edición.

## Migraciones

- Requiere migración: no
- Backfill: no aplica
- Compatibilidad con datos existentes: total

## Criterios de Aceptación

- CA-1: Dado el detalle de vehículo en modo street, cuando existen parts o invoices, entonces sus tarjetas muestran contenido visible.
- CA-2: Dado una parte del detalle de vehículo, cuando el usuario la abre, entonces puede editarla.
- CA-3: Dado `app-entity-card`, cuando contiene contenido de bloque, entonces el DOM generado sigue siendo válido y accesible.

## Pruebas Esperadas

- Frontend: `npx tsc -p tsconfig.app.json --noEmit`.
- Frontend: `npm run build`.
- Manual/UI: abrir parts e invoices en `vehicle-detail` y validar render + edición de parte.
- No ejecutable ahora: validación end-to-end con backend real si no está disponible localmente.

## Dependencias

- `system.md`
- Specs previas de estandarización

## Preguntas Abiertas

- Ninguna prevista.

## Decisiones Relacionadas

- ADR: no aplica
