<!--
Sync Impact Report
- Version change: template -> 1.0.0
- Modified principles:
  - Principle 1 placeholder -> I. Spec-Traceable Delivery
  - Principle 2 placeholder -> II. Simple, Boundary-Respecting Architecture
  - Principle 3 placeholder -> III. Mandatory Verification Gates
  - Principle 4 placeholder -> IV. Security, Observability, and Maintainability
  - Principle 5 placeholder -> V. Anti-Speculation and Plan Discipline
- Added sections:
  - Delivery Standards
  - Workflow & Quality Gates
- Removed sections: none
- Templates requiring updates:
  - ✅ updated .specify/templates/plan-template.md
  - ✅ updated .specify/templates/spec-template.md
  - ✅ updated .specify/templates/tasks-template.md
  - ✅ updated README.md
- Follow-up TODOs: none
-->
# My Garage Constitution

## Core Principles

### I. Spec-Traceable Delivery
Every non-trivial product or engineering change MUST be traceable to an approved
Spec Kit specification and its derived plan/tasks artifacts before implementation
begins. Code, tests, and documentation changes MUST identify the requirement,
story, or task they satisfy. Work that cannot be traced to a specification MUST
stop until the specification is created or amended.

Rationale: traceability keeps scope controlled, preserves intent, and prevents
unreviewed feature drift.

### II. Simple, Boundary-Respecting Architecture
Changes MUST preserve existing module boundaries and prefer the simplest design
that satisfies the approved specification. Business logic MUST stay out of
controllers, route handlers, and UI components, and MUST instead live in small,
testable units with explicit responsibilities. Cross-layer access or coupling is
allowed only when documented in the implementation plan as an intentional
exception.

Rationale: stable boundaries reduce regression risk and keep backend and frontend
codebases maintainable as the application grows.

### III. Mandatory Verification Gates
Any changed behavior MUST be covered by updated automated tests before the work
is considered complete. When application code is touched, the delivery MUST run
the relevant unit tests and the applicable lint and type-check commands for the
affected area. Failing verification MUST block completion unless the failure and
its disposition are explicitly documented in the governing spec or task record.

Rationale: repeatable verification is the minimum bar for safe delivery in a
multi-stack application.

### IV. Security, Observability, and Maintainability
Inputs MUST be validated at the boundary where they enter the system, and
existing authentication and authorization patterns MUST be preserved unless a
specification explicitly changes them. Secrets, tokens, credentials, and
internal-only URLs MUST NOT be hardcoded in source-controlled artifacts. Any
feature that changes data access, identity flows, or external integrations MUST
document the security impact in its specification or plan. Operationally
meaningful logging, error reporting, or equivalent observability hooks MUST be
updated when a change affects diagnosis, auditing, or runtime support. Changes
MUST leave the codebase at least as maintainable as before, with supporting
documentation updated when operator or developer workflows change.

Rationale: secure, diagnosable, maintainable systems are cheaper to operate and
safer to change.

### V. Anti-Speculation and Plan Discipline
Existing package managers and platform conventions MUST be used for dependency
installation and project tooling. New production dependencies MUST NOT be added
without explicit justification in the relevant plan or specification. Changes
MUST remain as small as practical, avoid unrelated refactors, and MUST NOT
introduce speculative functionality beyond the approved specification. If
implementation conflicts with the approved plan or requires a material plan
change, work MUST stop and the conflict MUST be documented and explained before
code changes continue.

Rationale: disciplined scope control prevents feature creep, protects review
quality, and keeps plan changes explicit.

## Delivery Standards

- Backend changes MUST keep domain and orchestration logic in services or other
  dedicated units, not FastAPI controllers.
- Frontend changes MUST keep business rules out of Angular components and favor
  reusable services, state, or utility layers.
- Each implementation plan MUST record the affected modules, verification
  commands, dependency changes, observability impact, and any justified
  constitutional exception.
- Runtime and contributor guidance MUST reference the Spec Kit workflow that is
  actually present in this repository.

## Workflow & Quality Gates

- Specification, plan, and task artifacts form the approval chain for delivery;
  implementation begins only after the required upstream artifact exists.
- Tasks MUST be organized so each user story remains independently implementable
  and testable, with explicit file paths and verification work.
- Pull requests and reviews MUST confirm requirement traceability, architectural
  boundary compliance, updated tests for changed behavior, required
  observability/security changes, and successful lint or type checks where
  application code changed.
- If a change requires altering these rules, the constitution amendment MUST be
  approved first and the dependent templates updated in the same change.

## Governance

This constitution overrides conflicting local process guidance for planned work
in this repository. Amendments require a documented rationale, synchronized
updates to affected Spec Kit templates and guidance files, and reviewer approval.
Versioning follows semantic rules for governance documents: MAJOR for removing or
redefining principles in incompatible ways, MINOR for adding principles or
materially expanding obligations, and PATCH for clarifications that do not change
delivery requirements. Compliance review is mandatory during planning, task
generation, implementation, and code review; unresolved violations MUST be
captured as explicit exceptions in the relevant plan before implementation
proceeds.

**Version**: 1.0.0 | **Ratified**: 2026-05-19 | **Last Amended**: 2026-05-19
