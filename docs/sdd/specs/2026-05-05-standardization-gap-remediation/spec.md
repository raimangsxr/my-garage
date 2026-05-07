# Spec: Remediar Gaps de Estandarización

Estado: Implemented
Fecha: 2026-05-05
Tipo: refactor
Owner: Codex

## Resumen

Reducir los gaps restantes entre la aplicación real y el sistema estándar definido en `system.md`, empezando por patrones fundacionales que afectan a varios módulos y continuando por la deuda visual más concentrada en dashboard, track detail, vehicle detail y analítica de circuitos.

## Problema

La aplicación ya tiene una base común (`mg-page`, `mg-table`, `mg-surface-card`, `app-page-loader`), pero conserva decisiones locales creadas en iteraciones distintas. Esto provoca duplicación, diferencias visuales y comportamientos no homogéneos para acciones equivalentes.

## Usuarios y Contexto

- Usuario principal: propietario o gestor de garaje que opera datos de vehículos, mantenimientos, piezas, proveedores, facturas y circuitos.
- Contexto de uso: pantallas operativas con acciones repetidas de crear, revisar, borrar, navegar y comparar.
- Frecuencia esperada: diaria o semanal.

## Objetivos

- Sustituir confirmaciones nativas por un patrón visual compartido y accesible.
- Ampliar la base de tokens para que los módulos puedan migrar colores locales sin inventar nombres.
- Unificar los estados vacíos de los CRUD principales con el componente compartido.
- Eliminar interacciones clickable implícitas en componentes compartidos y superficies clave.
- Reducir los colores hardcodeados y variantes visuales locales en módulos con mayor divergencia.
- Alinear métricas, badges, tarjetas y paneles analíticos con una misma gramática visual.
- Mantener comportamiento funcional existente mientras se mejora coherencia.

## Fuera de Alcance

- Rediseñar completamente la información de negocio de `vehicle-detail`, circuit analytics o dashboard.
- Extraer todavía un `mg-data-table` genérico.
- Cambiar contratos de API, modelos o migraciones.
- Replantear el modelo de navegación o los flujos funcionales de los módulos.

## Comportamiento Esperado

### Escenario Principal

1. El usuario ejecuta una acción destructiva como borrar una pieza, factura o vehículo.
2. La aplicación muestra una confirmación visual coherente con `system.md`.
3. Si confirma, se ejecuta la acción existente; si cancela, no cambia ningún dato.

4. Cuando un listado CRUD no tiene resultados, la aplicación muestra un estado vacío coherente con icono, mensaje y texto secundario.
5. Cuando el usuario navega por dashboard, detalle de circuito o detalle de vehículo, las superficies analíticas usan tokens y patrones homogéneos para color, borde, fondo, foco y badges.

### Casos Límite

- Confirmación cancelada: no debe llamar al servicio de borrado/rechazo.
- Confirmación aceptada: debe preservar la lógica actual de paginación, recarga y snackbar.
- Error al cargar una imagen remota: debe mostrar feedback no nativo y recuperable.
- Un listado vacío por filtro o por ausencia total de registros: debe usar el mismo patrón visual compartido.
- Los módulos con charts o badges propios pueden conservar identidad semántica, pero deben expresarla con tokens y variantes documentadas, no con hex arbitrarios repetidos.

## Requisitos Funcionales

- RF-1: Las confirmaciones destructivas deben usar un componente compartido basado en Angular Material Dialog.
- RF-2: El diálogo debe aceptar título, mensaje, etiqueta de confirmación, etiqueta de cancelación e intención visual.
- RF-3: Los módulos existentes deben conservar sus flujos de éxito/error.
- RF-4: La documentación SDD debe reflejar los gaps detectados y las fases siguientes.
- RF-5: `parts`, `suppliers` e `invoices` deben usar `app-empty-state` en lugar de texto plano en `matNoDataRow`.
- RF-6: Componentes y superficies interactivas migradas en esta fase deben exponer semántica accesible de teclado.
- RF-7: `dashboard`, `track-detail`, `vehicle-detail`, `circuit-history-dialog`, `circuit-evolution-chart`, `track-records` y `stat-card` deben reemplazar sus colores hardcodeados principales por tokens globales o variables locales derivadas de ellos.
- RF-8: Los contenedores analíticos interactivos restantes deben usar elementos semánticos (`button`) o equivalentes accesibles cuando sean accionables.

## Requisitos No Funcionales

- Rendimiento: el diálogo no debe cargar dependencias externas ni afectar listados.
- Seguridad: no se modifican permisos ni contratos de autenticación.
- Accesibilidad: el diálogo debe tener título, acciones semánticas y foco gestionado por Material Dialog.
- Responsive: el diálogo debe funcionar en mobile con ancho máximo controlado.
- Observabilidad: se mantienen logs/snackbars existentes.

## UX y Diseño

- Referencia visual: `system.md` secciones 15, 16, 17, 20 y 21.
- Pantallas afectadas: listados CRUD, revisión de facturas, vehículos, dashboard, detalle de circuito y diálogo/componente de historial de circuito.
- Estados requeridos: confirmación, cancelación, error local, vacío, hover/focus y selección.
- Componentes compartidos a reutilizar/extender: `ConfirmDialogComponent`, `app-empty-state`, `app-entity-card`, `circuit-evolution-chart`, `stat-card`.
- Capturas/mockups: no requerido; se trabaja por alineamiento con `system.md`.

## Contratos de Datos

### Backend/API

- Endpoint(s): sin cambios.
- Request: sin cambios.
- Response: sin cambios.
- Errores esperados: sin cambios.

### Frontend

- Servicio(s): sin cambios.
- Interface(s): añadir tipo de datos del diálogo compartido.
- Estado local/global: sin estado global nuevo.

## Migraciones

- Requiere migración: no
- Backfill: no aplica
- Compatibilidad con datos existentes: no cambia datos.

## Criterios de Aceptación

- CA-1: Dado un borrado de entidad, cuando el usuario cancela el diálogo, entonces no se ejecuta el servicio de borrado.
- CA-2: Dado un borrado de entidad, cuando el usuario confirma el diálogo, entonces se ejecuta el mismo flujo que antes.
- CA-3: Dado el código frontend, cuando se buscan `confirm(` o `alert(` en features afectadas, entonces no aparecen usos nativos pendientes en el alcance de esta fase.
- CA-4: Dado `system.md`, cuando un agente necesite una confirmación, entonces encuentra el patrón obligatorio documentado.
- CA-5: Dado el frontend en esta fase, cuando se busca por colores hex en los módulos objetivo, entonces el volumen se reduce materialmente y las superficies principales usan tokens del sistema.
- CA-6: Dado un contenedor analítico interactivo objetivo, cuando se navega con teclado, entonces la interacción principal sigue siendo accesible sin depender de un `div` clickable.

## Resultado de la Fase

- Confirmaciones, estados vacíos y superficies clickable del alcance quedaron migrados a patrones compartidos.
- Los módulos con mayor divergencia visual pasaron a usar tokens globales o variables locales derivadas de ellos.
- La auditoría de hex directos en `frontend/src/app` quedó a `0`, por lo que la capa visual del frontend queda alineada con el vocabulario de tokens del sistema.

## Pruebas Esperadas

- Backend: no aplica.
- Frontend: `npx tsc -p tsconfig.app.json --noEmit`.
- Manual/UI: abrir una acción destructiva y validar aceptar/cancelar.
- No ejecutable ahora: build completo si persiste el `Abort trap: 6` del entorno Node.

## Dependencias

- Angular Material Dialog.
- `system.md` actualizado por la iniciativa de homogeneización.

## Preguntas Abiertas

- Si el patrón se repite con acciones no destructivas, decidir si se convierte en `DecisionDialogComponent` más general.

## Decisiones Relacionadas

- ADR: no aplica.
