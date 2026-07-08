# AGENTS.md

## Project context
This repository follows Spec-Driven Development using GitHub Spec Kit.
Codex must not implement features that are not traceable to a specification.

## Build and test
- Install dependencies using the existing package manager only.
- Run unit tests before completing implementation.
- Run lint/type checks when touching application code.
- Do not skip failing tests unless explicitly documented.

## Architecture
- Respect existing module boundaries.
- Keep business logic outside controllers and UI components.
- Prefer small, testable units.
- Avoid introducing new production dependencies without justification.

## Security
- Do not hardcode secrets, tokens, credentials or internal URLs.
- Validate input at boundaries.
- Preserve existing authentication and authorization patterns.

## Delivery rules
- Every code change must map to a requirement or task.
- Update tests with changed behavior.
- Stop and explain if the implementation requires changing the approved plan.

<!-- SPECKIT START -->
Active plan: `specs/012-feature-name/plan.md`
Brownfield governance scope: current whole-system baseline, behavior-preserving only.
<!-- SPECKIT END -->
