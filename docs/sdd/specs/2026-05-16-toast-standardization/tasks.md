# Tasks: Homogeneizar Toasts y Snackbars

Spec: [spec.md](./spec.md)
Plan: [plan.md](./plan.md)

## Preparación

- [x] Confirmar rama de trabajo existente para la iniciativa.
- [x] Revisar `system.md` si toca frontend.
- [x] Revisar si hay specs SDD relacionadas y el estado actual del patrón snackbar.
- [x] Identificar usos existentes de `MatSnackBar` y variantes con acción.

## Implementación

- [x] Crear spec SDD de homogeneización de toast/snackbar.
- [x] Crear `ToastService` compartido con posición por defecto `bottom-right`.
- [x] Registrar provider global necesario para snackbar.
- [x] Migrar interceptor global HTTP al servicio compartido.
- [x] Migrar `pwa.service.ts` manteniendo snackbars con acción.
- [x] Migrar componentes frontend restantes al servicio compartido.
- [x] Actualizar `system.md` con la regla obligatoria de posición.
- [x] Actualizar documentación SDD si el alcance real cambia.

## Verificación

- [x] Ejecutar checks frontend.
- [x] Buscar usos residuales de `MatSnackBar` directos en módulos migrados.
- [ ] Validar al menos un toast de error, uno de éxito y uno con acción persistente.
- [ ] Revisar responsive visualmente si hay entorno disponible.
- [x] Documentar checks no ejecutados si aplica.

## PR

- [ ] PR enlaza `spec.md`.
- [ ] PR enlaza `plan.md`.
- [ ] PR enlaza ADRs si existen.
- [ ] PR resume pruebas ejecutadas.
- [ ] PR documenta checks no ejecutados.
- [ ] PR incluye capturas si toca UI.
