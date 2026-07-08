# Feature Specification: Vehicles Management And Specs

**Feature Branch**: `[004-vehicles-management-and-specs]`

**Created**: 2026-05-19

**Status**: Baseline

**Input**: User description: "Create the individual brownfield specs proposed in docs/spec-decomposition.md using the baseline specification and research docs as source of truth."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage Vehicle Records (Priority: P1)

An authenticated user lists, creates, updates, and deletes vehicles using the
current vehicle-management behavior.

**Why this priority**: Vehicles are the central business record for the current
application.

**Independent Test**: Can be fully tested by exercising the current vehicle
list and CRUD endpoints or UI routes.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** the user requests the vehicles
   list, **Then** the system returns the current vehicle list behavior.
2. **Given** an authenticated user, **When** the user creates, updates, or
   deletes a vehicle, **Then** the system applies the corresponding current
   vehicle CRUD behavior.

---

### User Story 2 - Manage Vehicle Images And Specs (Priority: P1)

An authenticated user manages vehicle images and technical specification data
through the current vehicle-detail capabilities.

**Why this priority**: Images and specs are core current subdomains of the
vehicle record.

**Independent Test**: Can be fully tested by uploading or retrieving a vehicle
image and by updating torque specs through the documented endpoint.

**Acceptance Scenarios**:

1. **Given** an authenticated user and an existing vehicle, **When** the user
   uploads an image, **Then** the system stores the current vehicle image data
   and allows it to be retrieved.
2. **Given** an authenticated user and an existing vehicle, **When** the user
   updates torque specifications, **Then** the system persists the current
   torque-spec update behavior.

---

### User Story 3 - Read Denormalized Vehicle Details (Priority: P2)

An authenticated user reads the current denormalized vehicle detail payload that
aggregates related records around a vehicle.

**Why this priority**: The vehicle detail response is a distinct existing
read-model that connects multiple adjacent domains.

**Independent Test**: Can be fully tested by calling
`GET /api/v1/vehicles/{id}/details` and confirming the currently documented
related record sections.

**Acceptance Scenarios**:

1. **Given** an authenticated user and an existing vehicle, **When** the user
   requests vehicle details, **Then** the system returns the current
   denormalized response including the related record categories evidenced in
   research.

### Edge Cases

- What happens when a vehicle image has not been uploaded?
- What happens when a requested vehicle record or details payload does not
  exist?
- Needs confirmation: whether vehicle records are intentionally shared across
  authenticated users.
- Needs confirmation: the intended trust model for server-side
  `proxy-image` fetching of arbitrary external URLs.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow authenticated users to list, create,
  update, and delete vehicles through the current vehicle routes and endpoints.
  Evidence: `docs/feature-inventory.md` section 4,
  `docs/api-inventory.md`,
  `specs/000-current-system-baseline/spec.md` FR-004.
- **FR-002**: The system MUST support vehicle image upload and retrieval through
  the current vehicle image endpoints.
  Evidence: `docs/feature-inventory.md` section 4,
  `docs/api-inventory.md`,
  `docs/data-model-inventory.md`.
- **FR-003**: The system MUST expose the current `GET /api/v1/vehicles/{id}/details`
  response as a denormalized vehicle detail payload that includes specs,
  maintenance, parts, invoices, and track records.
  Evidence: `docs/feature-inventory.md` section 4,
  `docs/data-model-inventory.md`,
  `specs/000-current-system-baseline/spec.md` FR-004.
- **FR-004**: The system MUST support independent torque-spec updates through
  `PUT /api/v1/vehicles/{id}/specs/torque`.
  Evidence: `docs/feature-inventory.md` section 4,
  `docs/api-inventory.md`,
  `docs/data-model-inventory.md`.
- **FR-005**: Vehicle records MUST retain the current due-date and amount fields
  used by notification-related vehicle reminders for ITV, insurance, and road
  tax.
  Evidence: `docs/feature-inventory.md` section 4,
  `docs/domain-inventory.md`,
  `specs/000-current-system-baseline/spec.md` FR-004.
- **FR-006**: The system MUST expose `GET /api/v1/vehicles/proxy-image` as part
  of current vehicle behavior while preserving the trust-model ambiguity as
  `Needs confirmation`.
  Evidence: `docs/feature-inventory.md` section 4,
  `docs/codebase-research.md`,
  `specs/000-current-system-baseline/spec.md` FR-013.
- **FR-007**: The spec MUST preserve the absence of visible per-user vehicle
  scoping as `Needs confirmation` rather than asserting tenancy behavior.
  Evidence: `docs/feature-inventory.md` section 4,
  `docs/codebase-research.md`,
  `specs/000-current-system-baseline/spec.md` FR-013.

### Key Entities *(include if feature involves data)*

- **Vehicle**: The core garage asset record managed by this feature area.
- **VehicleSpecs**: The technical specification record associated with a
  vehicle, including torque-related information.
- **Maintenance / Part / Invoice / TrackRecord**: Related records surfaced in
  the current denormalized vehicle detail payload.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The spec covers current vehicle CRUD, image handling, specs, and
  detail aggregation without absorbing neighboring invoice, notification, or AI
  document workflows.
- **SC-002**: Each documented vehicle endpoint family has at least one
  corresponding requirement.
- **SC-003**: Known scoping and proxy-image ambiguities remain marked as
  `Needs confirmation`.

## Compliance & Impact *(mandatory)*

### Spec Traceability

- Governing feature/spec path: `specs/004-vehicles-management-and-specs/spec.md`
- In-scope user stories/requirements: US1 with FR-001, US2 with FR-002 and
  FR-004 through FR-006, US3 with FR-003 and FR-007
- Out-of-scope items explicitly excluded:
  - Invoice processing workflow
  - Vehicle-document AI flows
  - Notification generation logic
  - Track browsing beyond related record inclusion in vehicle detail

### Architectural Impact

- Affected modules and boundaries:
  - Backend vehicle endpoints and models plus frontend vehicle feature modules
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
  - Confirm that image, detail, and torque-spec endpoints align with the
    research docs.

### Security, Observability & Data Handling

- Input validation boundaries:
  - Existing vehicle and image request validation remains at the current API
    boundaries.
- Authentication/authorization impact:
  - Vehicle routes remain part of the authenticated application surface.
- Secrets/internal URL handling:
  - No new secrets are introduced; proxy-image behavior is documented only as
    current behavior with unresolved trust assumptions.
- Observability impact:
  - No new observability behavior is introduced by this artifact.

## Assumptions

- Vehicle detail remains a read model over current related records rather than a
  separate editable entity.
- Reminder-related fields belong here because they are stored on the vehicle
  record, even though notification generation is specified separately.
- Only behavior explicitly evidenced in the research documents is in scope.
