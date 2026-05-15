# Spec: Invocación por voz en Ask de Docs & AI

Estado: In Progress
Fecha: 2026-05-15
Tipo: feature
Owner: Codex

## Resumen

Añadir una experiencia de invocación por voz dentro de `Vehicle Detail > Docs & AI > Ask` para que el usuario pueda activar la captura con una palabra clave, dictar su consulta con las manos ocupadas o sucias, revisar la transcripción resultante en el textarea y decidir manualmente cuándo enviarla al asistente pulsando `Ask`.

## Problema

El flujo actual de `Ask` exige escribir la consulta manualmente. En el contexto real de taller o garaje esto introduce fricción, porque el usuario puede estar manipulando piezas, herramientas o documentación física y no siempre puede tocar teclado o pantalla con comodidad. Sin una entrada por voz asistida, la capacidad de consulta contextual queda menos utilizable justo en el entorno donde más valor aporta.

## Usuarios y Contexto

- Usuario principal: mecánico, propietario del vehículo o gestor del garaje.
- Contexto de uso: detalle de vehículo, pestaña `Docs & AI > Ask`, durante tareas de diagnóstico, mantenimiento o consulta rápida.
- Frecuencia esperada: recurrente, especialmente durante trabajo operativo en taller.

## Objetivos

- Permitir iniciar una consulta por voz con una palabra clave dentro del flujo `Ask`.
- Convertir el audio capturado en texto editable antes de enviarlo al asistente.
- Mantener el control final en el usuario para corregir la transcripción y pulsar `Ask` manualmente.
- Leer en voz alta las respuestas del asistente cuando el navegador lo permita.
- Diseñar la solución de forma segura y observable, sin convertir la app en un listener global ambiguo.

## Fuera de Alcance

- Envío automático de la consulta al asistente al terminar la dictada.
- Activación por voz global en toda la aplicación o fuera de la vista `Ask`.
- Conversación por voz bidireccional con respuesta hablada del asistente.
- Dictado continuo multi-turno sin intervención visual.
- Comandos de voz adicionales como cambiar filtros, pestañas o documentos en esta iniciativa.

## Comportamiento Esperado

### Escenario Principal

1. El usuario abre `/vehicles/:id`, entra en `Docs & AI` y selecciona la pestaña `Ask`.
2. El usuario habilita un modo de escucha visible y acotado a esa pestaña.
3. Al entrar en `Ask`, la interfaz queda armada automáticamente para escuchar.
4. El usuario pronuncia la palabra clave configurada y su consulta.
5. La interfaz detecta la palabra clave y transcribe la consulta con Web Speech API.
6. Si la transcripción contiene la palabra clave, el sistema elimina esa frase de activación y vuelca solo la consulta en el textarea de `Ask`.
7. Tras procesar la utterance, la interfaz vuelve a quedar armada automáticamente para siguientes consultas, salvo cancelación explícita del usuario.
8. El usuario revisa o corrige el texto.
9. Solo cuando el usuario pulsa `Ask`, la consulta textual se envía al flujo RAG existente.
10. Cuando el asistente devuelve una respuesta, la aplicación la sintetiza en voz en el idioma de la propia respuesta si el navegador soporta síntesis de voz.

### Casos Límite

- Micrófono denegado: la UI debe explicar que no puede iniciarse la escucha y ofrecer alternativa manual.
- Palabra clave no detectada: la UI debe permanecer en estado armado, sin enviar ni sobrescribir la consulta actual.
- Transcripción vacía o de baja calidad: la UI debe mantener feedback claro y permitir reintentar sin romper el historial del chat.
- Consulta ya escrita en el textarea: debe definirse si la transcripción reemplaza, concatena o pide confirmación antes de sobrescribir.
- Navegador sin capacidades de voz soportadas: debe existir degradación elegante a escritura manual.
- El usuario abandona la pestaña o cambia de vehículo durante la escucha: la captura debe cancelarse y limpiarse de forma segura.

## Requisitos Funcionales

- RF-1: la pestaña `Ask` debe ofrecer un modo de voz visible, reversible y acotado a esa vista.
- RF-2: al entrar en `Ask`, el sistema debe armar automáticamente la escucha para detectar una palabra clave, salvo cancelación explícita del usuario.
- RF-3: al detectar la palabra clave, el sistema debe pasar a estado de escucha activa de la consulta y comunicarlo visualmente.
- RF-4: la consulta de voz debe transcribirse a texto y poblar el textarea existente de `Ask` sin incluir la frase de activación.
- RF-5: la transcripción no debe enviarse automáticamente al endpoint `chat/ask`; el envío final seguirá siendo manual mediante el botón `Ask`.
- RF-6: el usuario debe poder editar la transcripción antes del envío.
- RF-7: la UI debe mostrar estados observables al menos `idle`, `armed`, `listening`, `transcribing`, `ready`, `error`, `unsupported`.
- RF-7.1: tras cada transcripción procesada, la UI debe volver automáticamente al estado `armed` si el usuario sigue dentro de `Ask` y no ha cancelado la escucha.
- RF-8: la solución debe convivir con el flujo actual escrito, preguntas sugeridas e historial de chat sin regresiones.
- RF-8.1: cuando el asistente responda, la aplicación debe intentar sintetizar esa respuesta en voz usando el idioma más cercano al texto devuelto.
- RF-9: la palabra clave, la duración máxima y la política de parada deben quedar encapsuladas para futura configuración sin rediseñar el flujo.
- RF-10: la solución debe registrar eventos operativos suficientes para diagnosticar permisos, activación, captura, transcripción y fallo.

## Requisitos No Funcionales

- Rendimiento: la activación y el cambio a estado `listening` deben sentirse inmediatos desde la perspectiva del usuario.
- Seguridad: la captura de audio debe requerir consentimiento explícito del navegador y no debe quedar activa fuera del contexto visible esperado.
- Privacidad: no deben persistirse audios ni transcripciones más allá de lo necesario para completar la solicitud, salvo decisión explícita futura.
- Accesibilidad: el modo de voz debe mantener labels claros, foco visible y feedback comprensible para usuario de teclado y lector.
- Accesibilidad: la síntesis de voz no debe bloquear la lectura ni el control manual del chat.
- Responsive: los controles de voz deben integrarse en desktop y móvil sin degradar el layout del compositor actual.
- Observabilidad: deben registrarse errores de permisos, timeouts, audio vacío, fallo de proveedor y cancelaciones.

## UX y Diseño

- Referencia visual: `system.md`
- Pantallas afectadas: `frontend/src/app/features/vehicles/vehicle-detail/*`, `frontend/src/app/features/vehicles/components/vehicle-docs-ai/*`
- Estados requeridos: idle | armed | listening | transcribing | ready | error | unsupported | disabled
- Componentes compartidos a reutilizar/extender: `app-empty-state`, `app-page-loader`, patrón `mg-surface-card`, `snackbar`, controles Material existentes
- Capturas/mockups: pendiente

### Notas UX a validar

- El modo voz no debe parecer escucha permanente de fondo; debe haber affordance clara de “armado” y de “escuchando”.
- El textarea sigue siendo la fuente de verdad antes de `Ask`.
- Debe evitarse que una activación accidental borre una consulta ya escrita sin aviso.

## Contratos de Datos

### Backend/API

- Endpoint(s) existentes afectados:
  - `POST /api/v1/vehicles/{id}/chat/ask` se mantiene como envío textual final.
- Endpoint(s) nuevos:
  - no aplica en la versión actual
- Request:
  - sin cambios respecto al flujo textual actual; el textarea sigue alimentando `question`
- Response:
  - sin cambios respecto al flujo textual actual
- Errores esperados:
  - los principales errores del flujo de voz ocurren en cliente por soporte, permisos o reconocimiento

### Frontend

- Servicio(s):
  - utilidades y estado local apoyados en Web Speech API del navegador
- Interface(s):
  - `VehicleVoiceState`
  - tipos locales para reconocimiento y resultados de activación/transcripción
- Estado local/global:
  - estado local en `vehicle-docs-ai` para permiso, escucha, grabación, transcripción y errores
  - el historial de chat se mantiene igual; la voz solo alimenta `chatQuestion`

## Migraciones

- Requiere migración: no decidido, previsiblemente no
- Backfill: no aplica
- Compatibilidad con datos existentes: total; la nueva capacidad no debe alterar documentos, chunks, facts ni historial actual

## Criterios de Aceptación

- CA-1: Dado un usuario en `Docs & AI > Ask` con micrófono permitido, cuando entra en la pestaña, entonces la UI queda armada automáticamente para escuchar la palabra clave sin enviar todavía ninguna consulta.
- CA-2: Dado un usuario que dicta una consulta tras la palabra clave, cuando finaliza la captura, entonces el sistema muestra la transcripción en el textarea de `Ask` sin incluir la palabra clave.
- CA-3: Dado que la transcripción contiene errores, cuando el usuario la corrige manualmente y pulsa `Ask`, entonces el backend recibe la versión corregida y no la transcripción original.
- CA-4: Dado un usuario con una consulta transcrita, cuando no pulsa `Ask`, entonces no se crea ningún mensaje nuevo en el chat ni se llama al endpoint RAG.
- CA-5: Dado que el navegador deniega el acceso al micrófono, cuando el usuario intenta activar el modo voz, entonces recibe feedback claro y el flujo escrito sigue disponible.
- CA-6: Dado un navegador sin soporte suficiente para Web Speech API, cuando el usuario entra en `Ask`, entonces la UI muestra `unsupported` y el flujo manual sigue funcionando sin romperse.
- CA-7: Dado que la captura o transcripción falla, cuando el proceso termina con error, entonces la UI informa del problema y permite reintentar sin perder el historial del chat.
- CA-8: Dado un usuario que completa una transcripción válida, cuando termina el procesamiento, entonces la UI vuelve automáticamente a `armed` para la siguiente consulta si el usuario no ha cancelado la escucha.
- CA-9: Dado que el usuario ya tenía texto en el textarea, cuando llega una nueva transcripción, entonces el comportamiento frente a sobrescritura sigue la política definida en la implementación y se comunica claramente.
- CA-10: Dado que el asistente devuelve una respuesta, cuando el navegador soporta síntesis de voz, entonces la respuesta se reproduce automáticamente en voz en el idioma inferido de esa respuesta.

## Pruebas Esperadas

- Backend: no aplica en la primera versión del modo voz.
- Frontend: tests de máquina de estados de voz, render de controles, degradación por falta de soporte, no envío automático e inferencia básica del idioma de locución.
- Manual/UI: permiso de micrófono, activación por palabra clave, dictado, corrección manual, envío final y cancelación.
- No ejecutable ahora: precisión real del reconocimiento de palabra clave y transcripción en entornos ruidosos hasta disponer de pruebas en dispositivos reales.

## Dependencias

- `docs/sdd/README.md`
- `docs/sdd/workflow.md`
- `docs/sdd/quality-gates.md`
- `system.md`
- spec existente `docs/sdd/specs/2026-05-09-vehicle-document-rag/spec.md`
- integración IA ya existente para `Ask`

## Preguntas Abiertas

- Si la detección de palabra clave debe funcionar solo con escucha armada explícitamente o en escucha siempre activa dentro de la pestaña.
- Si la detección de palabra clave debe hacerse en frontend, en backend o en un esquema híbrido.
- Si la primera versión debe usar APIs nativas del navegador, transcripción backend o ambas con fallback.
- Qué política aplicar cuando ya exista texto en el textarea y llegue una nueva transcripción.
- Si debemos permitir elegir idioma de dictado o inferirlo automáticamente.

## Decisiones Relacionadas

- Sin ADR en la primera versión si se mantiene una implementación frontend-only acotada a `Ask` y sin nueva integración externa.
