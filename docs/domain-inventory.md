# Domain Inventory

## Overview

The codebase currently implements the following domains.

## Identity and access

Responsibilities:

- email/password login
- Google-based login
- JWT issuance and validation
- current-user profile access
- password change
- per-user settings

Primary backend files:

- `backend/app/api/v1/endpoints/auth.py`
- `backend/app/api/v1/endpoints/users.py`
- `backend/app/api/v1/endpoints/settings.py`
- `backend/app/api/deps.py`
- `backend/app/core/security.py`
- `backend/app/models/user.py`
- `backend/app/models/google_auth.py`
- `backend/app/models/settings.py`

Primary frontend files:

- `frontend/src/app/auth/login/login.component.ts`
- `frontend/src/app/core/services/auth.service.ts`
- `frontend/src/app/core/services/google-auth.service.ts`
- `frontend/src/app/core/guards/auth.guard.ts`
- `frontend/src/app/core/guards/public-only.guard.ts`

Notes:

- `Settings` stores Google client ID and Gemini API key per user.
- `GoogleAuthToken` stores Google account metadata and access token data.

## Vehicles and technical data

Responsibilities:

- vehicle CRUD
- vehicle images
- technical specs and torque specs
- denormalized vehicle detail view

Primary backend files:

- `backend/app/api/v1/endpoints/vehicles.py`
- `backend/app/models/vehicle.py`
- `backend/app/models/vehicle_specs.py`

Primary frontend files:

- `frontend/src/app/features/vehicles/**`
- `frontend/src/app/core/services/vehicle.service.ts`

Notes:

- Vehicle usage type is modeled as `street`, `track`, or `both`.
- Vehicle specs are stored in a one-to-one `VehicleSpecs` table.

## Maintenance and parts

Responsibilities:

- maintenance CRUD
- parts CRUD
- linking maintenance, parts, supplier, invoice, and vehicle records

Primary backend files:

- `backend/app/api/v1/endpoints/maintenance.py`
- `backend/app/api/v1/endpoints/parts.py`
- `backend/app/models/maintenance.py`
- `backend/app/models/part.py`

Primary frontend files:

- `frontend/src/app/features/maintenance/**`
- `frontend/src/app/features/parts/**`
- `frontend/src/app/core/services/maintenance.service.ts`
- `frontend/src/app/core/services/part.service.ts`

Notes:

- Parts can exist under maintenance, supplier, invoice, or independently.
- Maintenance cost is stored directly on the maintenance record.

## Suppliers

Responsibilities:

- supplier CRUD
- supplier lookup and association with maintenance, parts, and invoices

Primary backend files:

- `backend/app/api/v1/endpoints/suppliers.py`
- `backend/app/models/supplier.py`

Primary frontend files:

- `frontend/src/app/features/suppliers/**`
- `frontend/src/app/core/services/supplier.service.ts`

## Invoices and AI extraction

Responsibilities:

- invoice upload and storage
- Gemini-based extraction
- extraction review/edit cycle
- approval into domain records
- retry/reject lifecycle handling

Primary backend files:

- `backend/app/api/v1/endpoints/invoices.py`
- `backend/app/services/invoice_service.py`
- `backend/app/services/invoice_approval_service.py`
- `backend/app/services/invoice_workflow_service.py`
- `backend/app/schemas/invoice_processing.py`
- `backend/app/models/invoice.py`

Primary frontend files:

- `frontend/src/app/features/invoices/**`
- `frontend/src/app/core/services/invoice.service.ts`

Notes:

- Invoice lifecycle states are `pending`, `processing`, `review`, `approved`,
  and `failed`.
- Approval can create supplier, maintenance, and part records.
- Invoice extraction classifies documents as maintenance or parts-only.

## Tracks, circuits, and track records

Responsibilities:

- vehicle track records
- normalized track catalog
- legacy circuit aggregation by string name
- organizer name extraction from track records

Primary backend files:

- `backend/app/api/v1/endpoints/track_records.py`
- `backend/app/api/v1/endpoints/tracks.py`
- `backend/app/api/v1/endpoints/circuits.py`
- `backend/app/api/v1/endpoints/organizers.py`
- `backend/app/services/track_records_service.py`
- `backend/app/services/tracks_service.py`
- `backend/app/services/circuits_service.py`
- `backend/app/models/track.py`
- `backend/app/models/track_record.py`

Primary frontend files:

- `frontend/src/app/features/tracks/**`
- `frontend/src/app/features/vehicles/components/track-records/**`
- `frontend/src/app/services/organizer.service.ts`
- `frontend/src/app/features/tracks/tracks.service.ts`

Notes:

- Both `track_id` and legacy `circuit_name` are kept on track records.
- The service layer auto-creates a `Track` when a track record references a new
  circuit name.

## Vehicle documents, knowledge, and AI chat

Responsibilities:

- vehicle document upload
- document parsing and chunking
- pgvector-based embedding storage
- Gemini-based knowledge fact extraction
- question answering with citations
- UI for ask/retry/upload/reindex/delete

Primary backend files:

- `backend/app/api/v1/endpoints/vehicle_rag.py`
- `backend/app/services/vehicle_document_rag_service.py`
- `backend/app/models/vehicle_document.py`
- `backend/app/models/vehicle_document_chunk.py`
- `backend/app/models/vehicle_knowledge_fact.py`

Primary frontend files:

- `frontend/src/app/features/vehicles/components/vehicle-docs-ai/**`
- `frontend/src/app/core/services/vehicle-rag.service.ts`

Notes:

- Supported document types include owner manual, workshop manual, invoice,
  insurance, registration, and other.
- Chat can scope to all documents or manuals only, and can include/exclude
  invoice documents.

## Notifications and reminders

Responsibilities:

- per-user notifications list
- mark read/unread
- generate reminders for ITV, insurance, and road tax due dates

Primary backend files:

- `backend/app/api/v1/endpoints/notifications.py`
- `backend/app/models/notification.py`

Primary frontend files:

- `frontend/src/app/features/notifications/**`
- `frontend/src/app/core/services/notification.service.ts`

Notes:

- Notification generation is endpoint-triggered, not scheduled.

## Dashboard and reporting

Responsibilities:

- top-level counts and spend summary
- recent maintenance activity
- monthly maintenance cost trend
- circuit summary statistics

Primary backend files:

- `backend/app/api/v1/endpoints/dashboard.py`

Primary frontend files:

- `frontend/src/app/features/dashboard/**`
- `frontend/src/app/features/dashboard/dashboard.service.ts`

## Platform and UX infrastructure

Responsibilities:

- request correlation
- global exception handling
- static media serving
- service worker updates and offline messaging
- centralized frontend auth/error interception

Primary backend files:

- `backend/app/main.py`
- `backend/app/middleware/request_id.py`
- `backend/app/middleware/exception_handler.py`
- `backend/app/core/config.py`
- `backend/app/core/storage.py`

Primary frontend files:

- `frontend/src/app/app.config.ts`
- `frontend/src/app/core/interceptors/auth.interceptor.ts`
- `frontend/src/app/core/interceptors/error.interceptor.ts`
- `frontend/src/app/core/services/pwa.service.ts`
- `frontend/src/app/core/services/logger.service.ts`

## Manual/admin scripts

- `backend/seed_admin_user.py`
- `backend/seed_notifications.py`
- `backend/scripts/enrich_tracks_from_wikipedia.py`
- `backend/list_models.py`
- `backend/verify_settings.py`

`Needs confirmation`: which of these scripts are part of the supported operator
workflow versus ad hoc development utilities.
