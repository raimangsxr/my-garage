# Feature Specification: Invoices AI Processing And Approval

**Feature Branch**: `[007-invoices-ai-processing-and-approval]`

**Created**: 2026-05-19

**Status**: Baseline

**Input**: User description: "Create the individual brownfield specs proposed in docs/spec-decomposition.md using the baseline specification and research docs as source of truth."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Upload And Track Invoice Processing (Priority: P1)

An authenticated user uploads an invoice and tracks its current processing
lifecycle until it reaches a reviewable or failed state.

**Why this priority**: Upload and lifecycle state progression are the entry
point to the entire invoice domain.

**Independent Test**: Can be fully tested by uploading an invoice, observing
state transitions, and verifying the current polling or status behavior.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** the user uploads an invoice file,
   **Then** the system stores it under the current invoice media path and starts
   the documented background extraction workflow.
2. **Given** an uploaded invoice in `pending` or `processing`, **When** the
   frontend tracks status, **Then** the current polling behavior continues until
   the invoice reaches a documented terminal or review state.

---

### User Story 2 - Review And Edit Extracted Data (Priority: P1)

An authenticated user reviews extracted invoice data and edits it before making
workflow decisions.

**Why this priority**: Review is the core user-controlled step between AI
extraction and business-record side effects.

**Independent Test**: Can be fully tested by reading extracted data for an
invoice in review state and submitting updates through the current API.

**Acceptance Scenarios**:

1. **Given** an invoice in `review`, **When** the user requests extracted data,
   **Then** the system returns the current extracted-data payload.
2. **Given** an invoice in review, **When** the user updates extracted data,
   **Then** the system persists the edited current review payload.

---

### User Story 3 - Approve, Retry, Reject, Or Delete An Invoice (Priority: P1)

An authenticated user completes the current invoice lifecycle by approving,
retrying, rejecting for detailed reprocessing, or deleting the invoice.

**Why this priority**: These workflow actions define the existing operational
outcomes of invoice processing.

**Independent Test**: Can be fully tested by invoking the current action
endpoints on invoices in applicable states and checking the documented
side effects.

**Acceptance Scenarios**:

1. **Given** an invoice ready for operator action, **When** the user approves
   it, **Then** the system performs the current approval behavior that creates
   related supplier, maintenance, and part records.
2. **Given** an invoice that failed or requires more processing, **When** the
   user retries or rejects it, **Then** the system executes the current retry or
   detailed reprocessing behavior.
3. **Given** an existing invoice, **When** the user deletes it, **Then** the
   system applies the current deletion and cleanup behavior, including
   documented approved-invoice cleanup paths.

### Edge Cases

- What happens when invoice extraction fails before reaching review?
- What happens when extracted data is requested before an invoice becomes
  reviewable?
- Needs confirmation: approval and deletion assumptions tied to
  maintenance-to-invoice relationships.
- Needs confirmation: real-world extraction quality and failure envelope of the
  external Gemini dependency.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow authenticated users to list invoices with
  the current filtering and sorting behavior and to read individual invoice
  details.
  Evidence: `docs/feature-inventory.md` section 8,
  `docs/api-inventory.md`,
  `specs/000-current-system-baseline/spec.md` FR-006.
- **FR-002**: The system MUST allow invoice file upload through
  `POST /api/v1/invoices/upload`, store files under `media/invoices`, and start
  the documented background extraction flow.
  Evidence: `docs/feature-inventory.md` section 8,
  `docs/codebase-research.md`,
  `docs/data-model-inventory.md`.
- **FR-003**: Invoices MUST progress through the currently documented lifecycle
  states: `pending`, `processing`, `review`, `approved`, and `failed`.
  Evidence: `docs/feature-inventory.md` section 8,
  `docs/domain-inventory.md`,
  `specs/000-current-system-baseline/spec.md` FR-006.
- **FR-004**: The system MUST expose the current extracted-data review behavior
  through `GET /api/v1/invoices/{id}/extracted-data` and
  `PUT /api/v1/invoices/{id}/extracted-data`.
  Evidence: `docs/feature-inventory.md` section 8,
  `docs/api-inventory.md`,
  `specs/000-current-system-baseline/spec.md` FR-006.
- **FR-005**: The system MUST allow users to reject invoices for detailed
  reprocessing, retry failed processing, and approve invoices through the
  current workflow endpoints.
  Evidence: `docs/feature-inventory.md` section 8,
  `docs/api-inventory.md`,
  `specs/000-current-system-baseline/spec.md` FR-006 and FR-010.
- **FR-006**: Invoice approval MUST perform the current documented creation of
  related supplier, maintenance, and part records.
  Evidence: `docs/feature-inventory.md` section 8,
  `docs/data-model-inventory.md`,
  `specs/000-current-system-baseline/spec.md` FR-006.
- **FR-007**: The system MUST allow invoice deletion and apply the current
  cleanup behavior for stored invoice artifacts and approved-invoice
  associations.
  Evidence: `docs/feature-inventory.md` section 8,
  `docs/codebase-research.md`,
  `docs/data-model-inventory.md`.
- **FR-008**: The frontend MUST poll invoice status every 2 seconds while an
  invoice remains in the current `pending` or `processing` states.
  Evidence: `docs/feature-inventory.md` section 8,
  `docs/api-inventory.md`,
  `specs/000-current-system-baseline/spec.md` FR-010.
- **FR-009**: The spec MUST preserve current approval/deletion assumptions and
  external Gemini dependency limits as `Needs confirmation`.
  Evidence: `docs/feature-inventory.md` section 8,
  `docs/test-inventory.md`,
  `specs/000-current-system-baseline/spec.md` FR-013.

### Key Entities *(include if feature involves data)*

- **Invoice**: The uploaded financial document that moves through the current
  extraction and review lifecycle.
- **Supplier**: A related record that may be created or linked during approval.
- **Maintenance**: A related record that may be created during invoice
  approval.
- **Part**: A related record that may be created or linked during invoice
  approval.
- **Vehicle**: The vehicle context associated with invoice records.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The spec covers upload, lifecycle state transitions, review, and
  all currently documented invoice action endpoints.
- **SC-002**: Asynchronous processing and polling behavior are represented by at
  least one requirement.
- **SC-003**: External-AI and approval-assumption ambiguities remain marked as
  `Needs confirmation`.

## Compliance & Impact *(mandatory)*

### Spec Traceability

- Governing feature/spec path: `specs/007-invoices-ai-processing-and-approval/spec.md`
- In-scope user stories/requirements: US1 with FR-001 through FR-003 and
  FR-008, US2 with FR-004, US3 with FR-005 through FR-007 and FR-009
- Out-of-scope items explicitly excluded:
  - Generic vehicle-document AI chat
  - Maintenance CRUD unrelated to invoice approval side effects
  - Track and dashboard behavior

### Architectural Impact

- Affected modules and boundaries:
  - Backend invoice endpoints, invoice services, storage, and frontend invoice
    features as documented in research only.
- Required small, testable units:
  - None newly introduced by this baseline artifact.
- Planned exceptions:
  - None.

### Verification Plan

- Tests to add or update for changed behavior:
  - None. Existing cited tests remain evidence only because this is a
    documentation spec.
- Lint/type-check commands for touched application code:
  - None required because no application code is changed.
- Additional manual validation:
  - Confirm state names, media path, and workflow endpoints against the
    research docs.

### Security, Observability & Data Handling

- Input validation boundaries:
  - Existing invoice upload and review validation remains at the current API
    boundaries.
- Authentication/authorization impact:
  - Invoice routes remain part of the authenticated application surface.
- Secrets/internal URL handling:
  - The spec records the dependency on external Gemini configuration without
    introducing new secret handling.
- Observability impact:
  - No new observability behavior is introduced by this artifact.

## Assumptions

- Review and approval behavior is limited to what the research artifacts prove.
- Background extraction is part of the current runtime behavior because it is
  explicitly referenced in research.
- The cited invoice tests are evidence of existing behavior, not new required
  tests for this spec artifact.
