# Feature Specification: Operations Notifications Reminders

**Feature Branch**: `[009-operations-notifications-reminders]`

**Created**: 2026-05-19

**Status**: Baseline

**Input**: User description: "Create the individual brownfield specs proposed in docs/spec-decomposition.md using the baseline specification and research docs as source of truth."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Read And Manage Notification State (Priority: P1)

An authenticated user lists notifications and marks them read or unread using
the current notification-state behavior.

**Why this priority**: Notification reading and state changes are the main
user-facing interactions in this domain.

**Independent Test**: Can be fully tested by exercising the current
notification list, read, and unread endpoints.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** the user requests notifications,
   **Then** the system returns the current notification list scoped to that
   user.
2. **Given** an existing notification, **When** the user marks it read or
   unread, **Then** the system applies the current notification state-change
   behavior.

---

### User Story 2 - Trigger Due-Date Reminder Generation (Priority: P2)

An authenticated user triggers the current due-date reminder check and receives
new notifications for upcoming vehicle obligations when applicable.

**Why this priority**: Reminder generation is the domain behavior that creates
notification records from vehicle due dates.

**Independent Test**: Can be fully tested by calling the current reminder-check
endpoint with vehicle data that falls inside or outside the documented window.

**Acceptance Scenarios**:

1. **Given** vehicle due dates within the current reminder window, **When** the
   user triggers the due-date check, **Then** the system generates the current
   notification records for ITV, insurance, and road tax.
2. **Given** a due-date notification already exists for the same title on the
   same day, **When** the due-date check runs again, **Then** the current
   duplicate-suppression behavior prevents another notification.

### Edge Cases

- What happens when there are no due dates within the current reminder window?
- What happens when a notification marked read is later marked unread?
- Needs confirmation: whether reminder generation is ever triggered
  automatically outside the on-demand endpoint.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose the current user-scoped notification list
  through `GET /api/v1/notifications`.
  Evidence: `docs/feature-inventory.md` section 10,
  `docs/api-inventory.md`,
  `specs/000-current-system-baseline/spec.md` FR-008.
- **FR-002**: The system MUST allow users to mark notifications read through
  `PUT /api/v1/notifications/{id}/read`.
  Evidence: `docs/feature-inventory.md` section 10,
  `docs/api-inventory.md`,
  `docs/domain-inventory.md`.
- **FR-003**: The system MUST allow users to mark notifications unread through
  `PUT /api/v1/notifications/{id}/unread`.
  Evidence: `docs/feature-inventory.md` section 10,
  `docs/api-inventory.md`,
  `docs/domain-inventory.md`.
- **FR-004**: The system MUST expose `POST /api/v1/notifications/check` as the
  current on-demand due-date reminder generator.
  Evidence: `docs/feature-inventory.md` section 10,
  `docs/api-inventory.md`,
  `specs/000-current-system-baseline/spec.md` FR-008.
- **FR-005**: Due-date reminder generation MUST use the current 30-day window
  for ITV, insurance, and road tax dates stored on vehicle records.
  Evidence: `docs/feature-inventory.md` section 10,
  `docs/data-model-inventory.md`,
  `specs/000-current-system-baseline/spec.md` FR-008.
- **FR-006**: The system MUST suppress duplicate notifications for the same
  title on the same day during reminder generation.
  Evidence: `docs/feature-inventory.md` section 10,
  `docs/codebase-research.md`,
  `docs/domain-inventory.md`.
- **FR-007**: The spec MUST preserve the absence of an evidenced scheduler or
  automatic trigger strategy as `Needs confirmation`.
  Evidence: `docs/feature-inventory.md` section 10,
  `docs/codebase-research.md`,
  `specs/000-current-system-baseline/spec.md` FR-013.

### Key Entities *(include if feature involves data)*

- **Notification**: A current per-user message or reminder record with read
  state.
- **Vehicle**: The source of due-date fields used by reminder generation.
- **User**: The notification owner for the current list behavior.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The spec covers both notification state management and on-demand
  reminder generation.
- **SC-002**: Reminder window and duplicate-suppression rules are each
  represented by at least one requirement.
- **SC-003**: Scheduler ambiguity remains marked as `Needs confirmation`.

## Compliance & Impact *(mandatory)*

### Spec Traceability

- Governing feature/spec path: `specs/009-operations-notifications-reminders/spec.md`
- In-scope user stories/requirements: US1 with FR-001 through FR-003, US2 with
  FR-004 through FR-007
- Out-of-scope items explicitly excluded:
  - Settings preference capture beyond existing stored settings
  - Background scheduling not evidenced in code
  - Generic PWA or browser notifications behavior

### Architectural Impact

- Affected modules and boundaries:
  - Backend notifications endpoint and model plus frontend notifications feature
    as documented in research only.
- Required small, testable units:
  - None newly introduced by this baseline artifact.
- Planned exceptions:
  - None.

### Verification Plan

- Tests to add or update for changed behavior:
  - None. This is a brownfield documentation spec only.
- Lint/type-check commands for touched application code:
  - None required because no application code is changed.
- Additional manual validation:
  - Confirm reminder categories and window size against the research docs.

### Security, Observability & Data Handling

- Input validation boundaries:
  - Existing notification state-change and reminder-check validation remains at
  the current API boundaries.
- Authentication/authorization impact:
  - Notifications are current-user scoped according to the research docs.
- Secrets/internal URL handling:
  - None introduced.
- Observability impact:
  - No new observability behavior is introduced by this artifact.

## Assumptions

- Due-date reminder generation is specified separately from vehicle storage even
  though the source dates live on vehicle records.
- Notification list scoping to the current user is explicit in the research
  artifacts and therefore treated as established behavior.
- No automatic scheduler is asserted because none was evidenced in research.
