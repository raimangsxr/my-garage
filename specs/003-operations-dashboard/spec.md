# Feature Specification: Operations Dashboard

**Feature Branch**: `[003-operations-dashboard]`

**Created**: 2026-05-19

**Status**: Baseline

**Input**: User description: "Create the individual brownfield specs proposed in docs/spec-decomposition.md using the baseline specification and research docs as source of truth."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Current Operational Summary (Priority: P1)

An authenticated user opens the dashboard and sees the current read-only
summary metrics derived from existing records.

**Why this priority**: The dashboard is the main summary surface for current
garage operations.

**Independent Test**: Can be fully tested by requesting the dashboard route or
API and verifying that the documented aggregate fields are returned.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** the user opens `/dashboard`,
   **Then** the system displays the current summary values for vehicles,
   scheduled maintenance, total spend, recent maintenance, suppliers, and
   track/circuit metrics.
2. **Given** current maintenance records with dates and costs, **When** the
   dashboard summary is requested, **Then** the system derives the documented
   scheduled-maintenance and monthly-cost aggregates from current records.

### Edge Cases

- What happens when there are no vehicles, maintenance records, suppliers, or
  track records?
- What happens when historical maintenance data is sparse for the six-month
  trend view?
- Needs confirmation: whether any dashboard values are cached outside direct
  query-time aggregation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose the current dashboard summary through
  `/dashboard` and `GET /api/v1/dashboard/stats`.
  Evidence: `docs/feature-inventory.md` section 3,
  `docs/api-inventory.md`,
  `specs/000-current-system-baseline/spec.md` FR-003.
- **FR-002**: The dashboard MUST include the current total vehicle count.
  Evidence: `docs/feature-inventory.md` section 3,
  `specs/000-current-system-baseline/spec.md` FR-003.
- **FR-003**: The dashboard MUST include the current scheduled-maintenance
  count based on future-dated maintenance records.
  Evidence: `docs/feature-inventory.md` section 3,
  `docs/codebase-research.md`,
  `specs/000-current-system-baseline/spec.md` FR-003.
- **FR-004**: The dashboard MUST include current aggregated maintenance spend,
  recent maintenance activity, and the last six months of monthly maintenance
  cost totals.
  Evidence: `docs/feature-inventory.md` section 3,
  `docs/api-inventory.md`,
  `specs/000-current-system-baseline/spec.md` FR-003.
- **FR-005**: The dashboard MUST include current supplier totals and current
  track/circuit summary metrics.
  Evidence: `docs/feature-inventory.md` section 3,
  `docs/api-inventory.md`,
  `specs/000-current-system-baseline/spec.md` FR-003.
- **FR-006**: The dashboard MUST document the absence of a discovered cached
  reporting layer as `Needs confirmation` rather than assuming one exists.
  Evidence: `docs/feature-inventory.md` section 3,
  `docs/codebase-research.md`,
  `specs/000-current-system-baseline/spec.md` FR-013.

### Key Entities *(include if feature involves data)*

- **Vehicle**: Source of the dashboard vehicle totals.
- **Maintenance**: Source of scheduled counts, spend totals, recent activity,
  and monthly cost trends.
- **Supplier**: Source of dashboard supplier totals.
- **TrackRecord**: Source of current track/circuit summary metrics.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The spec covers only the current dashboard summary behavior and
  excludes CRUD behavior owned by other specs.
- **SC-002**: Every documented metric category on the dashboard has at least one
  corresponding requirement.
- **SC-003**: Any reporting-layer ambiguity remains marked as `Needs
  confirmation`.

## Compliance & Impact *(mandatory)*

### Spec Traceability

- Governing feature/spec path: `specs/003-operations-dashboard/spec.md`
- In-scope user stories/requirements: US1 with FR-001 through FR-006
- Out-of-scope items explicitly excluded:
  - Vehicle CRUD
  - Maintenance CRUD
  - Supplier CRUD
  - Track management beyond displayed summaries

### Architectural Impact

- Affected modules and boundaries:
  - Backend dashboard endpoint and frontend dashboard feature as documented in
    research only.
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
  - Confirm the dashboard metrics listed here match the research inventory.

### Security, Observability & Data Handling

- Input validation boundaries:
  - No new inputs are introduced by this artifact.
- Authentication/authorization impact:
  - Dashboard access remains part of the authenticated application surface.
- Secrets/internal URL handling:
  - None introduced.
- Observability impact:
  - No new logging or metrics behavior is introduced by this artifact.

## Assumptions

- The dashboard remains a read-only summary surface in the current system.
- Aggregates are based on current stored records because no separate reporting
  layer was evidenced in research.
- Track and circuit metrics are included only to the extent explicitly
  documented in the research artifacts.
