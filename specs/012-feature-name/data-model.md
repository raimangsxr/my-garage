# Data Model: Brownfield SDD Migration

## Purpose

This data model captures the existing persisted entities, relationships, and
state transitions that the brownfield baseline spec governs. It is descriptive
only and does not introduce schema changes.

## Identity And Settings

### User

- Fields: `id`, `email`, `full_name`, `hashed_password`, `is_active`,
  `is_superuser`, `image_binary`
- Relationships:
  - optional one-to-one `Settings`
- Requirement mapping:
  - FR-001 authentication and protected access
  - FR-002 profile behavior
  - FR-008 notification ownership

### Settings

- Fields: `id`, `user_id`, `language`, `currency`, `theme`,
  `notifications_enabled`, `google_client_id`, `gemini_api_key`
- Relationships:
  - belongs to `User`
- Requirement mapping:
  - FR-002 profile and settings
- Notes:
  - one of the few clearly user-scoped tables in current evidence

### GoogleAuthToken

- Fields: `id`, `user_id`, `google_id`, `email`, `name`, `picture`,
  `access_token`, `refresh_token`, `token_expires_at`, `created_at`,
  `updated_at`
- Relationships:
  - belongs to Google-linked `User`
- Requirement mapping:
  - FR-001 Google login behavior

## Garage Domain

### Vehicle

- Fields: `id`, `brand`, `model`, `year`, `license_plate`, `kilometers`,
  `usage_type`, `next_itv_date`, `next_insurance_date`,
  `last_insurance_amount`, `next_road_tax_date`, `last_road_tax_amount`,
  `image_binary`
- Relationships:
  - one-to-many `Maintenance`
  - one-to-one `VehicleSpecs`
  - one-to-many `TrackRecord`
  - one-to-many `Invoice`
  - one-to-many `VehicleDocument`
  - one-to-many `VehicleKnowledgeFact`
- Requirement mapping:
  - FR-003 dashboard
  - FR-004 vehicle management
  - FR-008 reminders
- Notes:
  - current evidence does not prove per-user ownership scoping

### VehicleSpecs

- Fields: `id`, `vehicle_id`, vehicle identification and technical fields,
  `torque_specs`
- Relationships:
  - belongs to `Vehicle`
- Requirement mapping:
  - FR-004 vehicle specs and torque behavior

### Maintenance

- Fields: `id`, `date`, `description`, `mileage`, `cost`, `vehicle_id`,
  `supplier_id`
- Relationships:
  - belongs to `Vehicle`
  - belongs to `Supplier`
  - one-to-many `Part`
- Requirement mapping:
  - FR-003 dashboard summaries
  - FR-005 maintenance behavior
  - FR-006 invoice approval side effects

### Part

- Fields: `id`, `name`, `reference`, `price`, `quantity`, `maintenance_id`,
  `supplier_id`, `invoice_id`
- Relationships:
  - optional belongs to `Maintenance`
  - optional belongs to `Supplier`
  - optional belongs to `Invoice`
- Requirement mapping:
  - FR-005 parts behavior
  - FR-006 invoice approval side effects
- Notes:
  - `quantity` is currently modeled as float

### Supplier

- Fields: `id`, `name`, `email`, `phone`, `address`, `tax_id`
- Relationships:
  - one-to-many `Maintenance`
  - one-to-many `Part`
  - one-to-many `Invoice`
- Requirement mapping:
  - FR-003 dashboard summaries
  - FR-005 supplier behavior
  - FR-006 invoice approval side effects

## Invoices And Notifications

### Invoice

- Fields: `id`, `number`, `date`, `amount`, `tax_amount`, `file_url`,
  `file_name`, `status`, `extracted_data`, `error_message`, `vehicle_id`,
  `supplier_id`
- Relationships:
  - optional belongs to `Vehicle`
  - optional belongs to `Supplier`
  - one-to-many `Part`
- Requirement mapping:
  - FR-004 vehicle details
  - FR-006 invoice workflow
  - FR-009 background processing
- State transitions:
  - `pending` -> `processing` -> `review` -> `approved`
  - `pending` or `processing` -> `failed`
  - `failed` -> retry path back into processing
  - `review` -> reject path for reprocessing
- Notes:
  - `extracted_data` is stored as serialized JSON text

### Notification

- Fields: `id`, `title`, `message`, `type`, `is_read`, `created_at`, `user_id`
- Relationships:
  - optional belongs to `User`
- Requirement mapping:
  - FR-008 notifications
- Notes:
  - current evidence shows on-demand generation only

## Tracks And Performance

### Track

- Fields: `id`, `name`, `location`, `length_meters`, `description`, `image_url`
- Relationships:
  - one-to-many `TrackRecord`
- Requirement mapping:
  - FR-005 tracks and circuits

### TrackRecord

- Fields: `id`, `vehicle_id`, `track_id`, `circuit_name`, `best_lap_time`,
  `date_achieved`, `weather_conditions`, `tire_compound`, `group`, `organizer`,
  `notes`
- Relationships:
  - belongs to `Vehicle`
  - optional belongs to `Track`
- Requirement mapping:
  - FR-003 dashboard summaries
  - FR-005 track records
- Notes:
  - normalized `track_id` and legacy `circuit_name` both remain part of current
    behavior

## Vehicle Document Knowledge

### VehicleDocument

- Fields: `id`, `vehicle_id`, `title`, `document_type`, `mime_type`, `file_url`,
  `file_name`, `status`, `included_in_rag`, `deletion_requested`,
  `extracted_text`, `error_message`, `chunk_count`, `processing_progress`,
  `processing_stage`, `processing_detail`, `indexed_at`, `created_at`,
  `updated_at`
- Relationships:
  - belongs to `Vehicle`
  - one-to-many `VehicleDocumentChunk`
  - one-to-many `VehicleKnowledgeFact`
- Requirement mapping:
  - FR-007 vehicle-document workflow
  - FR-009 background processing
- State transitions:
  - `uploaded` -> `indexing` -> `ready`
  - `uploaded` or `indexing` -> `failed`

### VehicleDocumentChunk

- Fields: `id`, `document_id`, `vehicle_id`, `chunk_index`, `page_number`,
  `source_label`, `content`, `embedding`
- Relationships:
  - belongs to `VehicleDocument`
  - optional relation to `Vehicle`
- Requirement mapping:
  - FR-007 question-answering over indexed materials

### VehicleKnowledgeFact

- Fields: `id`, `vehicle_id`, `document_id`, `title`, `category`, `content`,
  `source_excerpt`, `confidence`, `is_hidden`, `created_at`
- Relationships:
  - belongs to `Vehicle`
  - optional belongs to `VehicleDocument`
- Requirement mapping:
  - FR-007 derived knowledge behavior

## Cross-Cutting Data Risks

- Most business tables do not include explicit `user_id`; ownership scoping
  remains `Needs confirmation`
- Images are split across two storage patterns: binary columns for users and
  vehicles, filesystem media for invoices and vehicle documents
- AI-assisted lifecycle states and derived data depend partly on external model
  behavior and remain only partially covered by automated tests
