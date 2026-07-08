# Tasks: Brownfield SDD Migration

**Input**: Design documents from `/specs/012-feature-name/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: This migration explicitly includes characterization and contract
tests to lock current behavior before any future behavior-preserving refactor
work.

**Organization**: Tasks are grouped by user story to enable independent
implementation and testing of each story.

**Traceability**: Every task below references one or more current requirements
from `specs/012-feature-name/spec.md`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Every task includes exact file paths and validation commands

## Phase 1: Setup (Shared Governance Infrastructure)

**Purpose**: Establish the brownfield SDD governance artifacts and validation
surface without changing runtime behavior.

- [ ] T001 Normalize the active validation-command set in `specs/012-feature-name/plan.md` and `specs/012-feature-name/quickstart.md` so backend/frontend checks stay consistent for FR-001 through FR-010; Validate with: `git diff -- specs/012-feature-name/plan.md specs/012-feature-name/quickstart.md`
- [ ] T002 [P] Expand `specs/012-feature-name/contracts/current-http-surface.md` with any missing route or endpoint notes needed for FR-001 through FR-009 traceability; Validate with: `git diff -- specs/012-feature-name/contracts/current-http-surface.md`
- [ ] T003 [P] Remove documentation drift across `specs/012-feature-name/spec.md`, `specs/012-feature-name/plan.md`, `specs/012-feature-name/research.md`, and `specs/012-feature-name/data-model.md` so the same current-behavior terms are used for FR-007 through FR-010; Validate with: `git diff -- specs/012-feature-name/spec.md specs/012-feature-name/plan.md specs/012-feature-name/research.md specs/012-feature-name/data-model.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the shared characterization and contract-test scaffolding
used by every user story.

**⚠️ CRITICAL**: No user story work should start until this phase is complete.

- [ ] T004 Create shared backend API test helpers in `backend/test_api_helpers.py` for authenticated requests and current response-shape assertions covering FR-001 through FR-009; Validate with: `cd /Users/rromanit/workspace/my-garage_pruebas/backend && pytest backend/test_api_helpers.py`
- [ ] T005 [P] Create shared frontend test helpers in `frontend/src/app/core/testing/api-test-helpers.ts` and `frontend/src/app/core/testing/router-test-helpers.ts` for route and service characterization tied to FR-001 through FR-009; Validate with: `cd /Users/rromanit/workspace/my-garage_pruebas/frontend && npm test -- --runInBand`
- [ ] T006 Define the brownfield contract-test inventory in `specs/012-feature-name/contracts/current-http-surface.md` and `specs/012-feature-name/quickstart.md`, including which endpoints must be pinned before cleanup for FR-001 through FR-009; Validate with: `git diff -- specs/012-feature-name/contracts/current-http-surface.md specs/012-feature-name/quickstart.md`

**Checkpoint**: Shared governance and test scaffolding are ready; story work can proceed.

---

## Phase 3: User Story 1 - Access Authenticated Garage Functions (Priority: P1) 🎯 MVP

**Goal**: Lock the current authentication, protected-route, profile, and
settings behavior under SDD governance.

**Independent Test**: Authenticate through the current login flows, verify
protected access rules, and characterize current profile/settings endpoints
without changing runtime behavior.

### Tests for User Story 1

- [ ] T007 [P] [US1] Add backend auth characterization tests in `backend/test_auth_endpoints.py` for email/password login, Google login, protected-access denial, and password-recovery placeholder behavior covering FR-001; Validate with: `cd /Users/rromanit/workspace/my-garage_pruebas/backend && pytest backend/test_auth_endpoints.py`
- [ ] T008 [P] [US1] Add backend profile/settings characterization tests in `backend/test_identity_profile_settings.py` for `users/me`, password change, and settings read/update behavior covering FR-002; Validate with: `cd /Users/rromanit/workspace/my-garage_pruebas/backend && pytest backend/test_identity_profile_settings.py`
- [ ] T009 [P] [US1] Add frontend route/auth characterization specs in `frontend/src/app/core/guards/auth.guard.spec.ts`, `frontend/src/app/core/guards/public-only.guard.spec.ts`, and `frontend/src/app/core/interceptors/auth.interceptor.spec.ts` for current protected navigation and token attachment behavior covering FR-001; Validate with: `cd /Users/rromanit/workspace/my-garage_pruebas/frontend && npm test -- --runInBand`
- [ ] T010 [US1] Update `specs/012-feature-name/spec.md` and `specs/012-feature-name/plan.md` to map the new auth/profile/settings characterization tests back to FR-001 and FR-002 and to current permissions language; Validate with: `git diff -- specs/012-feature-name/spec.md specs/012-feature-name/plan.md`

**Checkpoint**: User Story 1 is governed by characterization tests and explicit traceability.

---

## Phase 4: User Story 2 - Manage Core Garage Records (Priority: P1)

**Goal**: Lock the current garage record CRUD, list, filter, sort, and aggregate
behavior for vehicles, maintenance, parts, suppliers, tracks, and related views.

**Independent Test**: Exercise current CRUD/list/detail flows and confirm the
existing dashboard or vehicle-detail read models remain unchanged.

### Tests for User Story 2

- [ ] T011 [P] [US2] Add backend vehicle and dashboard characterization tests in `backend/test_vehicle_dashboard_endpoints.py` for `vehicles`, `vehicles/{id}/details`, `vehicles/{id}/specs/torque`, and `dashboard/stats` covering FR-003 and FR-004; Validate with: `cd /Users/rromanit/workspace/my-garage_pruebas/backend && pytest backend/test_vehicle_dashboard_endpoints.py`
- [ ] T012 [P] [US2] Add backend maintenance, parts, and suppliers characterization tests in `backend/test_operations_crud_endpoints.py` for list/search/sort/detail and CRUD behavior covering FR-005; Validate with: `cd /Users/rromanit/workspace/my-garage_pruebas/backend && pytest backend/test_operations_crud_endpoints.py`
- [ ] T013 [P] [US2] Add backend tracks, circuits, organizers, and per-vehicle track-record characterization tests in `backend/test_tracks_endpoints.py` covering FR-005 and current legacy-versus-normalized track behavior; Validate with: `cd /Users/rromanit/workspace/my-garage_pruebas/backend && pytest backend/test_tracks_endpoints.py`
- [ ] T014 [P] [US2] Add frontend service or component characterization specs in `frontend/src/app/features/vehicles/vehicles.component.spec.ts`, `frontend/src/app/features/maintenance/maintenance.component.spec.ts`, `frontend/src/app/features/parts/parts.component.spec.ts`, `frontend/src/app/features/suppliers/suppliers.component.spec.ts`, and `frontend/src/app/features/tracks/tracks.component.spec.ts` covering FR-003 through FR-005; Validate with: `cd /Users/rromanit/workspace/my-garage_pruebas/frontend && npm test -- --runInBand`
- [ ] T015 [US2] Update `specs/012-feature-name/contracts/current-http-surface.md`, `specs/012-feature-name/data-model.md`, and `specs/012-feature-name/plan.md` with the finalized record-management and aggregate traceability for FR-003 through FR-005; Validate with: `git diff -- specs/012-feature-name/contracts/current-http-surface.md specs/012-feature-name/data-model.md specs/012-feature-name/plan.md`

**Checkpoint**: User Story 2 current CRUD and aggregate behavior is locked and documented.

---

## Phase 5: User Story 3 - Process Invoice And Vehicle Documents (Priority: P1)

**Goal**: Lock the current invoice and vehicle-document AI workflows, including
background-state handling and contract boundaries.

**Independent Test**: Upload invoice or vehicle-document payloads, verify the
documented lifecycle and review flows, and preserve the current optional
invoice-document chat scope.

### Tests for User Story 3

- [ ] T016 [P] [US3] Expand backend invoice characterization in `backend/test_invoice_processing.py` and add contract-level endpoint coverage in `backend/test_invoice_endpoints.py` for upload, review, approve, retry, reject, delete, and polling-visible state behavior covering FR-006 and FR-009; Validate with: `cd /Users/rromanit/workspace/my-garage_pruebas/backend && pytest backend/test_invoice_processing.py backend/test_invoice_endpoints.py`
- [ ] T017 [P] [US3] Expand backend vehicle-document characterization in `backend/test_vehicle_document_rag_service.py` and add endpoint coverage in `backend/test_vehicle_document_endpoints.py` for upload, reindex, knowledge edits, and chat payload scope covering FR-007 and FR-009; Validate with: `cd /Users/rromanit/workspace/my-garage_pruebas/backend && pytest backend/test_vehicle_document_rag_service.py backend/test_vehicle_document_endpoints.py`
- [ ] T018 [P] [US3] Add frontend invoice workflow characterization specs in `frontend/src/app/features/invoices/invoices.component.spec.ts`, `frontend/src/app/features/invoices/invoice-upload/invoice-upload.component.spec.ts`, and `frontend/src/app/features/invoices/invoice-review/invoice-review.component.spec.ts` covering FR-006 and current polling behavior in FR-009; Validate with: `cd /Users/rromanit/workspace/my-garage_pruebas/frontend && npm test -- --runInBand`
- [ ] T019 [P] [US3] Expand `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.spec.ts` and `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai-voice.util.spec.ts` to pin current question-answering, retry UI, and optional invoice-document scope behavior for FR-007 and FR-009; Validate with: `cd /Users/rromanit/workspace/my-garage_pruebas/frontend && npm test -- --runInBand`
- [ ] T020 [US3] Update `specs/012-feature-name/spec.md`, `specs/012-feature-name/plan.md`, and `specs/012-feature-name/contracts/current-http-surface.md` so invoice and vehicle-document tests are explicitly mapped back to FR-006, FR-007, and FR-009; Validate with: `git diff -- specs/012-feature-name/spec.md specs/012-feature-name/plan.md specs/012-feature-name/contracts/current-http-surface.md`
- [ ] T021 [US3] Apply only if tests cannot isolate current orchestration seams: extract minimal test seams in `backend/app/services/invoice_service.py`, `backend/app/services/invoice_workflow_service.py`, or `backend/app/services/vehicle_document_rag_service.py` without changing behavior, and document the reason in `specs/012-feature-name/plan.md` for FR-006 through FR-009; Validate with: `cd /Users/rromanit/workspace/my-garage_pruebas/backend && pytest backend/test_invoice_processing.py backend/test_vehicle_document_rag_service.py && git diff -- backend/app/services specs/012-feature-name/plan.md`

**Checkpoint**: User Story 3 current AI-assisted workflows are pinned for future cleanup.

---

## Phase 6: User Story 4 - Review Operational State And Reminders (Priority: P2)

**Goal**: Lock the current dashboard summary and on-demand reminder behavior.

**Independent Test**: Read dashboard statistics, list notifications, and invoke
the current due-date reminder check without introducing automatic scheduling.

### Tests for User Story 4

- [ ] T022 [P] [US4] Add backend notification characterization tests in `backend/test_notification_endpoints.py` for list, read/unread, and on-demand reminder generation covering FR-008 and FR-010; Validate with: `cd /Users/rromanit/workspace/my-garage_pruebas/backend && pytest backend/test_notification_endpoints.py`
- [ ] T023 [P] [US4] Add frontend dashboard and notification characterization specs in `frontend/src/app/features/dashboard/dashboard.component.spec.ts` and `frontend/src/app/features/notifications/notifications/notifications.spec.ts` covering FR-003 and FR-008; Validate with: `cd /Users/rromanit/workspace/my-garage_pruebas/frontend && npm test -- --runInBand`
- [ ] T024 [US4] Update `specs/012-feature-name/spec.md`, `specs/012-feature-name/plan.md`, and `specs/012-feature-name/quickstart.md` to document that reminder generation remains on-demand only and that dashboard/notification tests now lock FR-003 and FR-008; Validate with: `git diff -- specs/012-feature-name/spec.md specs/012-feature-name/plan.md specs/012-feature-name/quickstart.md`

**Checkpoint**: User Story 4 current operational-read behavior is governed and traceable.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Close remaining brownfield governance gaps across stories without
changing runtime behavior.

- [ ] T025 [P] Add migration smoke coverage in `backend/test_app_startup_and_migrations.py` for current app startup and Alembic compatibility risks tied to FR-004 through FR-009; Validate with: `cd /Users/rromanit/workspace/my-garage_pruebas/backend && pytest backend/test_app_startup_and_migrations.py`
- [ ] T026 [P] Add a browser-level route-smoke suite in `frontend/src/app/app.routes.spec.ts` or equivalent frontend route smoke coverage for current authenticated surfaces tied to FR-001 through FR-009; Validate with: `cd /Users/rromanit/workspace/my-garage_pruebas/frontend && npm test -- --runInBand`
- [ ] T027 Reconcile all brownfield documentation artifacts in `specs/012-feature-name/spec.md`, `specs/012-feature-name/plan.md`, `specs/012-feature-name/data-model.md`, `specs/012-feature-name/contracts/current-http-surface.md`, and `specs/012-feature-name/checklists/brownfield.md` so new test coverage removes drift and preserves `Needs confirmation` language for FR-010; Validate with: `git diff -- specs/012-feature-name`
- [ ] T028 Run the full brownfield validation suite using `cd /Users/rromanit/workspace/my-garage_pruebas/backend && pytest`, `cd /Users/rromanit/workspace/my-garage_pruebas/frontend && npm test`, and `cd /Users/rromanit/workspace/my-garage_pruebas/frontend && npm run build`, then record any non-behavioral follow-up in `specs/012-feature-name/quickstart.md` for FR-001 through FR-010; Validate with: those same commands plus `git diff -- specs/012-feature-name/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; starts immediately
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories
- **User Story phases (Phase 3-6)**: Depend on Foundational completion
- **Polish (Phase 7)**: Depends on desired story phases being complete

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational; independent of other stories
- **US2 (P1)**: Starts after Foundational; independent of US1 except for shared helpers
- **US3 (P1)**: Starts after Foundational; independent of US1/US2 except for shared helpers
- **US4 (P2)**: Starts after Foundational; can run after or alongside P1 stories

### Within Each User Story

- Characterization and contract tests before any optional refactor-for-testability task
- Backend and frontend coverage can run in parallel where files do not overlap
- Documentation traceability updates occur after the new tests are in place

### Dependency Graph

- T001-T003 -> T004-T006 -> {T007-T010, T011-T015, T016-T021, T022-T024} -> T025-T028

---

## Parallel Example: User Story 1

```bash
# Backend and frontend auth characterization can run together:
Task: "T007 Add backend auth characterization tests in backend/test_auth_endpoints.py"
Task: "T009 Add frontend route/auth characterization specs in frontend/src/app/core/guards/auth.guard.spec.ts, frontend/src/app/core/guards/public-only.guard.spec.ts, and frontend/src/app/core/interceptors/auth.interceptor.spec.ts"

# Profile/settings backend coverage can run independently:
Task: "T008 Add backend profile/settings characterization tests in backend/test_identity_profile_settings.py"
```

## Parallel Example: User Story 2

```bash
# Domain endpoint characterization can be split by module group:
Task: "T011 Add backend vehicle and dashboard characterization tests in backend/test_vehicle_dashboard_endpoints.py"
Task: "T012 Add backend maintenance, parts, and suppliers characterization tests in backend/test_operations_crud_endpoints.py"
Task: "T013 Add backend tracks, circuits, organizers, and per-vehicle track-record characterization tests in backend/test_tracks_endpoints.py"
```

## Parallel Example: User Story 3

```bash
# Invoice and vehicle-document coverage can run in parallel:
Task: "T016 Expand backend invoice characterization in backend/test_invoice_processing.py and add backend/test_invoice_endpoints.py"
Task: "T017 Expand backend vehicle-document characterization in backend/test_vehicle_document_rag_service.py and add backend/test_vehicle_document_endpoints.py"
Task: "T018 Add frontend invoice workflow characterization specs in frontend/src/app/features/invoices/**"
Task: "T019 Expand frontend/src/app/features/vehicles/components/vehicle-docs-ai/*.spec.ts"
```

## Parallel Example: User Story 4

```bash
# Backend and frontend operational-read coverage can run together:
Task: "T022 Add backend notification characterization tests in backend/test_notification_endpoints.py"
Task: "T023 Add frontend dashboard and notification characterization specs in frontend/src/app/features/dashboard/dashboard.component.spec.ts and frontend/src/app/features/notifications/notifications/notifications.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate auth, route protection, profile, and settings coverage

### Incremental Delivery

1. Setup + Foundational establish SDD governance scaffolding
2. Add US1 coverage and traceability
3. Add US2 coverage and traceability
4. Add US3 coverage and traceability
5. Add US4 coverage and traceability
6. Finish with cross-cutting smoke coverage and full validation

### Parallel Team Strategy

1. Complete T001-T006 together
2. Split P1 stories across contributors:
   - Contributor A: US1
   - Contributor B: US2
   - Contributor C: US3
3. Add US4 once shared scaffolding is stable
4. Rejoin for T025-T028

---

## Notes

- [P] tasks touch different files and can be parallelized safely
- Story labels map directly to the user stories in `specs/012-feature-name/spec.md`
- Every task preserves current behavior and references one or more current requirements
- Optional refactor work is limited to T021 and only allowed when needed for testability
- Run the listed validation commands before marking a task complete
