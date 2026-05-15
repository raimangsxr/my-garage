# Plan Técnico: Invocación por voz en Ask de Docs & AI

Spec: ./spec.md
Estado: In Progress
Fecha: 2026-05-15

## Enfoque

Diseñar la entrada por voz como una extensión del compositor actual de `Ask`, no como un chat de voz aparte. La implementación queda separada en dos capas:

1. armado automático y estados de escucha en frontend;
2. reconocimiento y transcripción en cliente desacoplados del endpoint textual existente `chat/ask`.

Esto permite conservar el contrato RAG actual, minimizar regresiones y garantizar que la última palabra antes del envío siga siendo del usuario. El punto más delicado es la detección de palabra clave, porque una escucha “siempre activa” dentro del navegador introduce riesgos de soporte, privacidad y complejidad UX.

## Recomendación Inicial

Decisiones base de implementación:

- La voz solo existe dentro de `Vehicle Detail > Docs & AI > Ask`.
- La escucha se arma automáticamente al entrar en `Ask`.
- El usuario puede cancelar la escucha manualmente si no la desea.
- La palabra clave sigue siendo obligatoria para aceptar una consulta, pero no para armar la escucha.
- La detección y transcripción se hacen con Web Speech API en navegador compatible.
- La transcripción devuelve texto al textarea actual.
- La frase de activación se elimina antes de poblar el textarea.
- Tras cada utterance procesada, la UI vuelve automáticamente a `armed`.
- Cuando el asistente responde, la app intenta locutar la respuesta con `speechSynthesis` en el idioma inferido del texto.
- `POST /vehicles/{id}/chat/ask` sigue siendo exclusivamente textual.

## Decisión Implementada

Avanzar con Web Speech API en frontend para navegadores compatibles.

Razones:

- Mantiene el flujo actual de `Ask` casi intacto.
- Mantiene la implementación ligera y sin endpoints nuevos.
- Mantiene el envío final al asistente como texto manual revisable.
- Asume explícitamente que Firefox y otros navegadores no soportados usarán el flujo manual.

## Impacto por Capa

### Backend

- Modelos: sin cambios.
- Schemas: sin cambios.
- Servicios: sin cambios.
- Endpoints:
  - `POST /api/v1/vehicles/{id}/chat/ask` se mantiene.
- Migraciones:
  - no previstas.

### Frontend

- Rutas:
  - sin cambios top-level; se extiende `/vehicles/:id`.
- Servicios:
  - sin cambios de contrato con backend
- Componentes:
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.ts`
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.html`
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.scss`
  - utilidades específicas para detección de keyword y limpieza de transcripción
- Estilos:
  - nuevos estados visuales de armado, escucha, transcripción y error.
- Componentes compartidos:
  - reutilizar botones, snackbar, mensajes inline y patrones de superficie existentes.
  - evitar crear un patrón visual paralelo al compositor actual si basta con extenderlo.

### Datos

- Nuevos campos/tablas: no previstos.
- Índices: no aplica.
- Backfill: no aplica.
- Compatibilidad: total con datos existentes.

### Seguridad

- Autenticación/autorización:
  - sin cambios en backend
- Datos sensibles:
  - evitar persistir transcripciones fuera del estado local del componente
- Logs:
  - registrar solo errores operativos en cliente, no texto completo dictado

### IA/Integraciones Externas

- Integración:
  - Web Speech API del navegador
  - Speech Synthesis API del navegador para lectura de respuestas
- Estados de error:
  - micrófono denegado
  - navegador no soportado
  - activación no detectada
  - transcripción vacía
  - navegador no soportado
  - reconocimiento detenido inesperadamente
- Retry/fallback:
  - reintento de dictado
  - fallback a input manual
  - futura evolución a backend si más adelante hace falta compatibilidad extra

## Cambios de Contrato

| Contrato | Cambio | Consumidores | Compatibilidad |
| --- | --- | --- | --- |
| `POST /api/v1/vehicles/{id}/chat/ask` | sin cambio funcional en payload; sigue recibiendo solo texto final | frontend/backend | compatible |
| Estado local de `Ask` | amplía composer con máquina de estados de voz | frontend | compatible |

## Diseño de Estados

La implementación debería modelar explícitamente una máquina de estados sencilla:

1. `idle`: voz inactiva.
2. `armed`: espera de palabra clave.
3. `listening`: capturando la consulta.
4. `transcribing`: audio enviado o procesándose.
5. `ready`: texto disponible en textarea.
6. `error`: fallo recuperable.
7. `unsupported`: capacidad no disponible.

Esto ayudará a evitar condicionales dispersos en el componente actual.

## Estrategia de Implementación

1. Cerrar la decisión arquitectónica de transcripción y palabra clave.
2. Implementar estado de voz en frontend sin romper el flujo textual actual.
3. Añadir permisos, auto-armado y feedback visual en el compositor de `Ask`.
4. Implementar detección de keyword y dictado con Web Speech API.
5. Integrar la transcripción con `chatQuestion`, eliminando la wake phrase y rearmando la escucha.
6. Añadir síntesis de voz automática para respuestas del asistente con inferencia de idioma.
7. Añadir degradación para navegadores no soportados y errores de permisos.
8. Verificar responsive, accesibilidad, consola y network.

## Estrategia de Pruebas

- Unitarias frontend:
  - transiciones de estado de voz
  - habilitación/deshabilitación de acciones
  - no envío automático tras transcripción
  - comportamiento cuando ya existe texto en el textarea
- Frontend integración/UI:
  - permiso concedido/denegado
  - auto-armado al entrar en `Ask`
  - dictado y pintado del texto sin wake phrase
  - reintento tras error
  - rearmado automático tras cada transcripción
  - locución automática de la respuesta del asistente
- Manual/UI:
  - desktop y móvil
  - entorno ruidoso básico
  - cambio de pestaña durante captura
  - cancelación manual

## Riesgos

- La palabra clave real puede ser poco fiable en navegadores o entornos ruidosos:
  mitigación: mantener armado explícito, definir fallback y validar en dispositivos reales antes de endurecer la UX.
- La escucha puede percibirse como invasiva:
  mitigación: estados visuales claros, alcance limitado a `Ask` y activación explícita.
- La transcripción puede sobrescribir texto útil ya redactado:
  mitigación: definir política de append/reemplazo/confirmación y testearla.
- La latencia o precisión de la transcripción puede degradar la sensación de fluidez:
  mitigación: estado `transcribing` visible y corrección manual previa a `Ask`.
- La selección de voz/idioma puede no ser perfecta en todos los navegadores:
  mitigación: inferencia simple por texto, elección de la voz más cercana disponible y degradación silenciosa si no hay soporte.
- El componente `vehicle-docs-ai` ya concentra bastante lógica:
  mitigación: extraer helper/service o subcomponente de voice composer si el cambio crece.
- El soporte de Web Speech API no cubre todos los navegadores:
  mitigación: estado `unsupported` claro y continuidad total del flujo manual.

## Rollback

Desactivar el modo voz en frontend y mantener intacto el flujo textual actual de `Ask`.

## Observabilidad

- Logs esperados:
  - auto-armado en `Ask`
  - permiso concedido/denegado
  - wake phrase detectada o ausente
  - transcripción finalizada/fallida
- Errores esperados:
  - micrófono no disponible
  - navegador no soportado
  - reconocimiento abortado
  - transcripción vacía
- Métricas/manual checks:
  - ratio de armados que acaban en transcripción
  - ratio de errores de permisos
  - tiempo medio desde keyword hasta texto disponible
  - validación manual de precisión básica
