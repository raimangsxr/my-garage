# ADR-0002: Migración de Retrieval Documental a pgvector

Fecha: 2026-05-11
Estado: accepted

## Contexto

La primera versión del RAG documental persiste embeddings deterministas en JSON y calcula similitud en memoria del backend. Ese enfoque simplifica la primera entrega, pero obliga a cargar todos los chunks del vehículo para rankearlos y deja la capa vectorial fuera de PostgreSQL.

Queremos evolucionar el retrieval sin introducir una infraestructura vectorial externa separada y sin priorizar compatibilidad de datos derivados existentes, ya que los chunks y facts actuales son reconstruibles desde documentos origen.

## Decisión

Se decide migrar el retrieval documental a `pgvector` dentro de PostgreSQL:

- habilitar la extensión `vector` en la base de datos;
- persistir `vehicle_document_chunk.embedding` como `vector(256)`;
- ejecutar la similitud en SQL con ordenación por distancia coseno;
- crear la base para indexación vectorial en PostgreSQL;
- tratar chunks, embeddings y facts existentes como datos reconstruibles, reseteándolos durante la migración para forzar reindexación limpia desde el documento origen.

## Alternativas Consideradas

- Mantener JSON + ranking en Python:
  evita migración, pero escala peor y duplica trabajo fuera de la base de datos.
- Añadir `pgvector` con backfill completo de embeddings existentes:
  conserva continuidad, pero complica una migración sobre datos de prueba que no aportan valor real.
- Usar un vector store externo desde ahora:
  puede ofrecer más opciones a futuro, pero añade complejidad operativa innecesaria para el alcance actual.

## Consecuencias

- Positivas:
  - el retrieval se acerca a una arquitectura más estándar y escalable;
  - PostgreSQL resuelve la similitud sin cargar todo el corpus en memoria de aplicación;
  - queda preparado el camino para índices HNSW/IVFFLAT y embeddings mejores en el futuro.
- Negativas:
  - la migración invalida chunks y facts generados previamente;
  - el entorno local/CI pasa a depender de que `pgvector` esté instalado y habilitado.
- Neutras/operativas:
  - los documentos origen siguen siendo la fuente de verdad para reconstruir chunks y conocimiento;
  - el modelo de conocimiento derivado sigue sin versionado en esta fase.

## Impacto en My Garage

- Frontend: sin cambios de contrato funcional en esta fase.
- Backend: cambia el tipo de almacenamiento vectorial y el retrieval.
- Datos: migración destructiva solo para datos derivados reconstruibles.
- UX/diseño: sin cambios visibles salvo posible mejora de rendimiento y consistencia en `Ask`.
- Pruebas: hay que validar migración, reindexación y retrieval SQL.

## Specs Relacionadas

- [RAG de Documentación de Vehículo](../specs/2026-05-09-vehicle-document-rag/spec.md)
