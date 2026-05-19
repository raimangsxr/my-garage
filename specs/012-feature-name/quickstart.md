# Quickstart: Brownfield SDD Migration

## Purpose

Use this guide to review or extend the current whole-system baseline under
Spec-Driven Development without changing behavior.

## Prerequisites

- Work from branch `012-feature-name`
- Read [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md),
  and [data-model.md](./data-model.md)
- Use the brownfield evidence inventories in `docs/`

## Review Loop

1. Confirm the active spec still reflects current behavior only.
2. Trace the requirement you are working from back to:
   - the relevant section in `spec.md`
   - the module map in `plan.md`
   - the data entities in `data-model.md`
   - the current HTTP surface in `contracts/current-http-surface.md`
3. Check whether an existing test already locks the behavior.
4. If no test exists and future work will move code, add the missing
   lock-behavior test before or with the refactor.
5. Preserve all `Needs confirmation` items until stronger evidence exists.

## Validation Commands

```bash
cd /Users/rromanit/workspace/my-garage_pruebas/backend && pytest
cd /Users/rromanit/workspace/my-garage_pruebas/frontend && npm test
cd /Users/rromanit/workspace/my-garage_pruebas/frontend && npm run build
```

## Brownfield Guardrails

- Do not introduce functional changes while migrating governance artifacts.
- Do not convert ambiguous current behavior into explicit product intent.
- Do not add new production dependencies for documentation-only migration work.
- Preserve current architectural boundaries between backend endpoints, backend
  services, frontend components, and frontend services.

## When Behavior-Preserving Code Changes Become Necessary

- Start from the missing-tests list in `plan.md`
- Lock existing response shapes, state transitions, and current error handling
  before moving code
- Re-run the validation commands above
- Update the spec, plan, and tasks only if traceability changes
