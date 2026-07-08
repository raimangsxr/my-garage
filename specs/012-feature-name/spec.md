# Feature Specification: Feature Name

**Feature Branch**: `[012-feature-name]`

**Created**: 2026-05-19

**Status**: Baseline

**Input**: User description: "Create an as-is brownfield specification for: [FEATURE NAME]. Use these sources: docs/codebase-research.md, docs/feature-inventory.md, docs/api-inventory.md, docs/data-model-inventory.md, docs/test-inventory.md. This spec documents existing behavior only. Do not introduce new requirements. Do not write code. Every functional requirement must be traceable to code, tests, routes, schema or configuration. Use 'Needs confirmation' where behavior is ambiguous. Include actors, current user journeys, functional requirements, acceptance criteria, edge cases, permissions, data involved, external integrations, existing tests, known gaps, and out of scope."

## Actors

- **Authenticated User**: Uses the current application areas for dashboard,
  vehicles, maintenance, parts, suppliers, invoices, tracks, notifications,
  profile, settings, and vehicle-document workflows.
- **End User Using Google Sign-In**: Enters the same authenticated experience
  through the current Google credential login path.
- **Operator / Maintainer**: Uses the existing runtime scripts and baseline
  documentation to inspect or support the current system behavior.

## Clarifications

### Session 2026-05-19

- Q: How should business-record ownership be documented for vehicles, maintenance, parts, suppliers, invoices, tracks, and track records? → A: The system currently lacks proven ownership scoping for those business entities; shared visibility is observed but not confirmed as intended.
- Q: How should the vehicle `proxy-image` behavior be documented? → A: `proxy-image` currently fetches external URLs server-side, but its allowed-source trust model is not confirmed.
- Q: How should due-date notification generation be documented? → A: Due-date notifications are generated only when the current on-demand check endpoint is invoked.
- Q: How should Wikipedia-based track enrichment be documented? → A: Wikipedia enrichment exists only as a manual maintenance script and is not part of the runtime user-facing behavior.
- Q: How should invoice documents participate in vehicle chat? → A: Invoice documents are included in vehicle chat only when explicitly requested by the current chat payload or UI choice.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Access Authenticated Garage Functions (Priority: P1)

An authenticated user signs in and navigates the current protected application
areas to read and manage the garage records already supported by the system.

**Why this priority**: Authenticated access is the entry point for nearly every
documented product capability.

**Independent Test**: Can be fully tested by authenticating through one of the
documented login paths and confirming access to the current protected routes and
their existing CRUD or summary behaviors.

**Acceptance Scenarios**:

1. **Given** a valid authenticated user, **When** the user enters the
   application, **Then** the user can access the current routes for dashboard,
   vehicles, maintenance, parts, suppliers, tracks, notifications, profile, and
   settings.
2. **Given** an unauthenticated visitor, **When** the visitor requests a
   protected route or endpoint, **Then** access remains blocked until the
   current authentication flow succeeds.

---

### User Story 2 - Manage Core Garage Records (Priority: P1)

An authenticated user uses the current record-management flows to maintain
vehicles, maintenance entries, parts, suppliers, and track-related records.

**Why this priority**: These are the core state-changing business workflows
evidenced across the current UI routes, APIs, and persisted entities.

**Independent Test**: Can be fully tested by exercising the documented list,
read, create, update, delete, search, and sort behaviors for the supported
record types.

**Acceptance Scenarios**:

1. **Given** an authenticated user on a current management area, **When** the
   user performs the supported create, read, update, or delete action,
   **Then** the system applies the documented outcome for that record type.
2. **Given** a list surface that supports pagination, search, or sorting,
   **When** the user applies those controls, **Then** the system returns the
   currently documented filtered or ordered results.

---

### User Story 3 - Process Invoice And Vehicle Documents (Priority: P1)

An authenticated user uploads invoice files or vehicle documents and interacts
with the current background processing, review, derived knowledge, and
question-answering flows already present in the system.

**Why this priority**: These are the most behaviorally dense current workflows
and they rely on background processing, state transitions, and external
integrations.

**Independent Test**: Can be fully tested by uploading a supported file,
observing the documented lifecycle states, and verifying the available review,
approval, retry, reindex, or question-answering actions.

**Acceptance Scenarios**:

1. **Given** an authenticated user uploading an invoice, **When** the upload is
   accepted, **Then** the invoice follows the current documented processing
   lifecycle and exposes the existing review or resolution actions.
2. **Given** an authenticated user uploading a vehicle document, **When** the
   document is processed successfully, **Then** the document becomes available
   in the current document, knowledge, and vehicle-chat flows.

---

### User Story 4 - Review Operational State And Reminders (Priority: P2)

An authenticated user reviews the current dashboard summaries and notification
surfaces to understand vehicle-related activity, spend, and due-date reminders.

**Why this priority**: These are important existing read and reminder flows,
but they depend on the underlying domain records already described in the higher
priority stories.

**Independent Test**: Can be fully tested by reading the current dashboard
summary output, listing notifications, and triggering the due-date reminder
check.

**Acceptance Scenarios**:

1. **Given** current maintenance, supplier, vehicle, and track data,
   **When** the user opens the dashboard, **Then** the system returns the
   documented summary counts, spend values, and recent activity views.
2. **Given** a signed-in user with vehicles that have upcoming due dates,
   **When** the user triggers the reminder check, **Then** the system creates or
   suppresses notifications according to the current documented behavior.

## Edge Cases

- Unauthenticated requests to protected UI routes or API endpoints are blocked
  by the current access controls.
- Invoice extraction can fail before review, leaving the invoice in the current
  failure state with retry behavior.
- Vehicle-document indexing can fail, or stop cleanly if the source document is
  deleted mid-process.
- Reminder checks can return no new notifications when no due dates fall inside
  the current 30-day window.
- Due-date notifications are generated only when the current on-demand check is
  invoked; no automatic scheduler is evidenced in the inspected sources.
- Voice-assisted vehicle-chat interactions can encounter permission-denied or
  no-audio states with the current retry or fallback UI behavior.
- Business entities such as vehicles, maintenance, parts, suppliers, invoices,
  tracks, and track records currently show shared visibility in observed routes
  and queries, but intended ownership scoping is `Needs confirmation`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide the currently documented authentication
  and protected-access model, including email/password login, Google credential
  login, and gated access to authenticated routes and endpoints.
  Traceability: routes in `docs/api-inventory.md` Authentication and Frontend
  route inventory; auth behavior in `docs/codebase-research.md`
  Authentication and authorization; feature evidence in
  `docs/feature-inventory.md` section 1.
- **FR-002**: The system MUST provide the currently documented profile and
  settings behaviors, including reading the current user profile, updating full
  name, updating profile image, changing password, and reading or updating
  per-user settings.
  Traceability: routes in `docs/api-inventory.md` User and Settings; schema in
  `docs/data-model-inventory.md` User and Settings; feature evidence in
  `docs/feature-inventory.md` section 2.
- **FR-003**: The system MUST expose the current dashboard summary behavior for
  total vehicles, scheduled maintenance, maintenance spend, recent activity,
  monthly spend, supplier totals, and track or circuit summary metrics.
  Traceability: route `GET /api/v1/dashboard/stats` in `docs/api-inventory.md`;
  feature evidence in `docs/feature-inventory.md` section 3; behavior summary
  in `docs/codebase-research.md` and `docs/codebase-research.md`.
- **FR-004**: The system MUST support the current vehicle-management behavior,
  including list, create, update, delete, image upload or retrieval,
  denormalized vehicle details, torque-spec updates, and reminder-related
  vehicle date and amount fields.
  Traceability: routes in `docs/api-inventory.md` Vehicles; schema in
  `docs/data-model-inventory.md` Vehicle and VehicleSpecs; feature evidence in
  `docs/feature-inventory.md` section 4.
- **FR-005**: The system MUST support the current maintenance, part, supplier,
  track, circuit, organizer, and per-vehicle track-record workflows already
  evidenced in the source inventories, including their documented list and
  relationship behaviors.
  Traceability: routes in `docs/api-inventory.md` Maintenance, Parts,
  Suppliers, Track records, Tracks and circuits; schema in
  `docs/data-model-inventory.md` Maintenance, Part, Supplier, Track, and
  TrackRecord; feature evidence in `docs/feature-inventory.md` sections 5, 6,
  7, and 9.
- **FR-006**: The system MUST support the current invoice workflow, including
  file upload, background extraction, review-state editing, approval, retry,
  rejection for reprocessing, deletion, and the documented lifecycle states
  `pending`, `processing`, `review`, `approved`, and `failed`.
  Traceability: routes in `docs/api-inventory.md` Invoices; schema in
  `docs/data-model-inventory.md` Invoice; feature evidence in
  `docs/feature-inventory.md` section 8; test evidence in
  `docs/test-inventory.md` invoice and storage sections.
- **FR-007**: The system MUST support the current vehicle-document workflow,
  including document upload, indexing status, document editing, deletion,
  reindexing, derived knowledge facts, and question-answering over indexed
  materials with the documented source-scope behavior, including optional
  invoice-document participation only when explicitly requested by the current
  chat payload or UI choice.
  Traceability: routes in `docs/api-inventory.md` Vehicle document AI / RAG;
  schema in `docs/data-model-inventory.md` VehicleDocument,
  VehicleDocumentChunk, and VehicleKnowledgeFact; feature evidence in
  `docs/feature-inventory.md` section 11; test evidence in
  `docs/test-inventory.md` vehicle-document sections.
- **FR-008**: The system MUST support the current notification workflow,
  including per-user notification listing, read or unread changes, and on-demand
  due-date reminder generation for ITV, insurance, and road-tax events.
  Traceability: routes in `docs/api-inventory.md` Notifications; schema in
  `docs/data-model-inventory.md` Notification and Vehicle; feature evidence in
  `docs/feature-inventory.md` section 10.
- **FR-009**: The system MUST preserve the currently documented background and
  asynchronous operating model for invoice processing, vehicle-document
  processing, invoice polling, and periodic PWA update checks.
  Traceability: behavior summary in `docs/codebase-research.md` Background
  processes and async flows; feature evidence in `docs/feature-inventory.md`
  sections 8, 11, and 12.
- **FR-010**: The system MUST treat ambiguous ownership, trust, and automation
  boundaries as `Needs confirmation` rather than asserting behavior not proven
  by routes, schema, configuration, code research, or tests.
  Traceability: ambiguity notes in `docs/codebase-research.md`,
  `docs/feature-inventory.md`, `docs/data-model-inventory.md`, and
  `docs/test-inventory.md`.

### Key Entities *(include if feature involves data)*

- **User**: Authenticated account used for login, protected access, profile
  management, and notification ownership.
- **Settings**: Per-user preferences and external-key configuration stored for
  the current settings flow.
- **Vehicle**: Central garage asset linked to maintenance, invoices, track
  records, reminders, and vehicle documents.
- **VehicleSpecs**: Vehicle technical and torque-related information attached to
  a single vehicle.
- **Maintenance**: Dated vehicle service record linked to a vehicle and
  optionally to a supplier and parts.
- **Part**: Component record that can be linked to maintenance, supplier, and
  invoice records.
- **Supplier**: Supplier record linked to maintenance, parts, and invoices.
- **Invoice**: Uploaded financial document with extracted data and lifecycle
  status.
- **Notification**: Per-user reminder or informational item tied to current
  reminder flows.
- **Track** and **TrackRecord**: Normalized track catalog and per-vehicle track
  performance records, including legacy circuit-name compatibility.
- **VehicleDocument**, **VehicleDocumentChunk**, and
  **VehicleKnowledgeFact**: Uploaded vehicle documentation, derived retrieval
  fragments, and stored knowledge facts used by the current vehicle-chat flow.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of functional requirements in this specification include
  traceability back to at least one of the required source inventories.
- **SC-002**: The specification covers all currently evidenced user-facing
  feature areas referenced in the supplied source documents without describing
  new behavior.
- **SC-003**: Every primary user journey in this specification can be matched to
  an existing route, endpoint, data entity, or documented processing flow in
  the supplied source documents.
- **SC-004**: All ambiguous areas identified in the source documents remain
  labeled `Needs confirmation` instead of being resolved through assumptions.

## Permissions

- Authenticated access is required for most business routes and endpoints.
- Profile, settings, and notifications are explicitly scoped to the current
  user.
- Business entities such as vehicles, maintenance, parts, suppliers, invoices,
  tracks, and track records currently lack proven ownership scoping in the
  observed code and inventories; shared visibility is observed, but whether
  that is intentional remains `Needs confirmation`.
- Google sign-in is an alternate authentication path, not a separate permission
  model.

## Data Involved

- Account data: `User`, `Settings`, `GoogleAuthToken`
- Garage domain data: `Vehicle`, `VehicleSpecs`, `Maintenance`, `Part`,
  `Supplier`, `Invoice`
- Activity and reminder data: `Notification`, `Track`, `TrackRecord`
- Document knowledge data: `VehicleDocument`, `VehicleDocumentChunk`,
  `VehicleKnowledgeFact`
- Optional vehicle-chat source data: invoice documents when explicitly included
  by the current vehicle-chat request
- Stored file media: invoice files and vehicle-document files kept in local
  media storage, plus vehicle and user images stored as binary data

## External Integrations

- Google credential verification for Google sign-in
- Google Gemini for invoice extraction and vehicle-document knowledge or answer
  generation
- pgvector-backed embedding storage for vehicle-document retrieval
- Local filesystem media storage for invoices and vehicle documents
- Server-side external URL fetching through the vehicle `proxy-image` endpoint,
  with allowed-source trust boundaries `Needs confirmation`
- Browser service-worker support for current PWA install, offline, and update
  behaviors
- Wikipedia summary fetching exists as a manual track-enrichment script and is
  not part of the documented runtime user-facing behavior

## Existing Tests

- `backend/test_api_helpers.py`: provides isolated API-test helpers for
  current endpoint characterization across authenticated backend routes
- `backend/test_auth_endpoints.py`: verifies current credential login, Google
  login, protected-route denial, and password-recovery placeholder behavior
- `backend/test_identity_profile_settings.py`: verifies current profile read or
  update, password change, and settings auto-create or update behavior
- `backend/test_notification_endpoints.py`: verifies current notification list,
  read or unread, and on-demand due-date generation behavior
- `backend/test_storage_service.py`: verifies current invoice-file save and path
  resolution behavior
- `backend/test_invoice_processing.py`: verifies current invoice extraction
  orchestration and Gemini payload fallback behavior
- `backend/test_vehicle_document_rag_service.py`: verifies current document
  question-answering fallback, citation mapping, knowledge extraction fallback,
  and deletion-during-processing behavior
- `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.spec.ts`:
  verifies current vehicle-chat error and retry UI behaviors
- `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai-voice.util.spec.ts`:
  verifies current wake-phrase, transcript, language, and voice-selection logic
- `frontend/src/app/core/guards/auth.guard.spec.ts`,
  `frontend/src/app/core/guards/public-only.guard.spec.ts`, and
  `frontend/src/app/core/interceptors/auth.interceptor.spec.ts`: verify current
  route-protection and token-attachment behavior
- No broad backend endpoint, end-to-end browser, dashboard, notification,
  maintenance, vehicle CRUD, supplier, or parts test suites were evidenced in
  the supplied test inventory

## Known Gaps

- Password recovery exists as a placeholder response rather than a complete
  recovery flow.
- Many business tables do not show explicit `user_id` ownership or filtering.
- Shared visibility of core business records is observable, but intended
  ownership rules are not proven by the inspected code or inventories.
- The vehicle `proxy-image` endpoint currently performs server-side external URL
  fetching, but its allowed-source trust boundary is `Needs confirmation`.
- Invoice approval and deletion logic contains assumption-heavy cleanup rules.
- Vehicle-document retrieval quality depends on external model and embedding
  behavior.
- Notification generation is on-demand through the current check endpoint; no
  scheduler or automatic trigger was evidenced.
- Broad automated coverage is limited outside invoice processing and
  vehicle-document AI areas.
- Backend endpoint characterization now exists for auth, profile/settings, and
  notifications, but broader CRUD and aggregate endpoint coverage is still
  incomplete.
- Wikipedia-based track enrichment is present only as a manual support script,
  not as a runtime application integration.
- Invoice documents participate in vehicle chat only when explicitly included by
  the current request; no evidence supports always-on inclusion.
- Frontend test-runner migration state and CI execution coverage are
  `Needs confirmation`.

## Out of Scope

- New feature behavior not evidenced in the supplied research documents
- Proposed security, tenancy, scheduler, or architecture changes
- New integrations, UI redesigns, or performance targets not already documented
- Implementation planning, task breakdown, or code changes
- Resolving ambiguous current behavior beyond labeling it `Needs confirmation`

## Compliance & Impact *(mandatory)*

### Spec Traceability

- Governing feature/spec path: `specs/012-feature-name/spec.md`
- In-scope user stories/requirements:
  - User Story 1 with FR-001 and FR-002
  - User Story 2 with FR-004 and FR-005
  - User Story 3 with FR-006, FR-007, and FR-009
  - User Story 4 with FR-003, FR-008, and FR-010
- Out-of-scope items explicitly excluded:
  - Any feature or permission model not evidenced by the supplied inventories
  - New requirements, implementation changes, or remediation work

### Architectural Impact

- Affected modules and boundaries:
  - This is a documentation artifact only. It describes the currently observed
    backend API surfaces, frontend routes, data entities, and background flows.
- Required small, testable units:
  - None newly introduced.
- Planned exceptions:
  - None.

### Verification Plan

- Tests to add or update for changed behavior:
  - None. No application behavior is changed.
- Lint/type-check commands for touched application code:
  - None required because no application code is touched.
- Additional manual validation:
  - Confirm each requirement, actor, and journey maps to the required source
    documents and no undocumented behavior was introduced.

### Security, Observability & Data Handling

- Input validation boundaries:
  - Validation is documented only at the current API and upload boundaries
    evidenced by the source inventories.
- Authentication/authorization impact:
  - This spec records the current access model and explicitly preserves
    unresolved ownership ambiguities.
- Secrets/internal URL handling:
  - No secrets or internal URLs are added by this specification artifact.
- Observability impact:
  - No new logging, metrics, or alerting behavior is introduced by this
    specification artifact.

## Assumptions

- The literal request `[FEATURE NAME]` does not identify a single existing
  feature boundary in the supplied inventories, so this document captures the
  current whole-system baseline evidenced by those sources.
- Only behaviors present in the supplied research documents are in scope for
  this specification.
- Where the inventories identify ambiguity, preserving `Needs confirmation` is
  more accurate than inferring product intent.
- Business-record ownership should be described as lacking proven scoping in
  current evidence rather than as intentionally shared by design.
