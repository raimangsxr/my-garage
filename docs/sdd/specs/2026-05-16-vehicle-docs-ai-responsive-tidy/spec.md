# Spec: Ordenar y Compactar Docs & AI en Detalle de Vehículo

Estado: In Progress
Fecha: 2026-05-16
Tipo: refactor/ui
Owner: Codex

## Resumen

Reordenar la experiencia `Vehicle Detail > Docs & AI` para que `Ask` sea más clara y utilizable, especialmente en móvil, reduciendo scroll innecesario, compactando el contexto del vehículo y dando prioridad visual al historial y al compositor.

## Problema

La revisión manual de `https://garage.rromani.eu/vehicles/2` muestra una experiencia irregular en `Docs & AI`: el usuario atraviesa hero, stats completos y una pila larga de tarjetas antes de llegar a la acción principal, mientras que dentro de `Ask` los bloques de configuración, voz, conversación y compositor compiten con el mismo peso visual. En móvil esto obliga a demasiado scroll y hace que la vista se sienta desordenada.

## Usuarios y Contexto

- Usuario principal: propietario o mecánico que consulta documentación y hace preguntas operativas sobre un vehículo.
- Contexto de uso: `Vehicle Detail > Docs & AI`, con foco en `Ask`.
- Frecuencia esperada: recurrente en consultas rápidas de mantenimiento, procedimientos y documentación.

## Objetivos

- Reducir el scroll previo a la acción principal cuando el usuario entra en `Docs & AI`.
- Priorizar visualmente compositor e historial frente a controles secundarios.
- Reducir literatura visible y mover la explicación secundaria a affordances discretos.
- Mantener el flujo actual de documentos, preguntas, respuestas y citas sin cambiar contratos.

## Fuera de Alcance

- Cambiar endpoints backend o el flujo RAG.
- Rediseñar de cero la pestaña `Documents`.
- Alterar el comportamiento funcional de voz más allá de su presentación visual.

## Comportamiento Esperado

### Escenario Principal

1. El usuario entra en `Docs & AI` desde el detalle del vehículo.
2. La vista muestra un contexto compacto del vehículo sin obligar a recorrer toda la barra de stats tradicional.
3. Dentro de `Ask`, el usuario identifica primero dónde preguntar y dónde leer la conversación, mientras que ajustes y voz quedan presentes pero más contenidos.

### Casos Límite

- Móvil: el compositor debe quedar accesible sin atravesar una cadena excesiva de tarjetas de contexto.
- Historial vacío: la vista debe seguir resultando clara y accionable.
- Historial con respuestas y citas: el contenido debe seguir siendo legible sin chips o bloques desalineados.
- Error de micrófono: el estado de voz debe informar sin romper la jerarquía visual de la pantalla.

## Requisitos Funcionales

- RF-1: `Docs & AI` debe seguir permitiendo consultar documentos y usar `Ask` sin cambios de contrato.
- RF-2: Al estar en modo `docs`, el detalle del vehículo debe mostrar un contexto más compacto que la barra completa de stats.
- RF-3: `Ask` debe separar visualmente compositor, conversación, ajustes y voz en bloques con jerarquía clara.
- RF-4: En móvil, el compositor y la conversación deben priorizarse por encima de bloques secundarios.
- RF-5: Las citas deben seguir siendo accionables y legibles.
- RF-6: La ayuda explicativa no crítica debe mostrarse preferentemente mediante tooltip en hover y pulsación prolongada en táctil, en lugar de párrafos visibles largos.
- RF-7: La composición de `Docs & AI` debe tolerar textos cortos, medios y largos sin desbordar tarjetas, encabezados ni controles.

## Requisitos No Funcionales

- Rendimiento: el cambio debe ser frontend-only y no introducir renders costosos.
- Seguridad: no cambia permisos ni exposición de datos.
- Accesibilidad: mantener contraste AA, foco visible, `aria-label` en icon-only y targets táctiles >= 40px.
- Responsive: revisión explícita en desktop y móvil.
- Observabilidad: no se añaden nuevos eventos; se conservan estados y toasts existentes.

## UX y Diseño

- Referencia visual: `system.md`
- Pantallas afectadas:
  - `frontend/src/app/features/vehicles/vehicle-detail/vehicle-detail.component.html`
  - `frontend/src/app/features/vehicles/vehicle-detail/vehicle-detail.component.scss`
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.html`
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.scss`
- Estados requeridos: loading | empty | error | success | disabled | idle | armed | listening | transcribing | ready | unsupported
- Componentes compartidos a reutilizar/extender: `app-empty-state`, `mg-surface-card`, tokens globales
- Capturas/mockups: auditoría manual en `garage.rromani.eu`

## Contratos de Datos

### Backend/API

- Endpoint(s): sin cambios
- Request: sin cambios
- Response: sin cambios
- Errores esperados: sin cambios

### Frontend

- Servicio(s): `frontend/src/app/core/services/vehicle-rag.service.ts`
- Interface(s): `VehicleChatResponse`, `VehicleDocument`
- Estado local/global: sin cambios de contrato; solo reorganización visual

## Migraciones

- Requiere migración: no
- Backfill: no aplica
- Compatibilidad con datos existentes: total

## Criterios de Aceptación

- CA-1: Dado que el usuario entra en `Docs & AI`, cuando la vista se renderiza, entonces ya no ve la barra de stats completa previa al área documental.
- CA-2: Dado un viewport móvil, cuando el usuario abre `Ask`, entonces llega al compositor sin recorrer una secuencia excesiva de bloques previos.
- CA-3: Dado un historial con mensajes y citas, cuando el usuario revisa la conversación, entonces el contenido principal y las fuentes siguen siendo legibles y accionables.
- CA-4: Dado un estado de voz con error o disponibilidad, cuando el usuario revisa el panel, entonces entiende el estado sin que el bloque domine la pantalla.
- CA-5: Dado un viewport desktop, cuando el usuario usa `Ask`, entonces identifica con claridad qué parte es configuración, qué parte es conversación y qué parte es acción principal.

## Pruebas Esperadas

- Backend: no aplica
- Frontend: build del frontend y revisión de templates/estilos afectados
- Manual/UI:
  - revisión desktop en `Docs & AI`
  - revisión móvil en `Docs & AI`
  - pregunta con respuesta y citas
  - estado vacío de historial
  - estado de error de micrófono
- No ejecutable ahora: validación visual en el despliegue final tras publicar

## Dependencias

- `docs/sdd/specs/2026-05-09-vehicle-document-rag/spec.md`
- `docs/sdd/specs/2026-05-16-vehicle-ask-restyling/spec.md`
- `system.md`

## Preguntas Abiertas

- Si tras este ajuste conviene añadir una variante compacta reutilizable del hero/stats específicamente para vistas documentales.

## Decisiones Relacionadas

- ADR: no aplica
