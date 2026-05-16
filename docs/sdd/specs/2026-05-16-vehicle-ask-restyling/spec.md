# Spec: Restyling de Ask en Docs & AI

Estado: Implemented
Fecha: 2026-05-16
Tipo: refactor/ui
Owner: Codex

## Resumen

Rediseñar visualmente la pestaña `Ask` dentro de `Vehicle Detail > Docs & AI` para que la experiencia de consulta asistida se sienta más clara, intencional y confiable, con una revisión explícita de la vista móvil y un saneado fiable de la transcripción de voz para que la wake phrase no aparezca en la pregunta final.

## Problema

La pestaña `Ask` ya concentra mucho valor funcional, pero su composición actual mezcla controles de configuración, activación por voz, historial y compositor en un único flujo visual con poca jerarquía, especialmente en móvil. Además, el flujo de voz puede dejar visible la wake phrase o repetir fragmentos cuando el reconocimiento devuelve utterances solapadas, generando una sensación de poca fiabilidad justo en un caso de uso donde el usuario necesita rapidez y manos libres.

## Usuarios y Contexto

- Usuario principal: propietario, mecánico o gestor que consulta documentación contextual de un vehículo.
- Contexto de uso: `frontend/src/app/features/vehicles/components/vehicle-docs-ai`, pestaña `Ask`.
- Frecuencia esperada: recurrente en mantenimiento, diagnóstico y revisión documental.

## Objetivos

- Dar a `Ask` una jerarquía visual clara entre contexto, conversación y acción principal.
- Mejorar la escaneabilidad del historial, las citas y el estado de voz.
- Hacer que el compositor de pregunta sea el CTA dominante sin competir con utilidades secundarias.
- Convertir `Ask` en la entrada principal de `Docs & AI`, dejando `Documents` como área de gestión ocasional.
- Corregir el flujo de voz para que la wake phrase nunca aparezca en la pregunta final y los fragmentos duplicados no se concatenen.
- Reducir fricción en voz permitiendo envío automático opcional tras la transcripción.
- Mantener compatibilidad total con el flujo RAG existente, la voz y las citas paginadas.

## Fuera de Alcance

- Cambiar el contrato backend o la semántica de `POST /api/v1/vehicles/{id}/chat/ask`.
- Rediseñar en esta iniciativa la pestaña `Documents`.
- Introducir nuevas capacidades IA, memoria persistente o multi-turno conversacional.
- Alterar el proveedor o contrato de reconocimiento de voz fuera del cliente.

## Comportamiento Esperado

### Escenario Principal

1. El usuario abre `Docs & AI` y aterriza directamente en `Ask` cuando existen documentos listos o cuando quiere consultar el vehículo.
2. La vista presenta un layout con jerarquía clara: contexto y controles arriba, conversación en una zona legible y compositor destacado como acción principal.
3. El usuario identifica fácilmente el estado del modo voz, el toggle de envío automático tras transcripción y las acciones disponibles sin competir visualmente con el chat.
4. Si dicta una consulta, la wake phrase se usa solo como disparador y no aparece en el textarea final, aunque el navegador devuelva resultados parciales o duplicados.
5. El usuario escribe o dicta una pregunta, decide si la transcripción debe enviarse automáticamente o quedar editable, y revisa la respuesta con citas.

### Casos Límite

- Sin documentos listos: el empty state debe seguir siendo claro y orientar a subir/indexar documentos.
- Historial vacío: la vista no debe depender de sugerencias predefinidas para resultar útil.
- Respuesta larga con varias citas: la lectura y el acceso a fuentes deben seguir siendo escaneables.
- Móvil: la composición debe reordenarse sin perder la prioridad del compositor ni la claridad del estado de voz.
- Resultados de reconocimiento solapados: la transcripción final no debe duplicar texto ni reintroducir la wake phrase.
- Navegador sin soporte de voz: la UI debe mantener un estado visual coherente sin huecos o affordances ambiguas.
- Envío automático desactivado: la transcripción debe seguir poblando el textarea sin llamar al endpoint hasta que el usuario pulse `Ask`.
- Envío automático activado: una transcripción válida debe lanzar la consulta al flujo RAG sin requerir el botón manual.

## Requisitos Funcionales

- RF-1: `Ask` debe mantener el flujo actual de pregunta escrita y respuesta citada sin cambios de contrato.
- RF-1.1: `Ask` debe abrirse por defecto al entrar en `Docs & AI`.
- RF-2: `Ask` debe presentar de forma claramente diferenciada el área de configuración, el estado de voz, el historial y el compositor.
- RF-3: el compositor debe seguir permitiendo limpiar, editar y enviar la pregunta manualmente.
- RF-4: las citas deben seguir siendo accionables y visualmente distinguibles dentro de cada respuesta.
- RF-5: la vista no debe mostrar sugerencias iniciales predefinidas.
- RF-6: la UI debe comunicar estados de voz (`idle`, `armed`, `listening`, `transcribing`, `ready`, `error`, `unsupported`) con affordance visual consistente.
- RF-7: la UI debe ofrecer un `slide-toggle` para decidir si la transcripción de voz se envía automáticamente al flujo RAG tras completarse.
- RF-7.1: el `slide-toggle` de envío automático debe iniciar desactivado por defecto.
- RF-7.2: cuando el envío automático esté desactivado, la transcripción debe dejar la pregunta editable en el textarea y requerir acción manual sobre `Ask`.
- RF-7.3: cuando el envío automático esté activado y la transcripción sea válida, la consulta debe enviarse automáticamente al flujo RAG existente.
- RF-8: la transcripción final del flujo de voz no debe incluir la wake phrase visible en el textarea ni en la pregunta enviada.
- RF-8.1: si el navegador entrega resultados parciales/finales solapados, el sistema debe consolidarlos sin duplicar texto ya capturado.
- RF-9: en móvil, los controles de configuración y voz deben mantenerse alineados, apilados por intención y con targets táctiles claros sin desbordes horizontales.

## Requisitos No Funcionales

- Rendimiento: el restyling no debe introducir renders costosos ni degradar la fluidez del chat.
- Seguridad: no debe exponer contenido documental sensible adicional ni modificar permisos.
- Accesibilidad: deben mantenerse labels claros, foco visible, contraste AA y targets táctiles >= 40px.
- Responsive: la composición debe revisarse explícitamente en desktop y móvil, con especial atención a 680px o menos.
- Observabilidad: no se requieren nuevos eventos; deben conservarse los logs existentes del flujo de voz y chat.

## UX y Diseño

- Referencia visual: `system.md`
- Pantallas afectadas:
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.html`
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.scss`
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.ts`
- Estados requeridos: loading | empty | error | success | disabled | idle | armed | listening | transcribing | ready | unsupported
- Componentes compartidos a reutilizar/extender: `app-empty-state`, `mg-surface-card`, patrones de botones Material y tokens globales
- Capturas/mockups: pendiente

### Dirección de Diseño

- Separar utilidad y conversación en bloques visuales con pesos distintos.
- Reforzar el compositor como zona principal de acción.
- Reducir la sensación de formulario apilado y acercar `Ask` a una herramienta operativa guiada.
- Dar a `Ask` el rol de vista principal del modo `Docs & AI`.
- Eliminar elementos de relleno de poco valor como las preguntas sugeridas.
- Mantener el lenguaje visual del sistema: superficies limpias, tokens compartidos, densidad controlada y feedback inmediato.

## Contratos de Datos

### Backend/API

- Endpoint(s): sin cambios
- Request: sin cambios
- Response: sin cambios
- Errores esperados: sin cambios

### Frontend

- Servicio(s): `frontend/src/app/core/services/vehicle-rag.service.ts` sin cambios de contrato previstos
- Interface(s): `VehicleChatResponse`, `VehicleDocument` y tipos de voz sin cambios previstos
- Estado local/global: se mantiene estado local en `VehicleDocsAiComponent`; podrá reorganizarse internamente si mejora la composición

## Migraciones

- Requiere migración: no
- Backfill: no aplica
- Compatibilidad con datos existentes: total

## Criterios de Aceptación

- CA-1: Dado un vehículo con documentos `ready`, cuando el usuario abre `Ask`, entonces identifica visualmente una jerarquía clara entre configuración, conversación y compositor.
- CA-2: Dado un usuario que entra en `Docs & AI`, cuando se carga la vista, entonces la pestaña seleccionada por defecto es `Ask`.
- CA-3: Dada una respuesta con citas, cuando el usuario revisa el mensaje del asistente, entonces distingue claramente el contenido principal, la nota de confianza y las fuentes accionables.
- CA-4: Dado el modo voz activo o soportado, cuando cambia de estado, entonces la UI refleja cada estado con claridad sin parecer escucha de fondo ambigua.
- CA-5: Dado un viewport móvil, cuando el usuario usa `Ask`, entonces la composición sigue siendo legible, prioriza el compositor y el historial, y no presenta toggles ni acciones desalineadas o con desbordes problemáticos.
- CA-6: Dado que el usuario ya puede preguntar y abrir citas hoy, cuando se despliegue el restyling, entonces esas capacidades siguen funcionando sin regresión observable.
- CA-7: Dado un historial vacío, cuando el usuario entra en `Ask`, entonces no ve botones de sugerencias predefinidas.
- CA-8: Dado el `slide-toggle` de envío automático desactivado, cuando termina una transcripción válida, entonces la pregunta queda editable y no se llama todavía al endpoint RAG.
- CA-9: Dado el `slide-toggle` de envío automático activado, cuando termina una transcripción válida, entonces la consulta se envía automáticamente al flujo RAG.
- CA-10: Dado un dictado con wake phrase y una o más repeticiones parciales del reconocimiento, cuando se completa la transcripción, entonces la pregunta final no contiene la wake phrase ni texto duplicado evitable.

## Pruebas Esperadas

- Backend: no aplica
- Frontend: tests de render existentes o nuevos para estados visuales clave del panel `Ask`
- Manual/UI:
  - `Ask` como pestaña por defecto
  - historial vacío sin sugerencias
  - conversación con varias respuestas y citas
  - voz en `armed`, `listening`, `ready` y `unsupported`
  - transcripción con envío automático activado y desactivado
  - transcripción con resultados solapados del reconocimiento
  - revisión desktop y móvil
- No ejecutable ahora: validación perceptual con usuarios reales de taller

## Dependencias

- `docs/sdd/specs/2026-05-09-vehicle-document-rag/spec.md`
- `docs/sdd/specs/2026-05-13-rag-document-feedback-delete/spec.md`
- `docs/sdd/specs/2026-05-15-vehicle-ask-voice-trigger/spec.md`
- `system.md`

## Preguntas Abiertas

- Si conviene resolver el restyling dentro del componente actual o extraer subcomponentes presentacionales de `Ask`.
- Si la sección de configuración debe permanecer siempre visible o colapsarse en móvil.
- Si la activación por voz debe mantenerse como card independiente o integrarse en el compositor.

## Decisiones Relacionadas

- ADR: no aplica por ahora
