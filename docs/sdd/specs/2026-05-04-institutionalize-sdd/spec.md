# Spec: Institucionalizar SDD

Estado: Implemented
Fecha: 2026-05-04
Tipo: docs/process
Owner: Codex

## Resumen

Convertir SDD en el flujo obligatorio de trabajo para cualquier feature, hotfix, cambio visual, cambio de datos, integración o modificación de contrato en My Garage.

## Problema

El proyecto ya tiene una base SDD inicial, pero todavía puede interpretarse como documentación opcional. El usuario quiere que cualquier feature o cambio futuro se trabaje imperativamente siguiendo este paradigma.

## Usuarios y Contexto

- Usuario principal: propietario/mantenedor del proyecto.
- Contexto de uso: cualquier petición futura a agentes o contribuidores.
- Frecuencia esperada: en cada cambio de producto o ingeniería.

## Objetivos

- Hacer SDD obligatorio desde la raíz del repositorio.
- Dar instrucciones explícitas a agentes y contribuidores.
- Mantener un índice vivo de specs.
- Endurecer el PR template para exigir trazabilidad SDD.
- Documentar excepciones permitidas para hotfixes.

## Fuera de Alcance

- Automatizar checks CI para bloquear PRs sin spec.
- Crear reglas GitHub Actions.
- Reescribir specs históricas de cambios ya implementados.

## Comportamiento Esperado

### Escenario Principal

1. El usuario pide una feature o cambio.
2. El agente crea o actualiza una spec SDD antes de editar código.
3. El agente implementa contra `spec.md`, `plan.md` y `tasks.md`.
4. El PR enlaza los artefactos SDD.

### Casos Límite

- Hotfix urgente: se crea spec mínima antes del cambio y se completa antes del PR.
- Cambio trivial de documentación: no requiere spec nueva.
- Duda sobre si aplica SDD: se crea spec ligera.

## Requisitos Funcionales

- RF-1: El repositorio debe tener un `AGENTS.md` con la regla obligatoria de SDD.
- RF-2: La documentación SDD debe incluir gobernanza explícita.
- RF-3: Las specs deben tener un índice vivo.
- RF-4: El PR template debe exigir enlaces a spec, plan, tasks y ADRs.
- RF-5: `CONTRIBUTING.md` debe declarar que no se implementa código antes de spec.

## Requisitos No Funcionales

- Claridad: las reglas deben poder seguirse sin conocimiento previo del historial.
- Trazabilidad: cada cambio relevante debe poder conectarse con su motivación.
- Flexibilidad: los hotfixes deben poder avanzar con una spec mínima.
- Mantenibilidad: las reglas deben vivir en pocos documentos y con enlaces claros.

## UX y Diseño

No aplica a interfaz de usuario. Si una spec futura toca frontend, debe seguir `system.md`.

## Contratos de Datos

No hay cambios de API, base de datos ni contratos runtime.

## Migraciones

- Requiere migración: no
- Backfill: no aplica
- Compatibilidad con datos existentes: no aplica

## Criterios de Aceptación

- CA-1: Dado un agente que abre el repo, cuando lee `AGENTS.md`, entonces sabe que debe crear o actualizar una spec antes de tocar código.
- CA-2: Dado un contribuidor que abre un PR, cuando usa el template, entonces debe enlazar artefactos SDD o justificar su ausencia.
- CA-3: Dado un cambio nuevo, cuando se consulta `docs/sdd/specs/index.md`, entonces existe un lugar estándar para registrar su spec.
- CA-4: Dado un hotfix urgente, cuando se consulta la gobernanza, entonces hay una ruta rápida sin saltarse SDD.

## Pruebas Esperadas

- Documentación: revisar enlaces y coherencia de ficheros.
- Manual: comprobar que el índice apunta a esta spec.
- No ejecutable ahora: tests de aplicación, porque no hay cambios runtime.

## Dependencias

- Base SDD inicial en `docs/sdd/`.
- Protocolo existente en `CONTRIBUTING.md`.

## Preguntas Abiertas

- Si se desea enforcement automático en CI, crear una spec futura para GitHub Actions o tooling local.

## Decisiones Relacionadas

- ADR: no aplica; esta iniciativa formaliza una decisión directa del usuario.
