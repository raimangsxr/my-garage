# Feature Inventory

This inventory is derived from the brownfield research documents in `docs/`.
It lists only functional areas evidenced by current code, tests, configuration,
routes, models, migrations, or repository documentation.

Unclear behavior is marked `Needs confirmation`.

## 1. Authentication and session access

- Feature name: Authentication and session access
- User or actor: End user
- Current behavior:
  - Users can log in with email/password.
  - Users can log in with a Google credential token and receive an app JWT.
  - JWT bearer tokens gate most application routes and API endpoints.
  - Password recovery endpoint exists but currently returns a placeholder success
    response without email delivery.
- Entry points:
  - UI routes: `/login`
  - API endpoints:
    - `POST /api/v1/auth/login/access-token`
    - `POST /api/v1/auth/google/login`
    - `POST /api/v1/auth/password-recovery/{email}`
  - Events:
    - frontend auth interceptor attaches bearer tokens
    - auth guard blocks protected routes
- Main files/modules involved:
  - `backend/app/api/v1/endpoints/auth.py`
  - `backend/app/api/deps.py`
  - `backend/app/core/security.py`
  - `backend/app/models/user.py`
  - `backend/app/models/google_auth.py`
  - `frontend/src/app/auth/login/login.component.ts`
  - `frontend/src/app/core/services/auth.service.ts`
  - `frontend/src/app/core/services/google-auth.service.ts`
  - `frontend/src/app/core/guards/auth.guard.ts`
  - `frontend/src/app/core/guards/public-only.guard.ts`
- Data entities involved:
  - `User`
  - `GoogleAuthToken`
- Existing tests:
  - No dedicated auth endpoint tests were found.
- Known gaps or uncertainties:
  - Password recovery is incomplete.
  - Resource ownership beyond authentication is unclear for many business
    entities. `Needs confirmation`.
- Suggested Spec Kit spec name: `identity-auth-and-session`

## 2. User profile and account settings

- Feature name: User profile and account settings
- User or actor: Authenticated user
- Current behavior:
  - Users can read their own profile.
  - Users can update full name.
  - Users can update profile image from a data URL or downloadable HTTP URL.
  - Users can change their password.
  - Users can read and update per-user settings, including language, currency,
    theme, notification preference, Google client ID, and Gemini API key.
  - Default settings are auto-created on first settings read if absent.
- Entry points:
  - UI routes:
    - `/profile`
    - `/change-password`
    - `/settings`
  - API endpoints:
    - `GET /api/v1/users/me`
    - `PUT /api/v1/users/me`
    - `GET /api/v1/users/avatars`
    - `POST /api/v1/users/me/password`
    - `GET /api/v1/settings`
    - `PUT /api/v1/settings`
- Main files/modules involved:
  - `backend/app/api/v1/endpoints/users.py`
  - `backend/app/api/v1/endpoints/settings.py`
  - `backend/app/models/user.py`
  - `backend/app/models/settings.py`
  - `frontend/src/app/features/profile/**`
  - `frontend/src/app/features/settings/settings.component.ts`
  - `frontend/src/app/core/services/user.service.ts`
  - `frontend/src/app/core/services/settings.service.ts`
- Data entities involved:
  - `User`
  - `Settings`
- Existing tests:
  - No dedicated profile/settings tests were found.
- Known gaps or uncertainties:
  - Avatar update from external URL silently swallows failures in backend code.
  - Static avatar list appears hardcoded rather than data-driven.
- Suggested Spec Kit spec name: `identity-profile-and-settings`

## 3. Dashboard and operational summary

- Feature name: Dashboard and operational summary
- User or actor: Authenticated user
- Current behavior:
  - Shows total vehicles.
  - Shows count of future-dated maintenance records as scheduled maintenance.
  - Shows total spend aggregated from maintenance cost.
  - Shows recent maintenance activity.
  - Shows last six months of monthly maintenance cost totals.
  - Shows total suppliers and track/circuit summary metrics.
- Entry points:
  - UI routes: `/dashboard`
  - API endpoints:
    - `GET /api/v1/dashboard/stats`
- Main files/modules involved:
  - `backend/app/api/v1/endpoints/dashboard.py`
  - `frontend/src/app/features/dashboard/**`
  - `frontend/src/app/features/dashboard/dashboard.service.ts`
- Data entities involved:
  - `Vehicle`
  - `Maintenance`
  - `Supplier`
  - `TrackRecord`
- Existing tests:
  - No dashboard-specific tests were found.
- Known gaps or uncertainties:
  - Dashboard calculations are derived directly from current records; no cached
    reporting layer was found.
- Suggested Spec Kit spec name: `operations-dashboard`

## 4. Vehicle management and technical specifications

- Feature name: Vehicle management and technical specifications
- User or actor: Authenticated user
- Current behavior:
  - Users can list, create, update, and delete vehicles.
  - Users can upload and retrieve vehicle images stored as DB binary data.
  - Users can fetch a denormalized vehicle detail response with specs,
    maintenances, parts, invoices, and track records.
  - Users can update vehicle torque specs independently.
  - Vehicle records include due-date and amount fields for ITV, insurance, and
    road tax reminders.
- Entry points:
  - UI routes:
    - `/vehicles`
    - `/vehicles/:id`
  - API endpoints:
    - `GET /api/v1/vehicles`
    - `POST /api/v1/vehicles`
    - `PUT /api/v1/vehicles/{id}`
    - `DELETE /api/v1/vehicles/{id}`
    - `POST /api/v1/vehicles/{id}/image`
    - `GET /api/v1/vehicles/{id}/image`
    - `GET /api/v1/vehicles/proxy-image`
    - `GET /api/v1/vehicles/{id}/details`
    - `PUT /api/v1/vehicles/{id}/specs/torque`
- Main files/modules involved:
  - `backend/app/api/v1/endpoints/vehicles.py`
  - `backend/app/models/vehicle.py`
  - `backend/app/models/vehicle_specs.py`
  - `frontend/src/app/features/vehicles/**`
  - `frontend/src/app/core/services/vehicle.service.ts`
- Data entities involved:
  - `Vehicle`
  - `VehicleSpecs`
  - related `Maintenance`, `Part`, `Invoice`, `TrackRecord`
- Existing tests:
  - No vehicle CRUD or detail endpoint tests were found.
  - Frontend vehicle-docs AI tests exist inside the vehicle detail area but do
    not cover core vehicle CRUD.
- Known gaps or uncertainties:
  - `proxy-image` fetches arbitrary external URLs server-side; intended trust
    model is `Needs confirmation`.
  - No per-user scoping is visible on vehicle records. `Needs confirmation`.
- Suggested Spec Kit spec name: `vehicles-management-and-specs`

## 5. Maintenance records management

- Feature name: Maintenance records management
- User or actor: Authenticated user
- Current behavior:
  - Users can list maintenance with pagination, search, and sorting.
  - Users can read a single maintenance record with vehicle, supplier, and
    parts relationships.
  - Users can create, update, and delete maintenance records.
- Entry points:
  - UI routes: `/maintenance`
  - API endpoints:
    - `GET /api/v1/maintenance`
    - `GET /api/v1/maintenance/{id}`
    - `POST /api/v1/maintenance`
    - `PUT /api/v1/maintenance/{id}`
    - `DELETE /api/v1/maintenance/{id}`
- Main files/modules involved:
  - `backend/app/api/v1/endpoints/maintenance.py`
  - `backend/app/models/maintenance.py`
  - `frontend/src/app/features/maintenance/**`
  - `frontend/src/app/core/services/maintenance.service.ts`
- Data entities involved:
  - `Maintenance`
  - `Vehicle`
  - `Supplier`
  - `Part`
- Existing tests:
  - No maintenance-specific tests were found.
- Known gaps or uncertainties:
  - Maintenance ownership/tenant scoping is not visible. `Needs confirmation`.
- Suggested Spec Kit spec name: `operations-maintenance-management`

## 6. Parts inventory management

- Feature name: Parts inventory management
- User or actor: Authenticated user
- Current behavior:
  - Users can list parts with pagination, search, and sorting.
  - Users can create, update, and delete part records.
  - Parts can be linked to maintenance, supplier, and invoice records.
- Entry points:
  - UI routes: `/parts`
  - API endpoints:
    - `GET /api/v1/parts`
    - `POST /api/v1/parts`
    - `PUT /api/v1/parts/{id}`
    - `DELETE /api/v1/parts/{id}`
- Main files/modules involved:
  - `backend/app/api/v1/endpoints/parts.py`
  - `backend/app/models/part.py`
  - `frontend/src/app/features/parts/**`
  - `frontend/src/app/core/services/part.service.ts`
- Data entities involved:
  - `Part`
  - `Supplier`
  - `Maintenance`
  - `Invoice`
- Existing tests:
  - No parts-specific tests were found.
- Known gaps or uncertainties:
  - Quantity is modeled as float; whether fractional quantities are intentional
    is `Needs confirmation`.
- Suggested Spec Kit spec name: `operations-parts-inventory`

## 7. Supplier management

- Feature name: Supplier management
- User or actor: Authenticated user
- Current behavior:
  - Users can list suppliers with pagination, search, and sorting.
  - Users can create, update, and delete suppliers.
  - Suppliers are referenced by maintenance, parts, and invoices.
- Entry points:
  - UI routes: `/suppliers`
  - API endpoints:
    - `GET /api/v1/suppliers`
    - `POST /api/v1/suppliers`
    - `PUT /api/v1/suppliers/{id}`
    - `DELETE /api/v1/suppliers/{id}`
- Main files/modules involved:
  - `backend/app/api/v1/endpoints/suppliers.py`
  - `backend/app/models/supplier.py`
  - `frontend/src/app/features/suppliers/**`
  - `frontend/src/app/core/services/supplier.service.ts`
- Data entities involved:
  - `Supplier`
  - related `Maintenance`, `Part`, `Invoice`
- Existing tests:
  - No supplier-specific tests were found.
- Known gaps or uncertainties:
  - No supplier ownership or data partitioning was visible. `Needs confirmation`.
- Suggested Spec Kit spec name: `operations-suppliers-management`

## 8. Invoice upload, extraction review, and approval

- Feature name: Invoice upload, extraction review, and approval
- User or actor: Authenticated user
- Current behavior:
  - Users can upload invoice files.
  - Backend stores uploaded files under `media/invoices`.
  - Upload schedules background Gemini extraction.
  - Invoices transition through `pending`, `processing`, `review`,
    `approved`, and `failed`.
  - Users can list invoices with filtering and sorting.
  - Users can read extracted data once the invoice reaches `review`.
  - Users can edit extracted data.
  - Users can reject for detailed reprocessing, retry failed processing, or
    approve to create supplier/maintenance/part records.
  - Users can delete invoices, with additional cleanup logic for approved
    invoices.
- Entry points:
  - UI routes:
    - `/invoices`
    - `/invoices/upload`
    - `/invoices/review/:id`
    - `/invoices/:id`
  - API endpoints:
    - `GET /api/v1/invoices`
    - `POST /api/v1/invoices/upload`
    - `GET /api/v1/invoices/{id}`
    - `GET /api/v1/invoices/{id}/extracted-data`
    - `PUT /api/v1/invoices/{id}/extracted-data`
    - `POST /api/v1/invoices/{id}/reject`
    - `POST /api/v1/invoices/{id}/retry`
    - `POST /api/v1/invoices/{id}/approve`
    - `DELETE /api/v1/invoices/{id}`
  - Jobs or events:
    - `process_invoice_background`
    - frontend invoice status polling every 2 seconds while pending/processing
- Main files/modules involved:
  - `backend/app/api/v1/endpoints/invoices.py`
  - `backend/app/services/invoice_service.py`
  - `backend/app/services/invoice_approval_service.py`
  - `backend/app/services/invoice_workflow_service.py`
  - `backend/app/core/storage.py`
  - `backend/app/core/gemini_service.py`
  - `backend/app/schemas/invoice_processing.py`
  - `backend/app/models/invoice.py`
  - `frontend/src/app/features/invoices/**`
  - `frontend/src/app/core/services/invoice.service.ts`
- Data entities involved:
  - `Invoice`
  - `Supplier`
  - `Maintenance`
  - `Part`
  - `Vehicle`
- Existing tests:
  - `backend/test_invoice_processing.py`
  - `backend/test_storage_service.py`
- Known gaps or uncertainties:
  - Approval/deletion logic contains comments describing assumptions about
    maintenance-to-invoice relationships rather than explicit constraints.
  - Real-world Gemini extraction accuracy and operating envelopes are external
    dependencies. `Needs confirmation`.
- Suggested Spec Kit spec name: `invoices-ai-processing-and-approval`

## 9. Track records and track/circuit browsing

- Feature name: Track records and track/circuit browsing
- User or actor: Authenticated user
- Current behavior:
  - Users can create, update, delete, and list track records for a vehicle.
  - Track records retain both `track_id` and legacy `circuit_name`.
  - The service layer auto-creates a normalized `Track` if needed.
  - Users can browse normalized track summaries and details.
  - Users can browse legacy circuit-name summaries and details.
  - Users can create tracks.
  - Users can request distinct organizer names from track records.
- Entry points:
  - UI routes:
    - `/tracks`
    - `/tracks/:id`
    - vehicle detail track-record components
  - API endpoints:
    - `GET /api/v1/vehicles/{vehicle_id}/track-records`
    - `POST /api/v1/vehicles/{vehicle_id}/track-records`
    - `PUT /api/v1/vehicles/track-records/{record_id}`
    - `DELETE /api/v1/vehicles/track-records/{record_id}`
    - `GET /api/v1/tracks`
    - `GET /api/v1/tracks/{track_id}`
    - `POST /api/v1/tracks`
    - `GET /api/v1/circuits`
    - `GET /api/v1/circuits/{circuit_name}`
    - `GET /api/v1/organizers`
  - CLI commands or jobs:
    - `backend/scripts/enrich_tracks_from_wikipedia.py`
- Main files/modules involved:
  - `backend/app/api/v1/endpoints/track_records.py`
  - `backend/app/api/v1/endpoints/tracks.py`
  - `backend/app/api/v1/endpoints/circuits.py`
  - `backend/app/api/v1/endpoints/organizers.py`
  - `backend/app/services/track_records_service.py`
  - `backend/app/services/tracks_service.py`
  - `backend/app/services/circuits_service.py`
  - `backend/app/models/track.py`
  - `backend/app/models/track_record.py`
  - `frontend/src/app/features/tracks/**`
  - `frontend/src/app/features/vehicles/components/track-records/**`
  - `frontend/src/app/features/tracks/tracks.service.ts`
  - `frontend/src/app/services/organizer.service.ts`
- Data entities involved:
  - `Track`
  - `TrackRecord`
  - `Vehicle`
- Existing tests:
  - No track-specific automated tests were found.
- Known gaps or uncertainties:
  - The application maintains both normalized and legacy circuit views; the
    authoritative long-term model is `Needs confirmation`.
  - Wikipedia enrichment exists as a manual script, not a runtime feature.
- Suggested Spec Kit spec name: `tracks-and-track-records`

## 10. Notifications and due-date reminders

- Feature name: Notifications and due-date reminders
- User or actor: Authenticated user
- Current behavior:
  - Users can list notifications scoped to the current user.
  - Users can mark notifications read or unread.
  - Users can trigger a due-date check that generates notifications for upcoming
    ITV, insurance, and road tax dates within 30 days.
  - Duplicate notifications for the same title are suppressed per day.
- Entry points:
  - UI routes: `/notifications`
  - API endpoints:
    - `GET /api/v1/notifications`
    - `PUT /api/v1/notifications/{id}/read`
    - `PUT /api/v1/notifications/{id}/unread`
    - `POST /api/v1/notifications/check`
- Main files/modules involved:
  - `backend/app/api/v1/endpoints/notifications.py`
  - `backend/app/models/notification.py`
  - `frontend/src/app/features/notifications/**`
  - `frontend/src/app/core/services/notification.service.ts`
- Data entities involved:
  - `Notification`
  - `Vehicle`
  - `User`
- Existing tests:
  - No notification-specific tests were found.
- Known gaps or uncertainties:
  - Notification generation is on-demand; no scheduler was found.
  - Automatic trigger strategy is `Needs confirmation`.
- Suggested Spec Kit spec name: `operations-notifications-reminders`

## 11. Vehicle document indexing, knowledge, and AI chat

- Feature name: Vehicle document indexing, knowledge, and AI chat
- User or actor: Authenticated user
- Current behavior:
  - Users can upload vehicle documents with typed categories.
  - Backend stores files under `media/vehicle-documents`.
  - Upload schedules background parsing/indexing.
  - Documents are parsed locally for text when possible, especially PDFs, and
    otherwise fall back to Gemini multimodal transcription.
  - Text is chunked and stored with pgvector embeddings.
  - When a Gemini key is available, knowledge facts are derived from document
    text and stored.
  - Users can list, edit, delete, and reindex documents.
  - Users can list, edit, and delete knowledge facts.
  - Users can ask questions against indexed material and receive answers with
    citations and used-document metadata.
  - Frontend includes voice-assist utilities and error states around the ask UI.
- Entry points:
  - UI routes:
    - vehicle detail AI/document components under `/vehicles/:id`
  - API endpoints:
    - `GET /api/v1/vehicles/{vehicle_id}/documents`
    - `POST /api/v1/vehicles/{vehicle_id}/documents/upload`
    - `PATCH /api/v1/vehicle-documents/{document_id}`
    - `DELETE /api/v1/vehicle-documents/{document_id}`
    - `POST /api/v1/vehicle-documents/{document_id}/reindex`
    - `GET /api/v1/vehicles/{vehicle_id}/knowledge`
    - `PATCH /api/v1/vehicle-knowledge/{fact_id}`
    - `DELETE /api/v1/vehicle-knowledge/{fact_id}`
    - `POST /api/v1/vehicles/{vehicle_id}/chat/ask`
  - Jobs or events:
    - `process_vehicle_document_background`
    - frontend voice activation / wake-phrase flow in vehicle docs AI component
- Main files/modules involved:
  - `backend/app/api/v1/endpoints/vehicle_rag.py`
  - `backend/app/services/vehicle_document_rag_service.py`
  - `backend/app/core/gemini_service.py`
  - `backend/app/core/storage.py`
  - `backend/app/models/vehicle_document.py`
  - `backend/app/models/vehicle_document_chunk.py`
  - `backend/app/models/vehicle_knowledge_fact.py`
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/**`
  - `frontend/src/app/core/services/vehicle-rag.service.ts`
- Data entities involved:
  - `VehicleDocument`
  - `VehicleDocumentChunk`
  - `VehicleKnowledgeFact`
  - `Vehicle`
  - related `Invoice` records may be included as chat sources
- Existing tests:
  - `backend/test_vehicle_document_rag_service.py`
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai.component.spec.ts`
  - `frontend/src/app/features/vehicles/components/vehicle-docs-ai/vehicle-docs-ai-voice.util.spec.ts`
- Known gaps or uncertainties:
  - Full retrieval quality and embedding semantics depend on external Gemini and
    pgvector behavior.
  - Whether invoice documents should always participate in vehicle chat is
    user-selectable in the frontend, but overall product intent is
    `Needs confirmation`.
- Suggested Spec Kit spec name: `vehicles-document-ai-assistant`

## 12. PWA installability, offline state, and update prompting

- Feature name: PWA installability, offline state, and update prompting
- User or actor: End user in a supported browser
- Current behavior:
  - Service worker is enabled outside dev mode.
  - The frontend watches connectivity changes and shows user feedback when
    moving offline or back online.
  - The frontend checks for service-worker updates and prompts the user to
    reload when a new version is ready.
  - The frontend logs installation completion and unrecoverable service-worker
    states.
- Entry points:
  - UI routes: cross-cutting, application-wide
  - Jobs or events:
    - browser `offline` and `online` events
    - `SwUpdate.versionUpdates`
    - browser `appinstalled` event
    - periodic update check every 6 hours
- Main files/modules involved:
  - `frontend/src/app/app.config.ts`
  - `frontend/src/app/core/services/pwa.service.ts`
  - `frontend/public/manifest.webmanifest`
  - `frontend/ngsw-config.json`
- Data entities involved:
  - none persisted in application domain tables
- Existing tests:
  - No PWA-specific automated tests were found.
- Known gaps or uncertainties:
  - Backend support for offline-first write queuing was not found.
  - Effective cached route/data scope is `Needs confirmation`.
- Suggested Spec Kit spec name: `platform-pwa-lifecycle`
