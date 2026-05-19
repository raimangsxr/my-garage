# Feature Specification: Vehicles Document AI Assistant

**Feature Branch**: `[010-vehicles-document-ai-assistant]`

**Created**: 2026-05-19

**Status**: Baseline

**Input**: User description: "Create the individual brownfield specs proposed in docs/spec-decomposition.md using the baseline specification and research docs as source of truth."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Upload And Manage Vehicle Documents (Priority: P1)

An authenticated user uploads vehicle documents, tracks the current indexing
lifecycle, and manages document records through the existing document flow.

**Why this priority**: Document ingestion and indexing are the base behavior for
all current knowledge and question-answering capabilities.

**Independent Test**: Can be fully tested by uploading a supported document,
listing vehicle documents, and using the current update, delete, and reindex
endpoints.

**Acceptance Scenarios**:

1. **Given** an authenticated user and a vehicle, **When** the user uploads a
   supported vehicle document, **Then** the system stores it under the current
   media path and starts the documented background parsing/indexing workflow.
2. **Given** an indexed or existing vehicle document, **When** the user edits,
   deletes, or reindexes it, **Then** the system applies the current
   document-management behavior.

---

### User Story 2 - Manage Derived Knowledge Facts (Priority: P2)

An authenticated user reads and maintains the current knowledge facts derived
from indexed vehicle documentation.

**Why this priority**: Derived knowledge is a separate current artifact exposed
to users beyond raw document storage.

**Independent Test**: Can be fully tested by listing, updating, and deleting
vehicle knowledge facts for a vehicle with indexed documents.

**Acceptance Scenarios**:

1. **Given** indexed vehicle documentation and available derived facts, **When**
   the user requests vehicle knowledge, **Then** the system returns the current
   knowledge-fact list behavior.
2. **Given** an existing knowledge fact, **When** the user updates or deletes
   it, **Then** the system applies the current fact-management behavior.

---

### User Story 3 - Ask Questions Against Indexed Vehicle Materials (Priority: P1)

An authenticated user asks a question against indexed vehicle documentation and
receives the current answer structure with citations or fallback behavior.

**Why this priority**: Question answering is the primary user-facing payoff of
the current document indexing pipeline.

**Independent Test**: Can be fully tested by calling the current chat endpoint
for a vehicle with indexed material and verifying answer structure and fallback
behavior.

**Acceptance Scenarios**:

1. **Given** indexed vehicle documentation, **When** the user asks a question,
   **Then** the system returns the current answer behavior with citations and
   used-document metadata.
2. **Given** insufficient indexed material, **When** the user asks a question,
   **Then** the system returns the current fallback behavior documented in the
   research artifacts.

### Edge Cases

- What happens when local parsing cannot extract text from an uploaded document?
- What happens when Gemini-derived knowledge generation is unavailable?
- What happens when the user asks a question before indexing completes?
- Needs confirmation: whether invoice documents should always participate in the
  vehicle chat flow when user-selectable in the frontend.
- Needs confirmation: retrieval quality and embedding semantics that depend on
  external Gemini and pgvector behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow authenticated users to list vehicle
  documents and upload supported vehicle documents through the current document
  endpoints.
  Evidence: `docs/feature-inventory.md` section 11,
  `docs/api-inventory.md`,
  `specs/000-current-system-baseline/spec.md` FR-009.
- **FR-002**: Uploaded vehicle documents MUST be stored under
  `media/vehicle-documents` and start the current background
  parsing/indexing workflow.
  Evidence: `docs/feature-inventory.md` section 11,
  `docs/codebase-research.md`,
  `docs/data-model-inventory.md`.
- **FR-003**: The system MUST use the current parsing behavior: local text
  extraction when possible, especially for PDFs, with fallback to Gemini
  multimodal transcription when needed.
  Evidence: `docs/feature-inventory.md` section 11,
  `docs/codebase-research.md`,
  `specs/000-current-system-baseline/spec.md` FR-009 and FR-012.
- **FR-004**: Indexed vehicle-document text MUST be chunked and stored with the
  current pgvector embedding behavior.
  Evidence: `docs/feature-inventory.md` section 11,
  `docs/data-model-inventory.md`,
  `specs/000-current-system-baseline/spec.md` FR-009 and FR-012.
- **FR-005**: When a Gemini key is available, the system MUST derive and store
  the current vehicle knowledge facts from indexed document text.
  Evidence: `docs/feature-inventory.md` section 11,
  `docs/domain-inventory.md`,
  `specs/000-current-system-baseline/spec.md` FR-009 and FR-012.
- **FR-006**: The system MUST allow users to update, delete, and reindex
  vehicle documents through the current document-management endpoints.
  Evidence: `docs/feature-inventory.md` section 11,
  `docs/api-inventory.md`,
  `docs/domain-inventory.md`.
- **FR-007**: The system MUST allow users to list, update, and delete vehicle
  knowledge facts through the current knowledge endpoints.
  Evidence: `docs/feature-inventory.md` section 11,
  `docs/api-inventory.md`,
  `specs/000-current-system-baseline/spec.md` FR-009.
- **FR-008**: The system MUST expose the current vehicle-document question
  answering behavior through `POST /api/v1/vehicles/{vehicle_id}/chat/ask`,
  including answer citations and used-document metadata.
  Evidence: `docs/feature-inventory.md` section 11,
  `docs/api-inventory.md`,
  `specs/000-current-system-baseline/spec.md` FR-009.
- **FR-009**: The frontend MUST include the current voice-assist utilities and
  error-state behavior around the vehicle document ask experience.
  Evidence: `docs/feature-inventory.md` section 11,
  `docs/test-inventory.md`,
  `specs/000-current-system-baseline/spec.md` FR-009 and FR-010.
- **FR-010**: The spec MUST preserve invoice-chat participation intent and
  external Gemini or pgvector quality limits as `Needs confirmation`.
  Evidence: `docs/feature-inventory.md` section 11,
  `docs/test-inventory.md`,
  `specs/000-current-system-baseline/spec.md` FR-013.

### Key Entities *(include if feature involves data)*

- **VehicleDocument**: A stored vehicle-related document tracked through the
  current indexing lifecycle.
- **VehicleDocumentChunk**: A stored retrieval fragment created from indexed
  document text.
- **VehicleKnowledgeFact**: A derived knowledge item associated with a vehicle
  and optionally a vehicle document.
- **Vehicle**: The vehicle context for document indexing and question answering.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The spec covers upload, indexing, knowledge-fact management, and
  chat behavior without absorbing invoice-processing ownership.
- **SC-002**: Parsing, embedding, and citation behavior are each represented by
  at least one requirement.
- **SC-003**: External-dependency quality and invoice-chat participation
  ambiguities remain marked as `Needs confirmation`.

## Compliance & Impact *(mandatory)*

### Spec Traceability

- Governing feature/spec path: `specs/010-vehicles-document-ai-assistant/spec.md`
- In-scope user stories/requirements: US1 with FR-001 through FR-006, US2 with
  FR-005 and FR-007, US3 with FR-008 through FR-010
- Out-of-scope items explicitly excluded:
  - Invoice extraction workflow
  - Core vehicle CRUD outside vehicle-detail context
  - PWA lifecycle behavior unrelated to the assistant

### Architectural Impact

- Affected modules and boundaries:
  - Backend vehicle RAG endpoints and services plus frontend vehicle docs AI
    components and services as documented in research only.
- Required small, testable units:
  - None newly introduced by this baseline artifact.
- Planned exceptions:
  - None.

### Verification Plan

- Tests to add or update for changed behavior:
  - None. Existing backend and frontend tests remain evidence only because this
    is a documentation spec.
- Lint/type-check commands for touched application code:
  - None required because no application code is changed.
- Additional manual validation:
  - Confirm endpoint coverage, media path, and cited test references against the
    research docs.

### Security, Observability & Data Handling

- Input validation boundaries:
  - Existing document upload and ask-request validation remains at the current
    API boundaries.
- Authentication/authorization impact:
  - Vehicle-document and knowledge routes remain part of the authenticated
    application surface.
- Secrets/internal URL handling:
  - The spec documents existing Gemini-key-dependent behavior without
    introducing new secret handling.
- Observability impact:
  - No new observability behavior is introduced by this artifact.

## Assumptions

- Vehicle document processing remains distinct from invoice processing even if
  invoice records may participate as chat sources in some current paths.
- Voice-assist behavior is included because it is explicitly evidenced in the
  frontend tests and research inventory.
- Retrieval and answer quality are not asserted beyond what the research docs
  explicitly describe.
