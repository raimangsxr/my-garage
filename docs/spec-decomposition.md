# Spec Decomposition

This document proposes a decomposition of the current brownfield system into
smaller Spec Kit specifications for gradual SDD migration.

Sources used:

- `docs/feature-inventory.md`
- `specs/000-current-system-baseline/spec.md`
- supporting research references already cited by those artifacts

The goal is to define manageable spec boundaries around existing behavior only.
No individual specs are created here.

## Decomposition Principles

- Keep each proposed spec aligned to an existing functional area already
  evidenced in the codebase.
- Split high-risk or behaviorally dense areas, such as AI-assisted invoice and
  vehicle-document flows, into standalone specs.
- Group low-risk, tightly related user-facing behavior where separation would
  create unnecessary overlap.
- Preserve current-system ambiguities as migration risks rather than resolving
  them here.

## Proposed Specs

## Spec 001

- Spec ID: `001`
- Spec name: `identity-auth-and-session`
- Functional scope:
  - Current login and session behavior for email/password and Google-based sign
    in
  - Protected-route access model
  - Password recovery placeholder behavior
- Actors:
  - End user
  - End user using Google sign-in
- Included existing behavior:
  - Email/password access token login
  - Google credential login to app JWT
  - JWT-gated authenticated application access
  - Password recovery endpoint returning current placeholder response
- Excluded behavior:
  - User profile editing
  - Per-user settings management
  - Non-authenticated marketing or onboarding flows not evidenced in code
- Source evidence from research docs:
  - `docs/feature-inventory.md` section 1
  - `specs/000-current-system-baseline/spec.md` FR-001
  - `docs/api-inventory.md` authentication section
  - `docs/codebase-research.md` authentication and authorization section
- Risk level: `High`
- Suggested priority for SDD migration: `P1`

## Spec 002

- Spec ID: `002`
- Spec name: `identity-profile-and-settings`
- Functional scope:
  - Current user profile read/update behavior
  - Password change behavior
  - Per-user settings and personal configuration
- Actors:
  - Authenticated user
- Included existing behavior:
  - Read current user profile
  - Update full name
  - Update avatar via data URL or remote URL
  - Change password
  - Read and update settings
  - Auto-create default settings on first access
- Excluded behavior:
  - Initial authentication
  - Role/permission models beyond current-user account behavior
  - Notification generation logic beyond user preference storage
- Source evidence from research docs:
  - `docs/feature-inventory.md` section 2
  - `specs/000-current-system-baseline/spec.md` FR-002
  - `docs/domain-inventory.md` identity and access section
  - `docs/api-inventory.md` user and settings sections
- Risk level: `Medium`
- Suggested priority for SDD migration: `P2`

## Spec 003

- Spec ID: `003`
- Spec name: `operations-dashboard`
- Functional scope:
  - Current dashboard summary behavior and aggregated read-only reporting
- Actors:
  - Authenticated user
- Included existing behavior:
  - Vehicle totals
  - Scheduled maintenance count
  - Total spend summary
  - Recent maintenance activity
  - Monthly cost trend
  - Supplier totals
  - Track/circuit summary metrics
- Excluded behavior:
  - Underlying CRUD flows for vehicles, maintenance, suppliers, or track data
  - Historical reporting outside current dashboard output
- Source evidence from research docs:
  - `docs/feature-inventory.md` section 3
  - `specs/000-current-system-baseline/spec.md` FR-003
  - `docs/api-inventory.md` dashboard section
- Risk level: `Low`
- Suggested priority for SDD migration: `P3`

## Spec 004

- Spec ID: `004`
- Spec name: `vehicles-management-and-specs`
- Functional scope:
  - Current vehicle CRUD
  - Vehicle images
  - Vehicle technical specifications
  - Torque specifications
  - Vehicle detail aggregate view
- Actors:
  - Authenticated user
- Included existing behavior:
  - Create, read, update, delete, and list vehicles
  - Upload and retrieve vehicle images
  - Read denormalized vehicle detail payload
  - Maintain vehicle specs and torque specs
  - Existing reminder-related vehicle date fields
- Excluded behavior:
  - Track record CRUD details
  - Invoice processing workflow
  - Vehicle document AI behavior
  - Notification generation logic
- Source evidence from research docs:
  - `docs/feature-inventory.md` section 4
  - `specs/000-current-system-baseline/spec.md` FR-004
  - `docs/data-model-inventory.md` vehicle and vehicle specs sections
  - `docs/api-inventory.md` vehicles section
- Risk level: `High`
- Suggested priority for SDD migration: `P1`

## Spec 005

- Spec ID: `005`
- Spec name: `operations-maintenance-management`
- Functional scope:
  - Current maintenance record lifecycle
- Actors:
  - Authenticated user
- Included existing behavior:
  - List, search, sort, read, create, update, and delete maintenance records
  - Current linked relationships to vehicles, suppliers, and parts in returned
    views
- Excluded behavior:
  - Parts inventory management outside maintenance references
  - Supplier management outside maintenance references
  - Invoice approval side effects that create maintenance records
- Source evidence from research docs:
  - `docs/feature-inventory.md` section 5
  - `specs/000-current-system-baseline/spec.md` FR-005
  - `docs/api-inventory.md` maintenance section
  - `docs/data-model-inventory.md` maintenance section
- Risk level: `Medium`
- Suggested priority for SDD migration: `P2`

## Spec 006

- Spec ID: `006`
- Spec name: `operations-parts-and-suppliers`
- Functional scope:
  - Current part inventory and supplier management behavior
- Actors:
  - Authenticated user
- Included existing behavior:
  - Part list/create/update/delete behavior
  - Supplier list/create/update/delete behavior
  - Existing part links to maintenance, supplier, and invoice records
  - Existing supplier links to maintenance, parts, and invoices
- Excluded behavior:
  - Maintenance record CRUD
  - Invoice extraction and approval workflow
  - Dashboard aggregation
- Source evidence from research docs:
  - `docs/feature-inventory.md` sections 6 and 7
  - `specs/000-current-system-baseline/spec.md` FR-005
  - `docs/domain-inventory.md` maintenance and parts / suppliers sections
  - `docs/api-inventory.md` parts and suppliers sections
- Risk level: `Medium`
- Suggested priority for SDD migration: `P2`

## Spec 007

- Spec ID: `007`
- Spec name: `invoices-ai-processing-and-approval`
- Functional scope:
  - Current invoice upload, extraction, review, approval, retry, reject, and
    delete behavior
- Actors:
  - Authenticated user
  - Operator / Maintainer
- Included existing behavior:
  - Invoice upload and file storage
  - Background extraction lifecycle
  - Current invoice states
  - Review and edit of extracted data
  - Approve into supplier, maintenance, and part records
  - Retry failed processing
  - Reject for detailed reprocessing
  - Delete invoice and current cleanup behavior
- Excluded behavior:
  - Generic vehicle document knowledge chat
  - Maintenance CRUD unrelated to invoice approval side effects
  - Track and dashboard behavior
- Source evidence from research docs:
  - `docs/feature-inventory.md` section 8
  - `specs/000-current-system-baseline/spec.md` FR-006 and FR-010
  - `docs/api-inventory.md` invoices section
  - `docs/test-inventory.md` invoice-related tests
  - `docs/data-model-inventory.md` invoice section
- Risk level: `High`
- Suggested priority for SDD migration: `P1`

## Spec 008

- Spec ID: `008`
- Spec name: `tracks-and-track-records`
- Functional scope:
  - Current vehicle track records
  - Current normalized track catalog
  - Current legacy circuit views
  - Organizer list behavior
- Actors:
  - Authenticated user
  - Operator / Maintainer
- Included existing behavior:
  - Create, update, delete, and list track records per vehicle
  - View track summaries and track details
  - Create normalized tracks
  - View circuit summaries and circuit details based on legacy naming
  - List distinct organizer names
  - Manual enrichment script existence for track metadata
- Excluded behavior:
  - Vehicle core CRUD
  - Dashboard metrics that consume track data
  - Vehicle document AI behavior
- Source evidence from research docs:
  - `docs/feature-inventory.md` section 9
  - `specs/000-current-system-baseline/spec.md` FR-007
  - `docs/api-inventory.md` tracks and circuits section
  - `docs/domain-inventory.md` tracks, circuits, and track records section
- Risk level: `High`
- Suggested priority for SDD migration: `P2`

## Spec 009

- Spec ID: `009`
- Spec name: `operations-notifications-reminders`
- Functional scope:
  - Current per-user notification behavior and due-date reminder generation
- Actors:
  - Authenticated user
- Included existing behavior:
  - List notifications
  - Mark notification read
  - Mark notification unread
  - Trigger on-demand due-date notification generation for ITV, insurance, and
    road tax
- Excluded behavior:
  - Settings preference capture beyond what already exists in account settings
  - Background scheduling not evidenced in the system
- Source evidence from research docs:
  - `docs/feature-inventory.md` section 10
  - `specs/000-current-system-baseline/spec.md` FR-008
  - `docs/api-inventory.md` notifications section
  - `docs/data-model-inventory.md` notification section
- Risk level: `Medium`
- Suggested priority for SDD migration: `P3`

## Spec 010

- Spec ID: `010`
- Spec name: `vehicles-document-ai-assistant`
- Functional scope:
  - Current vehicle document upload and indexing
  - Derived vehicle knowledge facts
  - Vehicle document question answering
  - Current document-management lifecycle
- Actors:
  - Authenticated user
  - Operator / Maintainer
- Included existing behavior:
  - Upload supported vehicle documents
  - Track document indexing lifecycle
  - Reindex documents
  - Delete documents
  - List and update knowledge facts
  - Ask questions against indexed vehicle documentation
  - Existing citation and fallback response behavior
  - Existing UI voice-assist behavior around the ask experience
- Excluded behavior:
  - Invoice extraction workflow
  - Core vehicle CRUD outside vehicle-detail context
  - PWA lifecycle behavior unrelated to the AI assistant
- Source evidence from research docs:
  - `docs/feature-inventory.md` section 11
  - `specs/000-current-system-baseline/spec.md` FR-009, FR-010, and FR-012
  - `docs/api-inventory.md` vehicle document AI / RAG section
  - `docs/test-inventory.md` vehicle document AI tests
  - `docs/data-model-inventory.md` vehicle document, chunk, and knowledge fact
    sections
- Risk level: `High`
- Suggested priority for SDD migration: `P1`

## Spec 011

- Spec ID: `011`
- Spec name: `platform-pwa-lifecycle`
- Functional scope:
  - Current installability, offline, and update prompting behavior in the
    frontend application shell
- Actors:
  - End user in a supported browser
- Included existing behavior:
  - Service worker registration in non-dev mode
  - Offline and online user feedback
  - Update checks and reload prompt behavior
  - Installation-complete feedback
- Excluded behavior:
  - Business-domain CRUD flows
  - Backend health or deployment behavior
  - Notification domain records
- Source evidence from research docs:
  - `docs/feature-inventory.md` section 12
  - `specs/000-current-system-baseline/spec.md` FR-010 and FR-012
  - `docs/codebase-research.md` background processes and external integrations
- Risk level: `Low`
- Suggested priority for SDD migration: `P4`

## Recommended Migration Order

Suggested SDD migration order based on current complexity, coupling, and change
risk:

1. `001 identity-auth-and-session`
2. `004 vehicles-management-and-specs`
3. `007 invoices-ai-processing-and-approval`
4. `010 vehicles-document-ai-assistant`
5. `002 identity-profile-and-settings`
6. `005 operations-maintenance-management`
7. `006 operations-parts-and-suppliers`
8. `008 tracks-and-track-records`
9. `003 operations-dashboard`
10. `009 operations-notifications-reminders`
11. `011 platform-pwa-lifecycle`

## Cross-Spec Risks

- **User scoping ambiguity**:
  - Multiple business domains do not visibly scope records per user.
  - Affects specs `004`, `005`, `006`, `007`, `008`, `009`, and `010`.
  - Source evidence:
    - `docs/codebase-research.md`
    - `docs/feature-inventory.md`
- **AI and external dependency reliance**:
  - Invoice extraction and vehicle document assistant depend on external Gemini
    behavior and configuration.
  - Affects specs `007` and `010`.
  - Source evidence:
    - `docs/codebase-research.md`
    - `docs/test-inventory.md`
- **Mixed normalized and legacy data views**:
  - Tracks and circuits currently coexist as separate views over related data.
  - Affects spec `008` and dashboard dependencies in `003`.
  - Source evidence:
    - `docs/feature-inventory.md`
    - `docs/domain-inventory.md`
- **Sparse automated coverage in most CRUD domains**:
  - Many proposed specs have little or no dedicated automated test coverage.
  - Affects nearly all specs except the AI-heavy areas with existing tests.
  - Source evidence:
    - `docs/test-inventory.md`
