# Plan Técnico: Restyling de Ask en Docs & AI

Spec: [docs/sdd/specs/2026-05-16-vehicle-ask-restyling/spec.md](./spec.md)
Estado: Implemented
Fecha: 2026-05-16

## Enfoque

Reordenar la pestaña `Ask` para convertirla en la entrada principal de `Docs & AI`, construir una jerarquía visual más clara sobre el flujo funcional actual y simplificar el arranque del chat. La implementación debe ser frontend-only, apoyándose en una reorganización del markup, nuevos contenedores y variantes de estilo para diferenciar: contexto/configuración, estado de voz, conversación y compositor. También debe reforzar explícitamente la experiencia móvil y endurecer el saneado de transcripción para evitar que la wake phrase o fragmentos solapados lleguen al textarea final.

## Impacto por Capa

### Backend

- Modelos: sin cambios
- Schemas: sin cambios
- Servicios: sin cambios
- Endpoints: sin cambios
- Migraciones: no

### Frontend

- Rutas: sin cambios
- Servicios:
  - `frontend/src/app/core/services/vehicle-rag.service.ts` sin cambios de contrato
- Componentes:
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.html`
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.scss`
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.ts`
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai-voice.util.ts`
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai-voice.util.spec.ts`
- Estilos:
  - redefinición del layout de `Ask`
  - mejoras de densidad, espaciado y jerarquía en historial, citas y voz
  - ajustes mobile-first para toggles, cards de configuración y compositor
- Componentes compartidos:
  - reutilizar `mg-surface-card` y tokens globales
  - evitar crear patrones visuales locales si basta con extender estructuras existentes

### Datos

- Nuevos campos/tablas: ninguno
- Índices: no aplica
- Backfill: no aplica
- Compatibilidad: total

### Seguridad

- Autenticación/autorización: sin cambios
- Datos sensibles: sin cambios de exposición
- Logs: conservar eventos existentes; no añadir logs verbosos de contenido

### IA/Integraciones Externas

- Integración: sin cambios sobre RAG ni Web Speech API
- Estados de error: se mantienen; solo cambia su presentación visual
- Retry/fallback: se mantienen flujos actuales

## Cambios de Contrato

| Contrato | Cambio | Consumidores | Compatibilidad |
| --- | --- | --- | --- |
| `POST /api/v1/vehicles/{id}/chat/ask` | Sin cambios | frontend/backend | compatible |
| `VehicleChatResponse` | Sin cambios | frontend | compatible |
| Estado local de voz | Reorganización interna opcional y saneado más robusto de transcripciones | componente `Ask` | compatible |
| UX de envío por voz | Nuevo toggle local para auto-submit opcional tras transcripción | componente `Ask` | compatible |

## Estrategia de Implementación

1. Revisar el árbol actual de `Ask` y separar explícitamente bloques de layout: cabecera contextual, utilidades, historial y compositor.
2. Cambiar la tab seleccionada por defecto a `Ask` y revisar el impacto en la inicialización del modo voz.
3. Reestructurar el markup para que la conversación y el compositor tengan prioridad visual sobre controles secundarios.
4. Eliminar el bloque de preguntas sugeridas del estado inicial.
5. Endurecer las utilidades de voz para eliminar la wake phrase de cualquier resultado final y consolidar fragmentos solapados sin duplicación.
6. Añadir un `slide-toggle` de auto-submit tras transcripción y enlazarlo al flujo de finalización de voz, con valor inicial `false`.
7. Rediseñar estilos de mensajes, citas y notas de confianza con mejor contraste, espaciado y escaneabilidad.
8. Redefinir el bloque de voz y los controles de configuración para que comuniquen estado sin dominar visualmente la pantalla ni parecer un listener global.
9. Ajustar responsive para que en móvil la composición se apile con orden claro, las acciones ocupen el ancho correcto y los toggles no queden desalineados.
10. Revisar pruebas del componente y añadir cobertura en utilidades de voz donde el nuevo comportamiento lo justifique.

## Estrategia de Pruebas

- Unitarias:
  - tab inicial seleccionada en `Ask`
  - ausencia de sugerencias
  - render condicional de empty state e historial
  - estados del bloque de voz y toggle de auto-submit
  - flujo de transcripción con envío manual y automático
  - eliminación de wake phrase en transcripciones finales
  - consolidación de fragmentos solapados del reconocimiento
- Integración backend: no aplica
- Frontend:
  - si existen tests del componente, actualizarlos al nuevo markup
  - añadir pruebas para presencia de citas, nota de confianza, toggle y acciones principales
- Manual/UI:
  - revisar `Ask` como tab por defecto
  - revisar `Ask` con 0 mensajes, con conversación, con voz soportada y no soportada
  - verificar auto-submit activado y desactivado
  - comprobar desktop y móvil
  - validar que enviar preguntas y abrir citas sigue funcionando
- Migración: no aplica

## Riesgos

- Riesgo: tocar demasiado el markup de `vehicle-docs-ai` y romper tests o bindings existentes.
  Mitigación: mantener la lógica TS estable y limitar el cambio a estructura/presentación.
- Riesgo: que el restyling incremente complejidad en un componente ya cargado de responsabilidades.
  Mitigación: evaluar extracción de subcomponentes presentacionales si mejora legibilidad sin alterar comportamiento.
- Riesgo: que móvil quede peor al priorizar desktop.
  Mitigación: diseñar el orden responsive como parte del cambio, no como ajuste final.
- Riesgo: que el auto-submit dispare preguntas no deseadas si la transcripción finaliza con ruido.
  Mitigación: dejar el toggle apagado por defecto y limitar el envío automático a transcripciones válidas no vacías.
- Riesgo: que los navegadores móviles emitan resultados parciales/finales distintos a desktop.
  Mitigación: sanear transcripciones por utilidades puras con tests específicos y revisar manualmente el flujo móvil.

## Rollback

Al ser un cambio frontend-only sin contrato ni datos, el rollback consiste en revertir los cambios del componente `vehicle-docs-ai` y restaurar su layout anterior.

## Observabilidad

- Logs esperados: se conservan logs actuales de carga documental, chat y voz
- Errores esperados: los errores funcionales actuales deben seguir mostrándose en toast/estado local
- Métricas/manual checks:
  - tiempo de lectura del estado de voz percibido
  - claridad visual del compositor
  - facilidad para localizar y abrir citas
