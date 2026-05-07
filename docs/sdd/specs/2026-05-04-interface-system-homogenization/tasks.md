# Tasks: Homogeneizar Interfaz y Sistema de Diseño

Spec: ./spec.md
Plan: ./plan.md

## Preparación

- [x] Crear rama de trabajo.
- [x] Leer `system.md`.
- [x] Leer baseline shared UI.
- [x] Cargar guidelines de interfaz.
- [x] Escanear HTML/SCSS de features, shared y layout.

## Documentación

- [x] Crear spec de iniciativa.
- [x] Crear plan técnico de auditoría.
- [x] Crear auditoría detallada.
- [x] Ampliar `system.md`.
- [x] Actualizar índice SDD.

## Implementación Fase 1

- [x] Añadir `aria-label` a botones icon-only detectados.
- [x] Mantener o añadir tooltips cuando el icono no sea autoevidente.
- [x] Sustituir `transition: all` por propiedades explícitas.
- [x] Reejecutar búsquedas estáticas de `aria-label` y `transition: all`.

## Verificación

- [x] Verificar que no se toca `backend/alembic.ini`.
- [x] Verificar enlaces de la spec.
- [x] Ejecutar búsqueda estática de icon buttons sin `aria-label`.
- [x] Ejecutar búsqueda estática de `transition: all`.
- [x] Ejecutar `npx tsc -p tsconfig.app.json --noEmit`.
- [x] Ejecutar `npm run build` completo. Verificado posteriormente durante la remediación de estandarización; mantiene warning de budget inicial excedido.
