# Test Inventory

## Overview

Observed automated tests are concentrated in:

- backend pytest files under `backend/test_*.py`
- frontend Vitest specs under
  `frontend/src/app/features/vehicles/components/vehicle-docs-ai/*.spec.ts`

No coverage report, badge, or enforced coverage threshold was found.

## Backend tests

## `backend/test_storage_service.py`

Coverage:

- `StorageService.save_file`
- `StorageService.resolve_file_path`

Verified behavior:

- new uploads are saved under `media/invoices`
- returned public URL starts with `/media/invoices/`
- legacy `/uploads/...` URLs resolve to the `/media/...` path

Type:

- focused unit tests

## `backend/test_invoice_processing.py`

Coverage:

- `InvoiceService.extract_invoice_data`
- `GeminiService.generate_json_payload`

Verified behavior:

- optional integration test can call real Gemini extraction if explicitly
  enabled through env vars
- invoice extraction prompt remains invoice-domain-specific
- invoice service delegates content generation to Gemini service
- Gemini payload fallback resolver can return a substitute payload

Type:

- mostly unit tests, plus one opt-in external integration test

## `backend/test_vehicle_document_rag_service.py`

Coverage:

- RAG answer fallback text
- language fallback behavior
- source-to-citation mapping
- Gemini fallback handling in query expansion and knowledge extraction
- similarity conversion helper
- Gemini model retry/fallback behavior after rate limiting or invalid JSON
- clean stop when a vehicle document disappears mid-processing

Verified behavior:

- Spanish and English fallback responses exist
- retrieved sources can be promoted into citations when model output omits them
- Gemini multi-model fallback behavior is expected
- document processing can abort cleanly if the source document is deleted

Type:

- service-level unit tests using monkeypatching/fakes

## `backend/test_backend_serving.py`

Coverage:

- none in the normal unit-test sense

Observed behavior:

- script issues an HTTP GET against a hardcoded `/media/invoices/...` URL on a
  running backend and prints the result

Assessment:

- this looks like a manual smoke script, not a stable automated test

## Frontend tests

## `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.spec.ts`

Coverage:

- document load failure UI
- ask failure retry UI
- microphone permission denial handling
- missing audio capture handling

Verified behavior:

- the component renders retryable error states
- voice-recognition error handling avoids infinite restart loops for some cases

Type:

- component tests with mocked services

## `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai-voice.util.spec.ts`

Coverage:

- wake phrase detection
- punctuation handling
- transcript merge logic
- overlap de-duplication
- whitespace normalization
- language inference
- voice selection

Type:

- pure utility unit tests

## Coverage gaps inferred from current inventory

- no broad frontend route/component test suite was found outside vehicle-docs AI
- no backend API endpoint test suite was found for CRUD endpoints
- no explicit auth/authorization endpoint tests were found
- no migration tests were found
- no scheduler/background worker integration tests were found
- no end-to-end browser tests were found
- no load/performance tests were found

## Test tooling

Backend:

- `pytest`
- `pytest-asyncio`

Frontend:

- `vitest`
- Angular testing utilities

## Notes and unknowns

- `frontend/package.json` still defines `ng test`, but the repo evidence for
  frontend tests is limited to the Vitest spec files above. `Needs confirmation`
  whether the frontend test runner is fully migrated.
- No CI workflow was found in the inspected files that clearly executes the test
  suites end to end. `Needs confirmation`.
