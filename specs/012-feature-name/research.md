# Phase 0 Research: Brownfield SDD Migration

## Decision 1: Use a documentation-first migration with zero runtime behavior change

- **Decision**: Govern the current whole-system baseline by adding Spec Kit plan
  artifacts and explicit traceability without modifying application behavior.
- **Rationale**: The governing spec is an as-is brownfield artifact and the user
  explicitly required behavior preservation and no functional changes.
- **Alternatives considered**:
  - Add cleanup refactors during planning: rejected because planning must remain
    non-functional and would violate the migration goal.
  - Split the baseline into new narrower scopes immediately: rejected because
    the active branch and spec already govern the current whole-system baseline.

## Decision 2: Treat the existing inventories as the primary evidence set

- **Decision**: Use `docs/codebase-research.md`, `docs/feature-inventory.md`,
  `docs/api-inventory.md`, `docs/data-model-inventory.md`, and
  `docs/test-inventory.md` as the canonical brownfield evidence set for this
  migration plan.
- **Rationale**: The active spec already traces to these sources, and they
  provide enough coverage to map requirements to code modules, public surfaces,
  data entities, and current tests.
- **Alternatives considered**:
  - Re-scan the entire codebase line-by-line for planning: rejected because the
    existing inventories already encode the needed evidence and this would add
    noise without changing the migration outcome.

## Decision 3: Preserve unresolved behavior as explicit ambiguity

- **Decision**: Keep business-record ownership, `proxy-image` trust boundaries,
  and similar unresolved behaviors marked as `Needs confirmation`.
- **Rationale**: The clarify pass confirmed that these areas are observable but
  not proven as intentional product rules.
- **Alternatives considered**:
  - Normalize current behavior into product intent: rejected because it would
    introduce unsupported requirements.
  - Exclude the ambiguities from the plan: rejected because future refactors
    need those risk markers.

## Decision 4: Use current tests as evidence and list missing lock-behavior tests separately

- **Decision**: Treat existing backend invoice/storage tests and backend/frontend
  vehicle-document AI tests as evidence of current behavior, and record broad
  missing tests as future behavior-lock prerequisites for refactoring work.
- **Rationale**: The current suite is concentrated in a few orchestration areas
  and does not cover the majority of CRUD or route behavior.
- **Alternatives considered**:
  - Treat current undocumented areas as implicitly verified: rejected because
    the test inventory explicitly calls out broad coverage gaps.
  - Mandate new tests inside the planning artifact itself: rejected because the
    plan should identify them, not implement them.

## Decision 5: Keep validation commands limited to evidenced project tooling

- **Decision**: Use `pytest`, `npm test`, and `npm run build` as the validation
  command set for future behavior-preserving work under this plan.
- **Rationale**: These commands are evidenced by `backend/pyproject.toml` and
  `frontend/package.json`; no standalone lint script is currently defined.
- **Alternatives considered**:
  - Add new linting or CI requirements now: rejected because that would change
    project behavior and governance beyond the current evidence.

## Decision 6: Model the public contract as the current HTTP surface

- **Decision**: Represent the behavior-governing contract artifact as the
  current HTTP and route surface documented by the inventories.
- **Rationale**: This repository exposes a web application with a backend API
  and a protected frontend route surface, so the contract artifact should track
  that boundary rather than invent a new schema.
- **Alternatives considered**:
  - Skip contracts entirely: rejected because the app exposes stable external
    interfaces to users and clients.
  - Generate a brand-new formal OpenAPI artifact: rejected because the current
    plan only needs a brownfield governance contract, not a new authoritative
    API generation workflow.
