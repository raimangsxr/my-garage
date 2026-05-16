# Spec: Corregir Fiabilidad de PWA, Ask y Uploads Documentales

Estado: In Progress
Fecha: 2026-05-16
Tipo: hotfix
Owner: Codex

## Resumen

Corregir varios fallos de fiabilidad detectados en móvil y en `Docs & AI`: instalación PWA inestable, desaparición de fuentes en `Ask`, envío con `Enter` no alineado con la experiencia esperada y diagnóstico/mitigación inicial del `504` al subir documentos grandes.

## Problema

La experiencia documental del producto se ha vuelto menos fiable en varios puntos críticos del flujo móvil. La instalación PWA no termina correctamente en algunos móviles, `Ask` puede responder sin mostrar fuentes accionables aunque existan documentos relevantes, la caja de pregunta inserta saltos de línea en lugar de enviar la consulta y la subida de documentos grandes puede terminar en un `504` silencioso. En conjunto, esto degrada confianza, usabilidad y capacidad real de apoyarse en la documentación del vehículo.

## Usuarios y Contexto

- Usuario principal: propietario o mecánico que consulta documentación desde móvil y usa `Docs & AI`.
- Contexto de uso: instalación de la app en navegador móvil, `Vehicle Detail > Docs & AI > Ask` y subida documental en `Documents`.
- Frecuencia esperada: recurrente.

## Objetivos

- Hacer más robusta la instalación PWA en móvil y eliminar causas conocidas de instalación silenciosa o inestable.
- Garantizar que cada respuesta de `Ask` exponga fuentes accionables relacionadas con la pregunta y que abran el documento y la página concreta cuando exista.
- Permitir que `Enter` envíe la pregunta desde el compositor de `Ask` sin insertar salto de línea.
- Identificar la causa más probable del `504` en uploads grandes y aplicar la mitigación razonable disponible en el repositorio.

## Fuera de Alcance

- Rediseñar por completo la experiencia PWA o añadir soporte offline total.
- Crear un visor documental interno con navegación a página embebida.
- Replantear la arquitectura completa de ingestión documental.

## Comportamiento Esperado

### Escenario Principal

1. El usuario instala My Garage desde móvil.
2. La app cumple las comprobaciones de instalación PWA previstas y no queda bloqueada silenciosamente.
3. En `Ask`, el usuario formula una pregunta, pulsa `Enter` y recibe respuesta con fuentes accionables.
4. Al pulsar una fuente, se abre el documento correcto y, si existe, la página concreta citada.

### Casos Límite

- Si Gemini responde sin `citations` válidas pero sí existen fuentes recuperadas, la UI debe seguir mostrando fuentes relacionadas accionables.
- Si una fuente no tiene página concreta, debe seguir abriendo el documento sin romper el flujo.
- Si el usuario necesita escribir varias líneas, `Shift+Enter` debe seguir permitiendo salto de línea.
- Si un upload grande sigue fallando por infraestructura externa al código de aplicación, el sistema debe dejar una señal diagnóstica y un mensaje menos opaco para el usuario.

## Requisitos Funcionales

- RF-1: la configuración PWA debe cumplir los metadatos y condiciones mínimas necesarias para instalación fiable en móvil.
- RF-2: `Ask` debe mostrar siempre fuentes accionables relacionadas con la pregunta cuando el backend haya recuperado fuentes relevantes.
- RF-3: las fuentes mostradas en `Ask` deben abrir el documento concreto y, cuando se conozca `page_number`, navegar a esa página.
- RF-4: pulsar `Enter` en el textarea de `Ask` debe enviar la pregunta; `Shift+Enter` debe insertar nueva línea.
- RF-5: el flujo de upload documental debe exponer mejor los errores de gateway y el despliegue versionado debe incluir la mitigación disponible para uploads/respuestas largas si el problema proviene del ingress.

## Requisitos No Funcionales

- Rendimiento: sin regresiones apreciables en `Ask` ni en la shell PWA.
- Seguridad: sin exponer rutas privadas ni documentos fuera del control actual de autenticación.
- Accesibilidad: los chips/listas de fuentes deben mantener labels y targets táctiles correctos.
- Responsive: `Ask` y la instalación PWA deben revisarse explícitamente en móvil.
- Observabilidad: registrar fallos de actualización/instalación PWA y errores de upload/citación con contexto útil.

## UX y Diseño

- Referencia visual: `system.md`
- Pantallas afectadas:
  - `frontend/src/index.html`
  - `frontend/public/manifest.webmanifest`
  - `frontend/src/app/core/services/pwa.service.ts`
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.*`
- Estados requeridos: loading | empty | error | success | disabled | update-available | offline | online
- Componentes compartidos a reutilizar/extender: `ToastService`, patrones Material existentes y tokens globales
- Capturas/mockups: no aplica

## Contratos de Datos

### Backend/API

- Endpoint(s):
  - `POST /api/v1/vehicles/{id}/chat/ask`
  - `POST /api/v1/vehicles/{id}/documents/upload`
- Request: sin cambios de shape previstos
- Response:
  - `VehicleChatAskResponse` puede requerir reforzar la presencia de fuentes accionables derivadas de recuperación real
  - uploads mantienen la respuesta documental actual
- Errores esperados:
  - `400/422` payload inválido
  - `502/503/504` error o timeout de proveedor o gateway

### Frontend

- Servicio(s):
  - `frontend/src/app/core/services/vehicle-rag.service.ts`
  - `frontend/src/app/core/services/pwa.service.ts`
- Interface(s):
  - `VehicleChatResponse`
  - `VehicleChatCitation`
  - `VehicleChatUsedDocument`
- Estado local/global:
  - historial de `Ask` por vehículo
  - estado global PWA en shell

## Migraciones

- Requiere migración: no
- Backfill: no aplica
- Compatibilidad con datos existentes: total

## Criterios de Aceptación

- CA-1: Dado un build de producción móvil, cuando el navegador evalúa la instalación PWA, entonces la app expone metadatos instalables válidos y no presenta los bloqueos silenciosos conocidos por configuración incompleta.
- CA-2: Dada una respuesta de `Ask` con fuentes recuperadas, cuando el usuario revisa el mensaje del asistente, entonces ve fuentes accionables relacionadas con la pregunta aunque el modelo no haya devuelto citas perfectas.
- CA-3: Dada una fuente documental con `page_number`, cuando el usuario pulsa la fuente desde `Ask`, entonces se abre el documento en la página concreta citada.
- CA-4: Dado el compositor de `Ask`, cuando el usuario pulsa `Enter`, entonces la pregunta se envía; y cuando pulsa `Shift+Enter`, entonces se inserta un salto de línea.
- CA-5: Dado un fallo `504` en uploads documentales grandes detrás del ingress versionado, cuando se revisa el repositorio, entonces existe una mitigación o documentación operativa concreta alineada con la causa identificada.

## Pruebas Esperadas

- Backend: tests del servicio RAG y del endpoint de chat si se ajusta la serialización de fuentes
- Frontend: `npm run build`
- Manual/UI:
  - instalación PWA en navegador móvil compatible
  - `Ask` mostrando fuentes y abriendo documento/página
  - envío con `Enter` y salto con `Shift+Enter`
  - subida de documento grande y revisión de error visible si falla
- No ejecutable ahora: validación real contra el ingress/productivo que hoy devuelve `504`, si no hay acceso al entorno desplegado

## Dependencias

- `docs/sdd/specs/2026-05-11-frontend-pwa/spec.md`
- `docs/sdd/specs/2026-05-09-vehicle-document-rag/spec.md`
- `docs/sdd/specs/2026-05-16-vehicle-ask-restyling/spec.md`
- `system.md`

## Preguntas Abiertas

- Si conviene conservar `used_documents` como resumen separado además de reforzar `citations`.
- Si el `504` proviene exclusivamente del ingress actual o de otro proxy aguas arriba no versionado en este repositorio.

## Decisiones Relacionadas

- ADR: no aplica por ahora
