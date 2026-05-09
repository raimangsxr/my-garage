# ADR-0001: Arquitectura Base para RAG de Documentación de Vehículo

Fecha: 2026-05-09
Estado: accepted

## Contexto

My Garage ya dispone de contexto operativo rico por vehículo y de una integración IA existente para procesar facturas con Gemini. Queremos añadir consulta documental asistida por IA sin convertir el producto en un chat genérico ni introducir una arquitectura demasiado pesada para la escala actual.

La decisión debe resolver:

- dónde vive la experiencia principal de RAG en la UI,
- cómo se modelan documentos, chunks y facts,
- y cómo implementar retrieval persistido sin añadir infraestructura externa en esta iteración.

## Decisión

Se decide que la primera arquitectura del RAG será:

- **scope principal por vehículo**, integrado en `/vehicles/:id` como modo `Docs & AI`;
- **biblioteca documental propia por vehículo**, separada del flujo de facturas aunque interoperable con él;
- **persistencia de documentos, chunks y facts en PostgreSQL**;
- **embeddings deterministas persistidos por chunk y ranking en backend** como solución inicial, sin `pgvector`;
- **respuesta generativa con citas obligatorias** y recuperación estricta previa;
- **promoción explícita de conocimiento** desde facts documentales a superficies operativas, en lugar de escribir directamente sobre specs estructuradas.

## Alternativas Consideradas

- Módulo global de chat/knowledge desde el primer día:
  simplifica visibilidad, pero diluye el contexto fuerte del vehículo y aumenta el riesgo de respuestas menos accionables.
- Base vectorial externa o `pgvector` desde la primera iteración:
  mejora escalabilidad futura, pero añade complejidad operativa prematura para un alcance aún acotado.
- Usar solo búsqueda keyword/full-text sin embeddings:
  reduce complejidad, pero empeora recuperación semántica sobre manuales largos y preguntas naturales.

## Consecuencias

- Positivas:
  - la experiencia queda anclada al flujo natural del usuario dentro del detalle de vehículo;
  - el stack sigue compacto y coherente con la arquitectura actual;
  - facts y respuestas pueden trazarse a documentos concretos;
  - evitamos mezclar demasiado pronto conocimiento inferido con datos operativos canónicos.
- Negativas:
  - `vehicle-detail` gana complejidad de producto y técnica;
  - una estrategia de embeddings local puede requerir evolución si el corpus o la ambigüedad semántica crecen mucho;
- Neutras/operativas:
  - habrá que generalizar el almacenamiento documental más allá de facturas;
  - la calidad del resultado dependerá de chunking, retrieval y corpus cargado.

## Impacto en My Garage

- Frontend:
  extensión del detalle de vehículo con un nuevo modo y subcomponentes documentales.
- Backend:
  nuevos modelos, endpoints y servicios de retrieval/answering.
- Datos:
  nuevas tablas y almacenamiento persistido de texto, embeddings y facts.
- UX/diseño:
  se refuerza el detalle de vehículo como centro de trabajo y conocimiento.
- Pruebas:
  aumentan las pruebas de integración y validación manual de citas y estados de ingesta.

## Specs Relacionadas

- [RAG de Documentación de Vehículo](../specs/2026-05-09-vehicle-document-rag/spec.md)
