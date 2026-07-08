# Current HTTP Surface Contract

## Purpose

This contract describes the currently observed externally visible application
surface governed by the brownfield baseline spec. It is descriptive only and
does not introduce new APIs.

## Authentication And Session

- `POST /api/v1/auth/login/access-token`
- `POST /api/v1/auth/google/login`
- `POST /api/v1/auth/password-recovery/{email}`
- Frontend route: `/login`
- Characterization coverage:
  - `backend/test_auth_endpoints.py`
  - `frontend/src/app/core/guards/auth.guard.spec.ts`
  - `frontend/src/app/core/guards/public-only.guard.spec.ts`
  - `frontend/src/app/core/interceptors/auth.interceptor.spec.ts`

## User And Settings

- `GET /api/v1/users/me`
- `PUT /api/v1/users/me`
- `GET /api/v1/users/avatars`
- `POST /api/v1/users/me/password`
- `GET /api/v1/settings`
- `PUT /api/v1/settings`
- Frontend routes: `/profile`, `/change-password`, `/settings`
- Characterization coverage:
  - `backend/test_identity_profile_settings.py`

## Dashboard

- `GET /api/v1/dashboard/stats`
- Frontend route: `/dashboard`

## Vehicles And Related Views

- `GET /api/v1/vehicles`
- `POST /api/v1/vehicles`
- `PUT /api/v1/vehicles/{id}`
- `DELETE /api/v1/vehicles/{id}`
- `POST /api/v1/vehicles/{id}/image`
- `GET /api/v1/vehicles/{id}/image`
- `GET /api/v1/vehicles/proxy-image?url=...`
- `GET /api/v1/vehicles/{id}/details`
- `PUT /api/v1/vehicles/{id}/specs/torque`
- Frontend routes: `/vehicles`, `/vehicles/:id`

## Maintenance, Parts, Suppliers, Tracks, And Records

- `GET /api/v1/maintenance`
- `GET /api/v1/maintenance/{id}`
- `POST /api/v1/maintenance`
- `PUT /api/v1/maintenance/{id}`
- `DELETE /api/v1/maintenance/{id}`
- `GET /api/v1/parts`
- `POST /api/v1/parts`
- `PUT /api/v1/parts/{id}`
- `DELETE /api/v1/parts/{id}`
- `GET /api/v1/suppliers`
- `POST /api/v1/suppliers`
- `PUT /api/v1/suppliers/{id}`
- `DELETE /api/v1/suppliers/{id}`
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
- Frontend routes: `/maintenance`, `/parts`, `/suppliers`, `/tracks`,
  `/tracks/:id`

## Invoices

- `GET /api/v1/invoices`
- `POST /api/v1/invoices/upload`
- `GET /api/v1/invoices/{id}`
- `GET /api/v1/invoices/{id}/extracted-data`
- `PUT /api/v1/invoices/{id}/extracted-data`
- `POST /api/v1/invoices/{id}/reject`
- `POST /api/v1/invoices/{id}/retry`
- `POST /api/v1/invoices/{id}/approve`
- `DELETE /api/v1/invoices/{id}`
- Frontend routes: `/invoices`, `/invoices/upload`, `/invoices/review/:id`,
  `/invoices/:id`
- Contract note:
  - current frontend behavior polls invoice state every 2 seconds while status
    remains `pending` or `processing`

## Notifications

- `GET /api/v1/notifications`
- `PUT /api/v1/notifications/{id}/read`
- `PUT /api/v1/notifications/{id}/unread`
- `POST /api/v1/notifications/check`
- Frontend route: `/notifications`
- Contract note:
  - reminder generation is currently on-demand through the `check` endpoint
- Characterization coverage:
  - `backend/test_notification_endpoints.py`

## Vehicle Document AI

- `GET /api/v1/vehicles/{vehicle_id}/documents`
- `POST /api/v1/vehicles/{vehicle_id}/documents/upload`
- `PATCH /api/v1/vehicle-documents/{document_id}`
- `DELETE /api/v1/vehicle-documents/{document_id}`
- `POST /api/v1/vehicle-documents/{document_id}/reindex`
- `GET /api/v1/vehicles/{vehicle_id}/knowledge`
- `PATCH /api/v1/vehicle-knowledge/{fact_id}`
- `DELETE /api/v1/vehicle-knowledge/{fact_id}`
- `POST /api/v1/vehicles/{vehicle_id}/chat/ask`
- Frontend surface:
  - vehicle detail AI and document workflows under `/vehicles/:id`
- Contract notes:
  - `source_scope` currently supports `all_documents` and `manuals_only`
  - invoice documents join vehicle-chat scope only when explicitly requested
    through `include_invoice_docs`

## Platform And Miscellaneous Surface

- `GET /`
- `GET /health`
- `GET /healthz`
- static media mounted at `/media`
- legacy static media mounted at `/uploads`
- PWA lifecycle behavior is surfaced through service-worker update and
  connectivity handling in the frontend
