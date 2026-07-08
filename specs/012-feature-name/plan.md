# Implementation Plan: Brownfield SDD Migration

**Branch**: `[012-feature-name]` | **Date**: 2026-05-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/012-feature-name/spec.md`

## Summary

Govern the current whole-system brownfield baseline under Spec-Driven
Development without changing runtime behavior. This plan documents the existing
implementation surfaces, maps modules and tests to requirements, identifies the
missing tests needed to lock current behavior before future refactors, and
creates the supporting artifacts required for ongoing SDD work.

## Technical Context

**Language/Version**: Python `>=3.10` backend; TypeScript with Angular `21.x`
frontend

**Primary Dependencies**: FastAPI, SQLModel, SQLAlchemy, Alembic, Pydantic,
`google-generativeai`, `google-auth*`, `pgvector`, Angular, Angular Material,
RxJS

**Storage**: PostgreSQL via SQLModel/SQLAlchemy; local filesystem media storage
for invoices and vehicle documents; database binary storage for user and
vehicle images

**Testing**: `pytest`, `pytest-asyncio`, Angular test tooling, Vitest-backed
frontend specs in the vehicle-docs AI area

**Target Platform**: Web application with Linux-hosted backend and browser-based
Angular frontend

**Project Type**: Web application

**Performance Goals**: Preserve currently documented runtime behavior only,
including 2-second invoice polling and 6-hour PWA update checks; no additional
performance targets are evidenced for this brownfield migration

**Constraints**: No functional changes; behavior preservation is mandatory; no
new production dependencies; preserve current auth/authz patterns and current
ambiguities marked `Needs confirmation`

**Scale/Scope**: Current authenticated product surface spanning auth, profile,
settings, dashboard, vehicles, maintenance, parts, suppliers, invoices, tracks,
notifications, vehicle-document AI, and PWA lifecycle behavior

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Spec traceability confirmed:
  - Governing spec: `specs/012-feature-name/spec.md`
  - In-scope stories: authenticated access, core record management, invoice and
    vehicle-document processing, dashboard and reminder review
  - In-scope requirements: FR-001 through FR-010
- Architectural boundaries confirmed:
  - Backend surfaces remain under `backend/app/api/v1/endpoints/**`,
    `backend/app/services/**`, `backend/app/models/**`, and `backend/app/core/**`
  - Frontend surfaces remain under `frontend/src/app/**`, with business logic
    continuing to live in services and utility layers rather than components
  - This plan introduces documentation artifacts only and does not alter
    controller or UI boundaries
- Verification scope confirmed:
  - Existing evidence tests: `backend/test_storage_service.py`,
    `backend/test_api_helpers.py`,
    `backend/test_auth_endpoints.py`,
    `backend/test_identity_profile_settings.py`,
    `backend/test_notification_endpoints.py`,
    `backend/test_invoice_processing.py`,
    `backend/test_vehicle_document_rag_service.py`,
    `frontend/src/app/core/guards/auth.guard.spec.ts`,
    `frontend/src/app/core/guards/public-only.guard.spec.ts`,
    `frontend/src/app/core/interceptors/auth.interceptor.spec.ts`,
    `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.spec.ts`,
    `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai-voice.util.spec.ts`
  - Missing lock-behavior tests are identified below and should precede any
    behavior-preserving refactor work
- Quality commands confirmed:
  - Backend tests: `cd backend && pytest`
  - Frontend tests: `cd frontend && npm test`
  - Frontend build/type validation: `cd frontend && npm run build`
  - No standalone lint command is evidenced in current package metadata
- Security impact confirmed:
  - No auth flow changes are proposed
  - Existing ambiguities remain documented: business-record ownership scoping and
    vehicle `proxy-image` trust boundaries
  - No secrets, tokens, credentials, or internal URLs are added by this plan
  - Observability remains documentation-only; no runtime logging changes are
    introduced
- Dependency discipline confirmed:
  - No new production dependencies are required

**Gate Result**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/012-feature-name/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── current-http-surface.md
├── checklists/
│   ├── brownfield.md
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── api/v1/endpoints/
│   ├── core/
│   ├── middleware/
│   ├── models/
│   ├── schemas/
│   └── services/
├── alembic/versions/
├── test_*.py
└── pyproject.toml

frontend/
├── src/app/
│   ├── auth/
│   ├── core/
│   ├── features/
│   ├── layout/
│   ├── services/
│   └── shared/
└── package.json

docs/
├── codebase-research.md
├── feature-inventory.md
├── api-inventory.md
├── data-model-inventory.md
└── test-inventory.md
```

**Structure Decision**: Use the existing web-application split between
`backend/` and `frontend/`, with the `docs/` inventories and `specs/012-feature-name/`
artifacts forming the brownfield SDD governance layer.

## Current Implementation Summary

- Authentication and route protection are implemented through backend auth
  endpoints plus frontend guards, interceptors, and login surfaces.
- Core business CRUD and read models are split across backend endpoint modules,
  selected backend services, frontend feature components, and frontend API
  services.
- AI-assisted invoice and vehicle-document workflows are the richest current
  orchestration areas and already rely on background tasks plus a small existing
  automated test surface.
- Notifications, dashboard, tracks, and PWA behaviors are currently documented
  from routes, services, and supporting frontend infrastructure rather than from
  broad end-to-end coverage.

## Files And Modules Mapped To Requirements

| Requirement | Backend modules | Frontend modules | Supporting docs |
|-------------|-----------------|------------------|-----------------|
| FR-001 Authentication and protected access | `backend/app/api/v1/endpoints/auth.py`, `backend/app/api/deps.py`, `backend/app/core/security.py` | `frontend/src/app/auth/login/login.component.ts`, `frontend/src/app/core/services/auth.service.ts`, `frontend/src/app/core/services/google-auth.service.ts`, `frontend/src/app/core/guards/auth.guard.ts`, `frontend/src/app/core/guards/public-only.guard.ts`, `frontend/src/app/core/interceptors/auth.interceptor.ts` | `docs/codebase-research.md`, `docs/feature-inventory.md`, `docs/api-inventory.md` |
| FR-002 Profile and settings | `backend/app/api/v1/endpoints/users.py`, `backend/app/api/v1/endpoints/settings.py`, `backend/app/models/user.py`, `backend/app/models/settings.py` | `frontend/src/app/features/profile/**`, `frontend/src/app/features/settings/settings.component.ts`, `frontend/src/app/core/services/user.service.ts`, `frontend/src/app/core/services/settings.service.ts` | `docs/feature-inventory.md`, `docs/data-model-inventory.md` |
| FR-003 Dashboard summary | `backend/app/api/v1/endpoints/dashboard.py` | `frontend/src/app/features/dashboard/**`, `frontend/src/app/features/dashboard/dashboard.service.ts` | `docs/feature-inventory.md`, `docs/api-inventory.md` |
| FR-004 Vehicle management and specs | `backend/app/api/v1/endpoints/vehicles.py`, `backend/app/models/vehicle.py`, `backend/app/models/vehicle_specs.py` | `frontend/src/app/features/vehicles/**`, `frontend/src/app/core/services/vehicle.service.ts` | `docs/feature-inventory.md`, `docs/data-model-inventory.md` |
| FR-005 Maintenance, parts, suppliers, tracks, circuits, organizers, track records | `backend/app/api/v1/endpoints/maintenance.py`, `parts.py`, `suppliers.py`, `track_records.py`, `tracks.py`, `circuits.py`, `organizers.py`, `backend/app/services/track_records_service.py`, `tracks_service.py`, `circuits_service.py`, related models | `frontend/src/app/features/maintenance/**`, `parts/**`, `suppliers/**`, `tracks/**`, `frontend/src/app/features/vehicles/components/track-records/**`, `frontend/src/app/core/services/maintenance.service.ts`, `part.service.ts`, `supplier.service.ts`, `frontend/src/app/features/tracks/tracks.service.ts`, `frontend/src/app/services/organizer.service.ts` | `docs/feature-inventory.md`, `docs/api-inventory.md`, `docs/data-model-inventory.md` |
| FR-006 Invoice workflow | `backend/app/api/v1/endpoints/invoices.py`, `backend/app/services/invoice_service.py`, `invoice_approval_service.py`, `invoice_workflow_service.py`, `backend/app/core/storage.py`, `backend/app/core/gemini_service.py`, `backend/app/models/invoice.py`, `backend/app/schemas/invoice_processing.py` | `frontend/src/app/features/invoices/**`, `frontend/src/app/core/services/invoice.service.ts` | `docs/feature-inventory.md`, `docs/api-inventory.md`, `docs/test-inventory.md` |
| FR-007 Vehicle-document workflow and optional invoice-doc chat scope | `backend/app/api/v1/endpoints/vehicle_rag.py`, `backend/app/services/vehicle_document_rag_service.py`, `backend/app/core/gemini_service.py`, `backend/app/models/vehicle_document.py`, `vehicle_document_chunk.py`, `vehicle_knowledge_fact.py` | `frontend/src/app/features/vehicles/components/vehicle-docs-ai/**`, `frontend/src/app/core/services/vehicle-rag.service.ts`, `frontend/src/app/features/vehicles/vehicle-detail/**` | `docs/feature-inventory.md`, `docs/api-inventory.md`, `docs/test-inventory.md` |
| FR-008 Notifications | `backend/app/api/v1/endpoints/notifications.py`, `backend/app/models/notification.py` | `frontend/src/app/features/notifications/**`, `frontend/src/app/core/services/notification.service.ts` | `docs/feature-inventory.md`, `docs/api-inventory.md` |
| FR-009 Background and async operating model | `backend/app/api/v1/endpoints/invoices.py`, `backend/app/api/v1/endpoints/vehicle_rag.py`, `backend/app/core/invoice_processor.py`, `backend/app/services/vehicle_document_rag_service.py` | `frontend/src/app/features/invoices/**`, `frontend/src/app/core/services/pwa.service.ts` | `docs/codebase-research.md`, `docs/feature-inventory.md` |
| FR-010 Ambiguities remain explicit | Documentation and behavior notes only; no single code owner | Documentation and behavior notes only; no single UI owner | `docs/codebase-research.md`, `docs/feature-inventory.md`, `docs/data-model-inventory.md`, `docs/test-inventory.md` |

## Existing Tests Mapped To Requirements

| Requirement | Current tests | Coverage status |
|-------------|---------------|-----------------|
| FR-001 | `backend/test_auth_endpoints.py`, `frontend/src/app/core/guards/auth.guard.spec.ts`, `frontend/src/app/core/guards/public-only.guard.spec.ts`, `frontend/src/app/core/interceptors/auth.interceptor.spec.ts` | Partial |
| FR-002 | `backend/test_identity_profile_settings.py` | Partial |
| FR-003 | None evidenced | Gap |
| FR-004 | None evidenced for CRUD/specs/image/detail | Gap |
| FR-005 | None evidenced for CRUD/list/filter/sort flows | Gap |
| FR-006 | `backend/test_storage_service.py`, `backend/test_invoice_processing.py` | Partial |
| FR-007 | `backend/test_vehicle_document_rag_service.py`, `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.spec.ts`, `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai-voice.util.spec.ts` | Partial |
| FR-008 | `backend/test_notification_endpoints.py` | Partial |
| FR-009 | Invoice and vehicle-document tests above partially cover async behavior; no PWA or polling-specific automated tests evidenced | Partial |
| FR-010 | Not testable as a runtime behavior; governed by documentation review | Documentation-only |

## Missing Tests Needed To Lock Current Behavior

- Backend auth endpoint tests for email/password login, Google login, protected
  access denial, and password-recovery placeholder response are now covered, but
  broader auth-session integration coverage is still missing
- Backend CRUD and read-model endpoint tests for vehicles, maintenance, parts,
  suppliers, dashboard, notifications, tracks, circuits, organizers, and
  vehicle detail aggregation
- Backend workflow tests for invoice approval, retry, reject, delete cleanup,
  and notification due-date generation
- Backend contract-level tests for vehicle-document upload/list/edit/delete,
  reindex, knowledge edits, and vehicle chat request payload handling,
  including optional invoice-document scope
- Frontend component or service tests for route protection, dashboard loading,
  vehicles, maintenance, parts, suppliers, invoices polling behavior,
  notifications, profile, settings, and tracks
- Frontend tests or browser automation for current route coverage outside the
  vehicle-docs AI area
- Migration smoke coverage for current Alembic state transitions and startup
  compatibility where behavior-preserving refactors touch persistence

## Documentation Gaps

- The current brownfield spec uses a placeholder-derived feature name and acts
  as a whole-system baseline rather than a narrower feature slice
- No current plan or tasks artifacts existed before this migration step
- Current API inventories summarize endpoints, but there is no contract artifact
  under the active spec directory before this plan
- Current automated-test documentation is sparse outside invoices and
  vehicle-document AI behavior, although auth/profile/settings/notifications
  characterization coverage now exists
- The repo evidence does not show a clear CI workflow that enforces backend and
  frontend verification end to end

## Refactoring Risks

- Many business endpoints query persistence directly, so even behavior-preserving
  cleanups may accidentally alter filtering, joins, or response shape
- Resource ownership is ambiguous for most business entities; refactors could
  silently introduce or remove shared visibility
- Vehicle `proxy-image` behavior has an unconfirmed trust boundary and could
  change unintentionally during cleanup
- Invoice approval and deletion flows contain assumption-heavy orchestration and
  cleanup logic with only partial automated coverage
- Vehicle-document retrieval and knowledge extraction rely on external Gemini
  behavior and embedding semantics, which makes regression detection harder
- Frontend test coverage is uneven, so UI-preserving refactors carry elevated
  regression risk outside the vehicle-docs AI area

## Suggested Non-Functional Checks

- Traceability check: every future task maps back to FR-001 through FR-010 and
  to a concrete module or document in this plan
- Security review: confirm no ownership or auth ambiguity is accidentally
  normalized into a stronger rule during documentation or refactor work
- Response-shape stability review for invoice, vehicle detail, dashboard,
  notifications, and vehicle-document endpoints
- Startup and schema check: ensure Alembic revisions and current model imports
  still support application startup after behavior-preserving cleanup work
- Frontend build and route-integrity check through the existing Angular build
  pipeline
- Logging and diagnosability check for invoice and vehicle-document workflows if
  their orchestration code is touched in future tasks

## Validation Commands

- `cd backend && pytest`
- `cd frontend && npm test`
- `cd frontend && npm run build`
- `git diff -- specs/012-feature-name AGENTS.md docs`

## Phase 0 Research Plan

- Consolidate current implementation evidence into `research.md`
- Resolve planning-time unknowns by fixing the migration stance to
  documentation-first, behavior-preserving governance only
- Record the current validation-command set, test gaps, documentation gaps, and
  rollout constraints

## Phase 1 Design Plan

- Extract the current persisted entities and state transitions into
  `data-model.md`
- Capture the current externally visible HTTP surface under
  `contracts/current-http-surface.md`
- Create `quickstart.md` for reviewers or maintainers performing the brownfield
  validation loop
- Update `AGENTS.md` with the active plan reference block for this spec

## Rollout Notes

- This plan itself changes documentation only and does not require runtime
  rollout steps
- If later behavior-preserving cleanup is performed under this plan, add the
  missing lock-behavior tests before or alongside refactors so current behavior
  is pinned before structural movement
- Preserve `Needs confirmation` items until code or operational evidence proves
  otherwise; do not convert them into implied product decisions during cleanup

## Post-Design Constitution Check

- Spec traceability remains intact through `spec.md`, this plan, and the Phase 0
  and Phase 1 artifacts
- Architectural boundaries remain unchanged; only documentation artifacts are
  added
- Verification scope is explicitly documented, including current evidence and
  missing tests needed before future refactors
- Security and dependency rules remain satisfied; no new secrets, URLs, or
  packages are introduced

**Gate Result**: PASS

## Complexity Tracking

No constitution violations or justified exceptions are required for this
planning-only brownfield migration.
