# Spec: Documentar Features Legacy

Estado: Implemented
Fecha: 2026-05-04
Tipo: docs/process
Owner: Codex

## Resumen

Documentar retrospectivamente las capacidades existentes de My Garage como specs baseline SDD. Estas specs describen comportamiento actual construido previamente mediante iteraciones discretas y sirven como contrato inicial para gestión y desarrollo futuro.

## Problema

El proyecto contiene múltiples features ya implementadas sin specs SDD históricas. Para trabajar con el nuevo paradigma, hace falta un mapa funcional trazable que permita entender cada capacidad, sus contratos, sus riesgos y su punto natural de evolución.

## Objetivos

- Crear una taxonomía baseline por dominios funcionales.
- Documentar las capacidades existentes con granularidad media-alta.
- Mantener un consumo de contexto razonable para futuras tareas.
- Actualizar el índice SDD como mapa principal.
- Separar claramente documentación retrospectiva de specs futuras.

## Fuera de Alcance

- Cambiar código de aplicación.
- Corregir bugs detectados durante el análisis.
- Ejecutar migraciones o modificar base de datos.
- Crear CI para validar specs.

## Requisitos Funcionales

- RF-1: Debe existir `docs/sdd/specs/baseline/README.md`.
- RF-2: Las specs baseline deben agruparse por dominio.
- RF-3: Cada capacidad baseline debe tener `spec.md`, `plan.md` y `tasks.md`.
- RF-4: `docs/sdd/specs/index.md` debe enlazar todas las specs baseline.
- RF-5: Cada spec debe declarar rutas, endpoints, modelos y riesgos principales cuando aplique.

## Criterios de Aceptación

- CA-1: Dado un cambio futuro sobre facturas, cuando se consulta el índice, entonces existe una spec baseline específica del flujo afectado.
- CA-2: Dado un cambio futuro sobre vehículos, cuando se consulta `baseline/vehicles`, entonces se distinguen gestión, detalle street, especificaciones y modo track.
- CA-3: Dado un agente que necesita contexto, cuando lee una spec baseline, entonces entiende comportamiento actual sin abrir toda la aplicación.
- CA-4: Dado que no hay cambios runtime, cuando se revisan pruebas, entonces queda documentado que no aplican tests de aplicación.

## Pruebas Esperadas

- Documentación: verificar ficheros creados y enlaces.
- Git: asegurar que no se incluye el cambio local previo de `backend/alembic.ini`.
- Runtime: no aplica.

## Riesgos

- Documentar comportamiento implícito como intencional: mitigado marcando riesgos/gaps en cada spec.
- Exceso de granularidad: mitigado agrupando por capacidades funcionales mantenibles.
- Specs desactualizadas: mitigado con índice y estado baseline.
