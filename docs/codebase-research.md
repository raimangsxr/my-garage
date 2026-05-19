# Codebase Research

## Scope and method

This baseline is inferred from source code, tests, migrations, configuration,
and repository documentation present in this repository on 2026-05-19.

Reviewed areas include:

- `backend/app/**`
- `backend/alembic/versions/**`
- `backend/test_*.py`
- `frontend/src/app/**`
- `frontend/package.json`
- `README.md`
- `system.md`

Uncertain statements are marked `Needs confirmation`.

## Inferred application purpose

`My Garage` is a vehicle management web application with:

- authenticated access to dashboard, vehicles, maintenance, parts, suppliers,
  invoices, tracks, notifications, profile, and settings
- invoice upload plus AI-assisted extraction/review flows
- vehicle document upload plus AI-assisted retrieval/chat over indexed documents
- PWA behavior in the frontend

This is supported by:

- frontend routes in `frontend/src/app/app.routes.ts`
- backend API registration in `backend/app/api/v1/api.py`
- the repository README and feature-specific services/models

## Runtime architecture

### Backend

- FastAPI app with routers mounted under `/api/v1`
- SQLModel/SQLAlchemy persistence against PostgreSQL
- Alembic migrations for schema evolution
- custom middleware for request IDs and exception handling
- file-backed media storage under `media/`
- synchronous CRUD endpoints plus `BackgroundTasks` for long-running AI flows

Key entrypoints:

- `backend/app/main.py`
- `backend/app/database.py`
- `backend/app/core/config.py`

### Frontend

- Angular standalone application
- route-guarded authenticated shell
- `HttpClient` with auth and error interceptors
- Angular service worker enabled outside dev mode
- feature modules implemented as standalone components/services

Key entrypoints:

- `frontend/src/app/app.config.ts`
- `frontend/src/app/app.routes.ts`

## Main modules and responsibilities

### Backend modules

- `api/v1/endpoints/auth.py`
  - email/password login
  - Google credential login
  - password recovery placeholder
- `api/v1/endpoints/users.py`
  - current-user profile, avatar, password update
- `api/v1/endpoints/settings.py`
  - per-user settings, including Google and Gemini keys
- `api/v1/endpoints/dashboard.py`
  - aggregated counts, recent activity, monthly costs, circuit summary
- `api/v1/endpoints/vehicles.py`
  - vehicles CRUD, image upload, denormalized details, torque specs
- `api/v1/endpoints/track_records.py`
  - track records per vehicle
- `api/v1/endpoints/tracks.py`
  - normalized track catalog plus aggregated stats
- `api/v1/endpoints/circuits.py`
  - legacy circuit-name aggregation from track records
- `api/v1/endpoints/maintenance.py`
  - maintenance CRUD and list/search/sort
- `api/v1/endpoints/parts.py`
  - part CRUD and list/search/sort
- `api/v1/endpoints/suppliers.py`
  - supplier CRUD and list/search/sort
- `api/v1/endpoints/invoices.py`
  - invoice upload, processing lifecycle, review, approval, retry, delete
- `api/v1/endpoints/vehicle_rag.py`
  - vehicle document upload/indexing, knowledge facts, vehicle chat
- `api/v1/endpoints/notifications.py`
  - notifications list, read/unread, on-demand due-date check

### Backend services

- `invoice_service.py`
  - invoice extraction orchestration using Gemini
- `invoice_approval_service.py`
  - converts reviewed invoice data into suppliers, maintenance, and parts
- `invoice_workflow_service.py`
  - resolves API keys and state transitions for reject/retry flows
- `vehicle_document_rag_service.py`
  - document parsing, chunking, embedding, knowledge extraction, answering
- `tracks_service.py`
  - aggregated normalized track queries
- `circuits_service.py`
  - aggregated legacy circuit-name queries
- `track_records_service.py`
  - CRUD plus track synchronization for vehicle track records

### Frontend feature areas

- `auth/login`
- `features/dashboard`
- `features/vehicles`
- `features/tracks`
- `features/maintenance`
- `features/invoices`
- `features/suppliers`
- `features/parts`
- `features/profile`
- `features/notifications`
- `features/settings`

## User-facing capabilities inferred from code

- Login with email/password
- Login with Google credential token
- View dashboard statistics and recent activity
- Create, edit, delete, and list vehicles
- Upload vehicle images
- View a denormalized vehicle detail payload that includes specs,
  maintenances, parts, invoices, and track records
- Maintain torque specifications per vehicle
- Create, edit, delete, and list maintenance records
- Create, edit, delete, and list parts
- Create, edit, delete, and list suppliers
- Upload invoices for AI extraction
- Review extracted invoice data and edit it before approval
- Approve invoice extraction into supplier/maintenance/part records
- Reject and reprocess invoice extraction
- Retry failed invoice extraction
- Delete invoices, including cleanup of approved-linked parts/maintenance
- Create and browse track records per vehicle
- Browse normalized tracks and legacy circuit aggregations
- Create tracks
- List organizer names from track records
- Read and update user profile and password
- Read and update per-user settings, including Google/Gemini configuration
- Read notifications, mark read/unread, and trigger due-date notification
  generation
- Upload vehicle documents for indexing
- Reindex, edit, and delete indexed vehicle documents
- View and edit derived vehicle knowledge facts
- Ask AI questions against indexed vehicle documentation
- Use PWA install/update/offline features in supported browsers

## Authentication and authorization

### Observed mechanisms

- OAuth2 password flow endpoint at `/api/v1/auth/login/access-token`
- JWT bearer tokens signed with HS256
- token subject is the user email
- most business endpoints require `get_current_active_user`
- frontend stores the access token in `localStorage` as `access_token`
- frontend attaches bearer tokens through `authInterceptor`
- Google login accepts a Google credential token and returns an app JWT

### Authorization scope

- `notifications` and `settings` are explicitly user-scoped
- profile endpoints operate on the current user
- most domain entities (`vehicles`, `maintenance`, `parts`, `suppliers`,
  `tracks`, `invoices`, `track_records`) do not show per-user ownership fields
  or per-user filtering in endpoint queries

`Needs confirmation`: whether the application is intentionally single-tenant or
missing tenant/user scoping for these resources.

## External integrations

- Google Identity / Google OAuth credential verification
- Google Gemini multimodal generation and JSON extraction
- pgvector for document chunk embeddings
- local filesystem media storage for invoices and vehicle documents
- Wikipedia summary API used by a manual enrichment script for tracks
- Angular service worker for PWA behavior

## Background processes and async flows

- invoice upload schedules `process_invoice_background` via FastAPI
  `BackgroundTasks`
- vehicle document upload and reindex schedule
  `process_vehicle_document_background`
- frontend polls invoice status every 2 seconds during pending/processing states
- frontend PWA service checks for updates every 6 hours
- notifications are generated on demand by POST `/api/v1/notifications/check`

No scheduler, queue worker, Celery worker, or cron framework was found in
application runtime code.

## Error handling patterns

### Backend

- custom `AppException` hierarchy exists in `backend/app/core/exceptions.py`
- global handlers return structured JSON with `request_id`
- many endpoints still raise `HTTPException` directly
- long-running invoice/document flows log failures and update model status/error
  fields

### Frontend

- central HTTP error interceptor maps common HTTP statuses to toast messages
- 401 on non-auth endpoints triggers logout
- feature-specific components keep local error state for retry UI in some flows
  such as vehicle docs AI

## Observability and logging

- backend logging configured centrally in `backend/app/core/config.py`
- request IDs are attached by middleware and returned as `X-Request-ID`
- exception handlers log request path, request ID, and exception type
- invoice and document services log processing lifecycle events
- frontend has a `LoggerService` wrapping console logging
- PWA service logs update/install/connectivity events

No metrics exporter, tracing backend, or remote log sink was found.

## Existing tests and verification surface

- backend pytest files cover:
  - storage service file save/path mapping
  - Gemini JSON fallback behavior
  - invoice extraction service prompt delegation
  - RAG fallback/citation/deletion behavior
- one backend file, `test_backend_serving.py`, behaves like a manual script
  against a running server rather than a typical unit test
- frontend Vitest specs cover:
  - vehicle docs AI component error and voice-failure states
  - voice utility transcript/wake-phrase helpers

No repository-level coverage report or coverage threshold configuration was
found.

## Risks, unknowns, and documentation gaps

- User/tenant scoping is unclear for most business data. `Needs confirmation`.
- Password recovery endpoint is a stub that returns success text without sending
  email.
- Some maintenance/invoice deletion logic includes comments that describe
  assumptions instead of enforced invariants.
- AI-assisted features depend on Gemini configuration and external service
  behavior; fallback behavior exists but full operational guarantees are not
  documented.
- Frontend and backend READMEs do not describe the invoice AI or vehicle
  documentation AI flows in detail.
- Several helper scripts appear operationally useful but are not integrated into
  a documented admin workflow.
- At least one helper script (`backend/inspect_db.py`) appears stale because it
  imports `DATABASE_URL` from `app.database`, while the file exposes `engine`
  and `get_session` instead. `Needs confirmation`.
