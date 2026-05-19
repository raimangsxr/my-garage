# Feature Specification: Current System Baseline

**Feature Branch**: `[000-current-system-baseline]`

**Created**: 2026-05-19

**Status**: Baseline

**Input**: User description: "Create a baseline specification for the current existing system. This is a brownfield/as-is specification, not a new feature request. Use these files as source of truth: docs/codebase-research.md, docs/feature-inventory.md, docs/domain-inventory.md, docs/api-inventory.md, docs/data-model-inventory.md, docs/test-inventory.md. Document only current behavior. Do not propose future enhancements. Do not write implementation details unless needed to identify current behavior. Mark unclear behavior as 'Needs confirmation'. Include actors, user journeys, functional requirements, acceptance criteria, edge cases and out-of-scope. Every requirement must reference evidence from the research documents. Name the spec: 000-current-system-baseline."

## Actors

- **Authenticated User**: Uses the application to manage vehicles, maintenance,
  parts, suppliers, invoices, tracks, notifications, profile settings, and
  vehicle documentation knowledge.
- **End User Using Google Sign-In**: Accesses the same authenticated experience
  through Google-based sign-in when configured.
- **Operator / Maintainer**: Uses the documented scripts and baseline artifacts
  to understand, seed, verify, or support the existing system behavior.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Access And Manage Garage Records (Priority: P1)

An authenticated user enters the application, accesses the dashboard, and
manages the core garage records that already exist in the current system:
vehicles, maintenance, parts, suppliers, tracks, notifications, profile data,
and personal settings.

**Why this priority**: This is the broadest existing business flow and the base
capability on which the rest of the system depends.

**Independent Test**: Can be fully tested by authenticating, navigating through
the authenticated routes, and confirming that the current record-management
areas and summary views are reachable and behave as documented in the research
artifacts.

**Acceptance Scenarios**:

1. **Given** a valid authenticated user, **When** the user enters the
   application, **Then** the user can reach the existing authenticated areas for
   dashboard, vehicles, maintenance, parts, suppliers, tracks, notifications,
   profile, and settings.
2. **Given** an authenticated user viewing current garage data, **When** the
   user performs the documented create, read, update, delete, or list actions
   for supported record types, **Then** the system reflects only the behaviors
   already evidenced in the source documents.

---

### User Story 2 - Process Existing Invoice Workflow (Priority: P1)

An authenticated user uploads an invoice, allows the current system to extract
structured information, reviews the extracted content, and either approves,
retries, rejects for reprocessing, or deletes the invoice according to the
existing invoice lifecycle.

**Why this priority**: Invoice handling is one of the most behaviorally rich
existing workflows and connects uploaded documents to business records.

**Independent Test**: Can be fully tested by uploading an invoice into the
current system, observing the documented lifecycle states, and confirming the
review and approval actions described in the research documents.

**Acceptance Scenarios**:

1. **Given** an authenticated user with access to invoices, **When** the user
   uploads an invoice, **Then** the system records the upload and progresses it
   through the currently documented processing lifecycle.
2. **Given** an invoice that has reached review state, **When** the user edits,
   approves, retries, rejects, or deletes it, **Then** the system performs only
   the current documented outcomes associated with those actions.

---

### User Story 3 - Use Existing Vehicle Document Knowledge Features (Priority: P2)

An authenticated user uploads a vehicle document, lets the current system index
it, reviews any derived knowledge, and asks questions against the indexed
vehicle documentation using the current document-assisted chat flow.

**Why this priority**: This is a distinct current capability with its own
document lifecycle, derived knowledge, and user-facing AI-assisted behavior.

**Independent Test**: Can be fully tested by uploading a supported vehicle
document, confirming the document and knowledge views update according to the
current flow, and asking a question against indexed materials.

**Acceptance Scenarios**:

1. **Given** an authenticated user on a vehicle detail context, **When** the
   user uploads a supported vehicle document, **Then** the system stores and
   tracks the document using the current indexing lifecycle.
2. **Given** indexed vehicle documentation, **When** the user asks a question,
   **Then** the system returns the currently documented answer structure,
   including citations or fallback behavior when sufficient indexed material is
   not available.

---

### User Story 4 - Understand The Current System Boundary (Priority: P3)

A stakeholder, maintainer, or analyst needs an as-is specification that
captures only the current system behavior, actors, scope boundaries, and known
uncertainties without introducing new features.

**Why this priority**: The baseline specification exists to anchor future work
to current behavior rather than assumptions.

**Independent Test**: Can be fully tested by tracing each documented
requirement, scenario, and scope statement back to the research documents named
as the source of truth.

**Acceptance Scenarios**:

1. **Given** the baseline specification, **When** a reviewer checks any
   requirement, **Then** the reviewer can find a corresponding evidence
   reference in the brownfield research documents.
2. **Given** an unclear area in the current application, **When** the
   specification documents it, **Then** it is marked as `Needs confirmation`
   instead of being resolved through speculation.

### Edge Cases

- What happens when an unauthenticated user attempts to access authenticated
  application areas?
- What happens when uploaded invoice or vehicle-document processing fails before
  reaching a ready or reviewable state?
- What happens when the system lacks sufficient indexed vehicle documentation to
  answer a user question?
- What happens when a user attempts to act on a missing record such as a
  deleted vehicle, invoice, maintenance item, or document?
- What happens when reminders are checked but no upcoming due-date events fall
  within the current notification window?
- Needs confirmation: whether core business data such as vehicles, maintenance,
  parts, suppliers, invoices, tracks, and track records are intentionally shared
  across all authenticated users or merely lack explicit user scoping in the
  current implementation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The baseline specification MUST describe the current authenticated
  access model, including credential-based access, Google-based access, and
  protected application areas already present in the system.
  Evidence: `docs/codebase-research.md`, `docs/feature-inventory.md`,
  `docs/api-inventory.md`.
- **FR-002**: The baseline specification MUST describe the current user profile
  and personal settings behavior, including profile reading, profile updates,
  password change, and per-user settings management already evidenced in the
  research documents.
  Evidence: `docs/feature-inventory.md`, `docs/domain-inventory.md`,
  `docs/api-inventory.md`.
- **FR-003**: The baseline specification MUST describe the current dashboard
  behavior as an existing summary surface for vehicles, maintenance spend,
  suppliers, recent activity, and track or circuit activity.
  Evidence: `docs/codebase-research.md`, `docs/feature-inventory.md`,
  `docs/api-inventory.md`.
- **FR-004**: The baseline specification MUST describe the current vehicle
  management behavior, including vehicle records, technical specifications,
  torque specifications, stored images, and the existing denormalized vehicle
  detail view.
  Evidence: `docs/feature-inventory.md`, `docs/domain-inventory.md`,
  `docs/data-model-inventory.md`, `docs/api-inventory.md`.
- **FR-005**: The baseline specification MUST describe the current maintenance,
  parts, and supplier management behavior as existing related record-management
  areas.
  Evidence: `docs/codebase-research.md`, `docs/feature-inventory.md`,
  `docs/domain-inventory.md`, `docs/data-model-inventory.md`,
  `docs/api-inventory.md`.
- **FR-006**: The baseline specification MUST describe the current invoice
  workflow, including upload, processing states, extracted-data review, manual
  correction, approval, retry, rejection for reprocessing, and deletion.
  Evidence: `docs/codebase-research.md`, `docs/feature-inventory.md`,
  `docs/domain-inventory.md`, `docs/api-inventory.md`,
  `docs/data-model-inventory.md`, `docs/test-inventory.md`.
- **FR-007**: The baseline specification MUST describe the current track,
  circuit, organizer, and per-vehicle track-record behavior, including the
  coexistence of normalized tracks and legacy circuit-name reporting.
  Evidence: `docs/feature-inventory.md`, `docs/domain-inventory.md`,
  `docs/api-inventory.md`, `docs/data-model-inventory.md`.
- **FR-008**: The baseline specification MUST describe the current notification
  behavior, including user notification lists, read-state changes, and on-demand
  reminder generation for documented due-date categories.
  Evidence: `docs/codebase-research.md`, `docs/feature-inventory.md`,
  `docs/domain-inventory.md`, `docs/api-inventory.md`,
  `docs/data-model-inventory.md`.
- **FR-009**: The baseline specification MUST describe the current vehicle
  document behavior, including document upload, indexing lifecycle, derived
  knowledge facts, reindexing, deletion, and document-assisted question asking.
  Evidence: `docs/codebase-research.md`, `docs/feature-inventory.md`,
  `docs/domain-inventory.md`, `docs/api-inventory.md`,
  `docs/data-model-inventory.md`, `docs/test-inventory.md`.
- **FR-010**: The baseline specification MUST describe the current background
  and asynchronous flows that are already part of the system boundary, including
  invoice processing, vehicle-document processing, invoice status polling, and
  application update checks.
  Evidence: `docs/codebase-research.md`, `docs/feature-inventory.md`,
  `docs/api-inventory.md`.
- **FR-011**: The baseline specification MUST identify the current persistence
  entities that participate in the documented behaviors and distinguish stored
  business records from derived or supporting records such as settings,
  notifications, document chunks, and knowledge facts.
  Evidence: `docs/domain-inventory.md`, `docs/data-model-inventory.md`.
- **FR-012**: The baseline specification MUST identify the current external
  dependencies that materially affect observed behavior, including identity,
  multimodal extraction, embedded document retrieval, local media storage, and
  progressive web application behavior.
  Evidence: `docs/codebase-research.md`, `docs/feature-inventory.md`.
- **FR-013**: The baseline specification MUST document current uncertainties as
  `Needs confirmation` where the research artifacts show ambiguity, and MUST NOT
  replace uncertainty with speculative behavior.
  Evidence: `docs/codebase-research.md`, `docs/feature-inventory.md`,
  `docs/test-inventory.md`.
- **FR-014**: The baseline specification MUST treat undocumented future changes,
  proposed enhancements, new architectures, and inferred-but-unproven behavior
  as out of scope.
  Evidence: `docs/codebase-research.md`, `docs/feature-inventory.md`.

### Key Entities *(include if feature involves data)*

- **User**: An authenticated person who accesses the current application,
  maintains profile information, and owns personal settings.
- **Settings**: Per-user preferences and API-key related configuration used by
  current profile, notification, and AI-assisted flows.
- **Vehicle**: The central owned asset record around which maintenance, invoices,
  track records, reminders, and vehicle documents are organized.
- **Vehicle Specification**: The current vehicle technical data set, including
  identification and torque-related information.
- **Maintenance Record**: A dated service or upkeep record linked to a vehicle
  and optionally to a supplier and parts.
- **Part**: A replaceable or purchased component that can be linked to
  maintenance, supplier, and invoice records.
- **Supplier**: A party associated with maintenance, parts, and invoices.
- **Invoice**: An uploaded financial document that progresses through a current
  extraction and review lifecycle.
- **Track / Circuit / Track Record**: The current performance-record domain for
  storing vehicle sessions, normalized tracks, and legacy circuit-name views.
- **Notification**: A per-user reminder or message record, including due-date
  reminders for existing vehicle events.
- **Vehicle Document**: A stored vehicle-related document that can be indexed and
  used for question answering.
- **Vehicle Document Chunk**: A stored retrieval fragment derived from an indexed
  vehicle document.
- **Vehicle Knowledge Fact**: A derived knowledge item associated with a vehicle
  and optionally with a vehicle document.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of functional requirements in this baseline specification
  include an explicit evidence reference to at least one of the named research
  documents.
- **SC-002**: The specification covers all functional areas listed in
  `docs/feature-inventory.md` without introducing any undocumented feature area.
- **SC-003**: A reviewer can trace each primary actor journey in this
  specification to current behavior already captured in the brownfield research
  documents.
- **SC-004**: All known ambiguities retained in the specification are marked as
  `Needs confirmation`, and no unresolved placeholder clarification markers
  remain.

## Out of Scope

- Proposing enhancements, redesigns, migrations, or net-new capabilities
- Rewriting current behavior to match preferred future architecture
- Defining implementation tasks, engineering estimates, or rollout plans
- Resolving ambiguous ownership, tenancy, or operational assumptions that are
  not proven by the research documents
- Adding acceptance criteria for behaviors not evidenced in the named source
  documents

## Compliance & Impact *(mandatory)*

### Spec Traceability

- Governing feature/spec path: `specs/000-current-system-baseline/spec.md`
- In-scope user stories/requirements:
  - US1 with FR-001 through FR-005
  - US2 with FR-006 and FR-010
  - US3 with FR-009, FR-010, and FR-012
  - US4 with FR-011 through FR-014
- Out-of-scope items explicitly excluded:
  - New product features
  - Future-state redesign decisions
  - Unverified behavior beyond the research artifacts

### Architectural Impact

- Affected modules and boundaries:
  - This specification describes current backend API, service, model, and
    frontend feature areas as a baseline inventory only.
  - No application code change is requested by this specification.
- Required small, testable units:
  - None newly introduced by this specification artifact.
- Planned exceptions:
  - None.

### Verification Plan

- Tests to add or update for changed behavior:
  - None. This baseline specification documents the current system and does not
    change application behavior.
- Lint/type-check commands for touched application code:
  - None required because no application code is in scope for this specification
    artifact.
- Additional manual validation:
  - Cross-check each functional requirement against the named research docs.
  - Confirm the spec name, directory, and checklist paths are consistent.

### Security, Observability & Data Handling

- Input validation boundaries:
  - This specification records only current validated system boundaries already
    described in the research docs; it introduces no new inputs.
- Authentication/authorization impact:
  - No behavior change. The specification documents the current authentication
    model and existing authorization uncertainties.
- Secrets/internal URL handling:
  - No new secrets or internal URLs are introduced by this specification.
- Observability impact:
  - No runtime observability change. The specification records the current
    request ID, logging, and error-handling behaviors described in the research
    set.

## Assumptions

- The six named research documents are the authoritative source for this
  baseline specification.
- The current system boundary includes both end-user product behavior and the
  operator-facing scripts explicitly identified in the research artifacts.
- Where the research docs identify uncertainty, the baseline spec preserves that
  uncertainty as `Needs confirmation` instead of resolving it through inference.
- Because this is an as-is baseline, the success criteria measure coverage and
  traceability of current behavior rather than delivery of new runtime behavior.
