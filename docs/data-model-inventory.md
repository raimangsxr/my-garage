# Data Model Inventory

## Persistence overview

- ORM: SQLModel on top of SQLAlchemy
- database URL provided through `DATABASE_URL`
- engine created in `backend/app/database.py`
- Alembic migration history present in `backend/alembic/versions`
- pgvector registration occurs on DB connect

Persistence pattern:

- endpoint handlers frequently query with `Session` directly
- some richer domains use dedicated services
- there is no repository abstraction layer in the current codebase

## Core entities

## User

Table/model: `User`

Key fields:

- `id`
- `email` unique/indexed
- `full_name`
- `hashed_password`
- `is_active`
- `is_superuser`
- `image_binary`

Relationships:

- one-to-one optional `settings`

Notes:

- avatar image is stored as binary in the database

## Settings

Table/model: `Settings`

Key fields:

- `id`
- `user_id` unique FK to `user`
- `language`
- `currency`
- `theme`
- `notifications_enabled`
- `google_client_id`
- `gemini_api_key`

Relationships:

- belongs to `User`

Notes:

- this is one of the few clearly per-user domain tables

## GoogleAuthToken

Table/model: `GoogleAuthToken`

Key fields:

- `id`
- `user_id`
- `google_id` unique/indexed
- `email`
- `name`
- `picture`
- `access_token`
- `refresh_token`
- `token_expires_at`
- `created_at`
- `updated_at`

Purpose:

- stores Google login metadata and token material

## Vehicle

Table/model: `Vehicle`

Key fields:

- `id`
- `brand`
- `model`
- `year`
- `license_plate` unique/indexed
- `kilometers`
- `usage_type`
- `next_itv_date`
- `next_insurance_date`
- `last_insurance_amount`
- `next_road_tax_date`
- `last_road_tax_amount`
- `image_binary`

Relationships:

- one-to-many `maintenances`
- one-to-one `specs`
- one-to-many `track_records`
- one-to-many `invoices`
- one-to-many `documents`
- one-to-many `knowledge_facts`

## VehicleSpecs

Table/model: `VehicleSpecs`

Key fields:

- `id`
- `vehicle_id` unique FK
- identification and technical fields such as `vin`, `engine_type`,
  `fuel_type`, `transmission`, `horsepower`, `torque`, `drivetrain`, `weight`
- consumable fields such as `engine_oil_type`, `coolant_type`, `battery_type`,
  `tire_size`
- `torque_specs` JSON

Relationships:

- belongs to `Vehicle`

## Supplier

Table/model: `Supplier`

Key fields:

- `id`
- `name` indexed
- `email`
- `phone`
- `address`
- `tax_id`

Relationships:

- one-to-many `maintenances`
- one-to-many `parts`
- one-to-many `invoices`

## Maintenance

Table/model: `Maintenance`

Key fields:

- `id`
- `date` indexed
- `description`
- `mileage`
- `cost`
- `vehicle_id`
- `supplier_id`

Relationships:

- belongs to `Vehicle`
- belongs to `Supplier`
- one-to-many `parts`

## Part

Table/model: `Part`

Key fields:

- `id`
- `name`
- `reference`
- `price`
- `quantity` float
- `maintenance_id`
- `supplier_id`
- `invoice_id`

Relationships:

- optional belongs to `Maintenance`
- optional belongs to `Supplier`
- optional belongs to `Invoice`

Notes:

- quantity is modeled as float, not integer

## Invoice

Table/model: `Invoice`

Key fields:

- `id`
- `number`
- `date` indexed
- `amount`
- `tax_amount`
- `file_url`
- `file_name`
- `status`
- `extracted_data`
- `error_message`
- `vehicle_id`
- `supplier_id`

Relationships:

- optional belongs to `Vehicle`
- optional belongs to `Supplier`
- one-to-many `parts`

Observed status lifecycle:

- `pending`
- `processing`
- `review`
- `approved`
- `failed`

Notes:

- `extracted_data` is stored as serialized JSON text rather than normalized
  relational data

## Notification

Table/model: `Notification`

Key fields:

- `id`
- `title`
- `message`
- `type`
- `is_read`
- `created_at`
- `user_id`

Relationships:

- optional belongs to `User`

Observed notification types:

- `ITV`
- `INSURANCE`
- `TAX`
- `GENERAL`

## Track

Table/model: `Track`

Key fields:

- `id`
- `name` unique/indexed
- `location`
- `length_meters`
- `description`
- `image_url`

Relationships:

- one-to-many `track_records`

## TrackRecord

Table/model: `TrackRecord`

Key fields:

- `id`
- `vehicle_id`
- `track_id`
- `circuit_name`
- `best_lap_time`
- `date_achieved` indexed
- `weather_conditions`
- `tire_compound`
- `group`
- `organizer`
- `notes`

Relationships:

- belongs to `Vehicle`
- optional belongs to `Track`

Notes:

- both normalized `track_id` and legacy `circuit_name` are retained

## VehicleDocument

Table/model: `VehicleDocument`

Key fields:

- `id`
- `vehicle_id`
- `title`
- `document_type`
- `mime_type`
- `file_url`
- `file_name`
- `status`
- `included_in_rag`
- `deletion_requested`
- `extracted_text`
- `error_message`
- `chunk_count`
- `processing_progress`
- `processing_stage`
- `processing_detail`
- `indexed_at`
- `created_at`
- `updated_at`

Relationships:

- belongs to `Vehicle`
- one-to-many `chunks`
- one-to-many `knowledge_facts`

Observed status lifecycle:

- `uploaded`
- `indexing`
- `ready`
- `failed`

## VehicleDocumentChunk

Table/model: `VehicleDocumentChunk`

Key fields:

- `id`
- `document_id`
- `vehicle_id`
- `chunk_index`
- `page_number`
- `source_label`
- `content`
- `embedding` vector(256)

Relationships:

- belongs to `VehicleDocument`
- optional relation to `Vehicle`

Notes:

- pgvector stores embeddings in-database

## VehicleKnowledgeFact

Table/model: `VehicleKnowledgeFact`

Key fields:

- `id`
- `vehicle_id`
- `document_id`
- `title`
- `category`
- `content`
- `source_excerpt`
- `confidence`
- `is_hidden`
- `created_at`

Relationships:

- optional belongs to `VehicleDocument`
- belongs to `Vehicle`

## Migration themes inferred from Alembic history

Migration filenames show the following evolution themes:

- initial core garage entities
- user model introduction
- vehicle image storage changes
- settings table and per-user API keys
- invoice processing and Google auth support
- track normalization plus backfill from legacy circuit names
- performance/compound indexes
- vehicle document RAG tables and pgvector migration

`Needs confirmation`: the exact live schema in each deployed environment depends
on which Alembic revisions have been applied.

## Query and persistence patterns

- pagination commonly uses `skip` and `limit`
- list endpoints often emit `X-Total-Count`
- eager loading is used selectively with `selectinload`
- service-level write orchestration exists for invoices and document RAG
- no repository classes were found

## Data-model risks and unknowns

- Most business tables do not include `user_id`; multi-user ownership semantics
  are unclear. `Needs confirmation`.
- Invoice extracted data is partly normalized only after approval; before that it
  lives inside a JSON string field.
- Vehicle and user images are stored in DB binaries, while invoices and vehicle
  documents are stored on disk.
- Track modeling is partly normalized and partly legacy due to retained
  `circuit_name`.
