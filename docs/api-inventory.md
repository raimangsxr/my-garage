# API Inventory

## Backend HTTP surface

Base API prefix: `/api/v1`

Additional non-API routes:

- `GET /` returns `{"Hello": "World"}`
- `GET /health`
- `GET /healthz`
- static media mounted at `/media`
- legacy static media alias mounted at `/uploads`

## Authentication

### Auth

- `POST /api/v1/auth/login/access-token`
  - form login with username=email and password
- `POST /api/v1/auth/google/login`
  - Google credential validation and app JWT issuance
- `POST /api/v1/auth/password-recovery/{email}`
  - placeholder password recovery response

### User

- `GET /api/v1/users/me`
- `PUT /api/v1/users/me`
- `GET /api/v1/users/avatars`
- `POST /api/v1/users/me/password`

### Settings

- `GET /api/v1/settings`
- `PUT /api/v1/settings`

## Dashboard

- `GET /api/v1/dashboard/stats`

Returns aggregated counts and summaries for vehicles, maintenance, spend,
suppliers, and track/circuit activity.

## Vehicles

- `GET /api/v1/vehicles`
  - pagination via `skip`, `limit`
- `POST /api/v1/vehicles`
- `PUT /api/v1/vehicles/{id}`
- `DELETE /api/v1/vehicles/{id}`
- `POST /api/v1/vehicles/{id}/image`
- `GET /api/v1/vehicles/{id}/image`
- `GET /api/v1/vehicles/proxy-image?url=...`
- `GET /api/v1/vehicles/{id}/details`
- `PUT /api/v1/vehicles/{id}/specs/torque`

Notes:

- `details` returns a denormalized payload combining vehicle, specs,
  maintenances, parts, invoices, and track records.
- `proxy-image` fetches external image URLs server-side.

## Track records

- `GET /api/v1/vehicles/{vehicle_id}/track-records`
- `POST /api/v1/vehicles/{vehicle_id}/track-records`
- `PUT /api/v1/vehicles/track-records/{record_id}`
- `DELETE /api/v1/vehicles/track-records/{record_id}`

## Tracks and circuits

### Normalized tracks

- `GET /api/v1/tracks`
  - `skip`, `limit`, `q`, `only_active`, `sort_by`, `sort_dir`
- `GET /api/v1/tracks/{track_id}`
- `POST /api/v1/tracks`

### Legacy circuits

- `GET /api/v1/circuits`
  - `skip`, `limit`, `q`, `sort_by`, `sort_dir`
- `GET /api/v1/circuits/{circuit_name}`

### Organizers

- `GET /api/v1/organizers`

## Maintenance

- `GET /api/v1/maintenance`
  - `skip`, `limit`, `q`, `sort_by`, `sort_dir`
- `GET /api/v1/maintenance/{id}`
- `POST /api/v1/maintenance`
- `PUT /api/v1/maintenance/{id}`
- `DELETE /api/v1/maintenance/{id}`

## Parts

- `GET /api/v1/parts`
  - `skip`, `limit`, `q`, `sort_by`, `sort_dir`
- `POST /api/v1/parts`
- `PUT /api/v1/parts/{id}`
- `DELETE /api/v1/parts/{id}`

## Suppliers

- `GET /api/v1/suppliers`
  - `skip`, `limit`, `q`, `sort_by`, `sort_dir`
- `POST /api/v1/suppliers`
- `PUT /api/v1/suppliers/{id}`
- `DELETE /api/v1/suppliers/{id}`

## Invoices

- `GET /api/v1/invoices`
  - `skip`, `limit`, `q`, `status`, `sort_by`, `sort_dir`
- `POST /api/v1/invoices/upload`
  - multipart upload, optional `vehicle_id`
- `GET /api/v1/invoices/{id}`
- `GET /api/v1/invoices/{id}/extracted-data`
- `PUT /api/v1/invoices/{id}/extracted-data`
- `POST /api/v1/invoices/{id}/reject`
- `POST /api/v1/invoices/{id}/retry`
- `POST /api/v1/invoices/{id}/approve`
- `DELETE /api/v1/invoices/{id}`

Observed workflow:

1. upload file
2. background Gemini extraction
3. status changes to `review` on success
4. user reviews or edits extracted data
5. user approves, rejects for reprocess, retries failed processing, or deletes

## Notifications

- `GET /api/v1/notifications`
  - `skip`, `limit`
- `PUT /api/v1/notifications/{id}/read`
- `PUT /api/v1/notifications/{id}/unread`
- `POST /api/v1/notifications/check`

## Vehicle document AI / RAG

- `GET /api/v1/vehicles/{vehicle_id}/documents`
- `POST /api/v1/vehicles/{vehicle_id}/documents/upload`
  - multipart upload with `document_type` and optional `title`
- `PATCH /api/v1/vehicle-documents/{document_id}`
- `DELETE /api/v1/vehicle-documents/{document_id}`
- `POST /api/v1/vehicle-documents/{document_id}/reindex`
- `GET /api/v1/vehicles/{vehicle_id}/knowledge`
  - `include_hidden`
- `PATCH /api/v1/vehicle-knowledge/{fact_id}`
- `DELETE /api/v1/vehicle-knowledge/{fact_id}`
- `POST /api/v1/vehicles/{vehicle_id}/chat/ask`

Observed payload behaviors:

- supported document types:
  - `owner_manual`
  - `workshop_manual`
  - `invoice`
  - `insurance`
  - `registration`
  - `other`
- chat payload:
  - `question`
  - `source_scope` = `all_documents` or `manuals_only`
  - `include_invoice_docs`

## Frontend route inventory

- `/login`
- `/dashboard`
- `/vehicles`
- `/vehicles/:id`
- `/tracks`
- `/tracks/:id`
- `/maintenance`
- `/invoices/upload`
- `/invoices/review/:id`
- `/invoices/:id`
- `/invoices`
- `/suppliers`
- `/parts`
- `/profile`
- `/notifications`
- `/change-password`
- `/settings`

Route guards:

- authenticated shell uses `AuthGuard`
- login route uses `PublicOnlyGuard`

## Frontend service inventory

Observed frontend service wrappers for backend APIs:

- `AuthService`
- `GoogleAuthService`
- `UserService`
- `SettingsService`
- `VehicleService`
- `VehicleRagService`
- `MaintenanceService`
- `PartService`
- `SupplierService`
- `InvoiceService`
- `NotificationService`
- `DashboardService`
- `TracksService`
- `OrganizerService`

## Jobs, commands, and scripts

These are not HTTP APIs, but they are executable surfaces present in the repo:

- `backend/seed_admin_user.py`
- `backend/seed_notifications.py`
- `backend/scripts/enrich_tracks_from_wikipedia.py`
- `backend/list_models.py`
- `backend/verify_settings.py`

`Needs confirmation`: whether these scripts are expected to be run in production,
development only, or retained solely for manual troubleshooting.
