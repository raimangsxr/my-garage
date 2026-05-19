# Spec: Overhaul de Docs & AI

Estado: In Progress
Fecha: 2026-05-16
Tipo: refactor/ui
Owner: Codex

## Resumen

Reestructurar de forma integral `Vehicle Detail > Docs & AI` para que el flujo de consulta y gestión documental sea coherente con `system.md`, resuelva los fallos actuales de layout y reduzca la complejidad visual y técnica del módulo.

## Problema

La implementación actual de `Docs & AI` combina mejoras recientes con una base local demasiado acoplada. El resultado visible en `localhost:4200/vehicles/2` sigue siendo deficiente: en desktop hay roturas de layout en `Ask settings`, en móvil el usuario atraviesa demasiados bloques antes de llegar a la acción principal y el conjunto no se siente alineado con los patrones compartidos del producto.

## Usuarios y Contexto

- Usuario principal: propietario, mecánico o gestor que consulta documentación contextual de un vehículo.
- Contexto de uso: `Vehicle Detail > Docs & AI` en la Ducati Panigale 1299 S y resto de vehículos con documentación indexada.
- Frecuencia esperada: recurrente durante mantenimiento, diagnóstico y revisión documental.

## Objetivos

- Corregir los fallos de layout y responsive detectados en `Ask` y `Documents`.
- Priorizar la acción principal de preguntar sin obligar a atravesar una pila de contexto y tarjetas antes del compositor.
- Alinear `Docs & AI` con patrones compartidos del sistema visual y con una arquitectura frontend más mantenible.
- Añadir estados visuales más robustos para errores y recuperación sin depender solo de toasts efímeros.

## Fuera de Alcance

- Cambiar contratos backend o el flujo RAG.
- Introducir nuevas capacidades IA o nuevos modos de consulta.
- Rehacer el hero global del detalle de vehículo fuera del impacto necesario para `Docs & AI`.

## Comportamiento Esperado

### Escenario Principal

1. El usuario entra en `Docs & AI` desde el detalle del vehículo.
2. La pantalla presenta primero la acción principal y el estado operativo del módulo con contexto suficiente pero contenido.
3. El usuario puede alternar entre `Ask` y `Documents` sin encontrar solapes, columnas rotas ni scroll innecesario.
4. Si ocurre un error de carga o consulta, la UI muestra un estado recuperable con acción explícita.

### Casos Límite

- Desktop con panel lateral de ajustes: el contenido no debe colapsar ni renderizarse en vertical.
- Móvil: el compositor debe quedar accesible con menos scroll y sin competir con bloques secundarios.
- Historial vacío: el panel debe seguir resultando útil y accionable.
- Navegador sin voz o con error de micrófono: el módulo debe comunicar el estado sin romper la jerarquía principal.
- Vehículo sin documentos listos: el usuario debe ver un estado vacío claro orientado a la carga documental.

## Requisitos Funcionales

- RF-1: `Docs & AI` debe mantener las capacidades actuales de documentos, preguntas, citas y voz sin cambiar contratos.
- RF-2: `Ask` debe priorizar compositor e historial frente a métricas, ayudas y bloques secundarios.
- RF-3: `Ask settings` debe renderizarse correctamente en desktop y móvil sin colapsar labels, campos ni toggles.
- RF-4: `Documents` debe presentar la información documental con una jerarquía más operativa y consistente.
- RF-5: El módulo debe mostrar estados `loading`, `empty` y `error` con recuperación explícita cuando aplique.
- RF-6: La vista `docs` del detalle de vehículo debe usar contexto compacto y no duplicar densidad innecesaria frente al resto del detalle.
- RF-7: La implementación frontend debe reducir el acoplamiento interno separando mejor layout, estados y bloques visuales.

## Requisitos No Funcionales

- Rendimiento: el cambio debe seguir siendo frontend-only y no añadir trabajo innecesario al render.
- Seguridad: sin cambios de permisos ni exposición de datos.
- Accesibilidad: contraste AA, foco visible, `aria-label` en acciones icon-only y objetivos táctiles >= 40px.
- Responsive: revisión explícita en desktop y móvil real sobre `localhost`.
- Observabilidad: mantener toasts existentes como feedback breve, pero no como único mecanismo de recuperación.

## UX y Diseño

- Referencia visual: `system.md`
- Pantallas afectadas:
  - `frontend/src/app/features/vehicles/vehicle-detail/vehicle-detail.component.html`
  - `frontend/src/app/features/vehicles/vehicle-detail/vehicle-detail.component.scss`
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.ts`
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.html`
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.scss`
- Estados requeridos: loading | empty | error | success | disabled | idle | armed | listening | transcribing | ready | unsupported
- Componentes compartidos a reutilizar/extender: `app-empty-state`, `app-page-loader`, `mg-surface-card`, tokens globales
- Capturas/mockups: validación manual en `http://127.0.0.1:4200/vehicles/2`

## Contratos de Datos

### Backend/API

- Endpoint(s): sin cambios
- Request: sin cambios
- Response: sin cambios
- Errores esperados: sin cambios de contrato; mejora de representación visual en frontend

### Frontend

- Servicio(s): `frontend/src/app/core/services/vehicle-rag.service.ts`
- Interface(s): `VehicleDocument`, `VehicleChatResponse`
- Estado local/global: se mantiene estado local en `VehicleDocsAiComponent`, pero se reorganiza su representación visual y el manejo de errores visibles

## Migraciones

- Requiere migración: no
- Backfill: no aplica
- Compatibilidad con datos existentes: total

## Criterios de Aceptación

- CA-1: Dado el panel `Ask` en desktop, cuando se renderiza la columna de ajustes, entonces los labels, campos y toggles no colapsan ni aparecen en vertical.
- CA-2: Dado un viewport móvil, cuando el usuario abre `Docs & AI`, entonces llega al compositor con menos scroll y con jerarquía clara entre acción principal y bloques secundarios.
- CA-3: Dado un error al cargar documentos o al consultar `Ask`, cuando la operación falla, entonces el usuario ve un estado recuperable con acción explícita.
- CA-4: Dado un vehículo con documentos listos, cuando alterna entre `Ask` y `Documents`, entonces ambas vistas mantienen una composición consistente y alineada con `system.md`.
- CA-5: Dado el flujo actual de citas, voz y preguntas, cuando se despliega el overhaul, entonces las capacidades existentes siguen funcionando sin regresión observable.

## Pruebas Esperadas

- Backend: no aplica
- Frontend: `npm run build`
- Manual/UI:
  - revisión desktop en `Docs & AI > Ask`
  - revisión desktop en `Docs & AI > Documents`
  - revisión móvil en `Docs & AI`
  - estado vacío de historial
  - pregunta con respuesta y citas
  - voz en estado soportado
- No ejecutable ahora: validación con usuarios finales reales

## Dependencias

- `docs/sdd/specs/2026-05-09-vehicle-document-rag/spec.md`
- `docs/sdd/specs/2026-05-16-vehicle-ask-restyling/spec.md`
- `docs/sdd/specs/2026-05-16-vehicle-docs-ai-responsive-tidy/spec.md`
- `system.md`

## Preguntas Abiertas

- Si el siguiente paso tras este overhaul debe ser extraer subcomponentes presentacionales específicos de `Docs & AI`.

## Decisiones Relacionadas

- ADR: no aplica por ahora
