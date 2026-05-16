# Índice de Specs

Este índice es el registro vivo de iniciativas SDD del proyecto.

| Spec | Estado | Tipo | Fecha | Resumen |
| --- | --- | --- | --- | --- |
| [Institucionalizar SDD](./2026-05-04-institutionalize-sdd/spec.md) | Implemented | docs/process | 2026-05-04 | Hace obligatorio SDD para cualquier feature o cambio relevante. |
| [Documentar Features Legacy](./2026-05-04-document-legacy-features/spec.md) | Implemented | docs/process | 2026-05-04 | Crea baseline SDD retrospectiva de capacidades existentes. |
| [Homogeneizar Interfaz y Sistema de Diseño](./2026-05-04-interface-system-homogenization/spec.md) | Implemented | docs/refactor-ui | 2026-05-04 | Audita UI, amplía `system.md` y define fases de homogeneización. |
| [Remediar Gaps de Estandarización](./2026-05-05-standardization-gap-remediation/spec.md) | Implemented | refactor/ui | 2026-05-05 | Ejecuta la fase principal de estandarización de tokens, accesibilidad y patrones compartidos. |
| [Cerrar Segunda Ronda de Estandarización](./2026-05-07-standardization-round-2/spec.md) | Implemented | refactor | 2026-05-07 | Cierra consistencia backend, accesibilidad residual y estados documentales SDD. |
| [Corregir Tarjetas Vacías en Detalle de Vehículo](./2026-05-07-fix-vehicle-detail-entity-cards/spec.md) | Implemented | hotfix | 2026-05-07 | Corrige la renderización de parts e invoices y habilita edición de parts desde vehicle detail. |
| [Corregir Shell y Redirecciones de Autenticación](./2026-05-07-fix-auth-shell-routing/spec.md) | In Progress | hotfix | 2026-05-07 | Evita mostrar login dentro de la shell y redirige `/login` a `dashboard` cuando hay sesión válida. |
| [RAG de Documentación de Vehículo](./2026-05-09-vehicle-document-rag/spec.md) | Implemented | feature | 2026-05-09 | Añade biblioteca documental por vehículo, conocimiento derivado y chat con citas sobre la documentación. |
| [Añadir Manifests Kubernetes Base](./2026-05-09-k8s-deployment-manifests/spec.md) | In Progress | chore | 2026-05-09 | Versiona manifests base para desplegar My Garage en Kubernetes con media persistente. |
| [Unificar Storage Backend en Media](./2026-05-09-backend-media-storage/spec.md) | In Progress | refactor | 2026-05-09 | Alinea uploads documentales del backend con `media/` y mantiene compatibilidad con rutas legacy. |
| [Migrar empaquetado del backend a pyproject.toml](./2026-05-11-backend-pyproject-migration/spec.md) | Implemented | chore | 2026-05-11 | Unifica dependencias del backend en `pyproject.toml` para alinear local, tests y Docker. |
| [Corregir instalación de dependencias del backend en Docker](./2026-05-12-backend-docker-deps-hotfix/spec.md) | Implemented | hotfix | 2026-05-12 | Corrige el toolchain de la imagen backend para compilar `psycopg2` y arrancar el contenedor. |
| [Convertir el Frontend en PWA](./2026-05-11-frontend-pwa/spec.md) | In Progress | feature | 2026-05-11 | Habilita instalación PWA, caching de shell y avisos de actualización para el frontend Angular. |
| [Corregir Bucle de Arranque con Sesión Persistida](./2026-05-13-fix-auth-bootstrap-loop/spec.md) | In Progress | hotfix | 2026-05-13 | Evita que la app quede cargando o alternando rutas cuando existe token persistido en el navegador. |
| [Mejorar Feedback y Borrado de Documentos RAG](./2026-05-13-rag-document-feedback-delete/spec.md) | In Progress | hotfix | 2026-05-13 | Añade progreso visible en la carga documental y corrige el borrado concurrente de documentos RAG. |
| [Invocación por voz en Ask de Docs & AI](./2026-05-15-vehicle-ask-voice-trigger/spec.md) | In Progress | feature | 2026-05-15 | Añade activación por palabra clave en `Ask` con transcripción editable previa al envío manual al asistente. |
| [Homogeneizar Toasts y Snackbars](./2026-05-16-toast-standardization/spec.md) | In Progress | refactor | 2026-05-16 | Centraliza el feedback emergente en un servicio compartido y fija la posición `bottom-right`. |
| [Restyling de Ask en Docs & AI](./2026-05-16-vehicle-ask-restyling/spec.md) | Implemented | refactor/ui | 2026-05-16 | Reordena y restiliza la pestaña `Ask` para dar más jerarquía visual al chat, la voz y el compositor. |
| [Robustecer Fallback Gemini en Ask](./2026-05-16-ask-gemini-fallback/spec.md) | In Progress | hotfix | 2026-05-16 | Hace que `Ask` pruebe el siguiente modelo Gemini también ante payload vacío o JSON inválido. |
| [Unificar Llamadas LLM en GeminiService](./2026-05-16-unify-llm-gemini-service/spec.md) | In Progress | refactor | 2026-05-16 | Centraliza las llamadas a Gemini en un servicio común y deja prompts/parsing en servicios de dominio. |
| [Centralizar Fallbacks Gemini en GeminiService](./2026-05-16-centralize-gemini-fallbacks/spec.md) | In Progress | refactor | 2026-05-16 | Mueve al proxy Gemini la decisión y ejecución de fallbacks ligados al proveedor o a sus payloads. |
| [Actualizar Fallback de Modelos Gemini](./2026-05-16-gemini-model-fallback/spec.md) | In Progress | refactor | 2026-05-16 | Ajusta el orden de modelos Gemini usados en el fallback del procesamiento de facturas. |
| [Corregir Merge Parcial en Ask de Docs & AI](./2026-05-16-docs-ai-ask-merge-fix/spec.md) | In Progress | hotfix | 2026-05-16 | Elimina referencias huérfanas a sugerencias en `Ask` y restaura la compilación del frontend. |
| [Corregir Fiabilidad de PWA, Ask y Uploads Documentales](./2026-05-16-docs-ai-pwa-reliability/spec.md) | In Progress | hotfix | 2026-05-16 | Refuerza instalación PWA móvil, fuentes accionables en `Ask`, envío con `Enter` y mitigación del `504` en uploads grandes. |

## Baseline Actual

Estas specs describen comportamiento ya implementado. Úsalas como contexto inicial antes de crear specs futuras.

### Platform

| Spec | Estado | Resumen |
| --- | --- | --- |
| [Backend Platform](./baseline/platform/backend-platform/spec.md) | Baseline | FastAPI, configuración, DB, CORS, errores, request id, JWT, uploads y Alembic. |
| [App Shell y Navegación](./baseline/platform/app-shell-navigation/spec.md) | Baseline | Rutas Angular, shell, sidenav, layout y rutas protegidas. |
| [Shared UI System](./baseline/platform/shared-ui-system/spec.md) | Baseline | `system.md`, estilos globales, componentes compartidos y patrones UI. |

### Identity

| Spec | Estado | Resumen |
| --- | --- | --- |
| [Auth and Session](./baseline/identity/auth-and-session/spec.md) | Baseline | Login local, JWT, guard, interceptores y sesión frontend. |
| [Google Auth](./baseline/identity/google-auth/spec.md) | Baseline | Login Google OAuth, validación de credencial y token federado. |
| [Profile Management](./baseline/identity/profile-management/spec.md) | Baseline | Perfil, avatar y cambio de contraseña. |
| [Settings Management](./baseline/identity/settings-management/spec.md) | Baseline | Ajustes por usuario e integraciones Google/Gemini. |

### Vehicles

| Spec | Estado | Resumen |
| --- | --- | --- |
| [Vehicles Management](./baseline/vehicles/vehicles-management/spec.md) | Baseline | CRUD, listado, imagen, datos legales y specs básicas. |
| [Vehicle Detail Street](./baseline/vehicles/vehicle-detail-street/spec.md) | Baseline | Detalle street con mantenimientos, piezas, facturas y torque. |
| [Vehicle Specs and Torque](./baseline/vehicles/vehicle-specs-and-torque/spec.md) | Baseline | Especificaciones técnicas y pares de apriete. |
| [Vehicle Track Mode](./baseline/vehicles/vehicle-track-mode/spec.md) | Baseline | Modo track por vehículo y registros de pista. |

### Operations

| Spec | Estado | Resumen |
| --- | --- | --- |
| [Dashboard](./baseline/operations/dashboard/spec.md) | Baseline | KPIs, gastos mensuales, actividad reciente y resumen de circuitos. |
| [Maintenance Management](./baseline/operations/maintenance-management/spec.md) | Baseline | CRUD/listado de mantenimientos con búsqueda y relaciones. |
| [Parts Inventory](./baseline/operations/parts-inventory/spec.md) | Baseline | Inventario de piezas, referencias, cantidades y relaciones. |
| [Suppliers Management](./baseline/operations/suppliers-management/spec.md) | Baseline | CRUD/listado de proveedores y datos fiscales/contacto. |
| [Notifications and Reminders](./baseline/operations/notifications-reminders/spec.md) | Baseline | Avisos de ITV, seguro e impuesto de circulación. |

### Invoices

| Spec | Estado | Resumen |
| --- | --- | --- |
| [Invoice Management](./baseline/invoices/invoice-management/spec.md) | Baseline | Listado, filtros, detalle, estados y borrado de facturas. |
| [Invoice AI Processing](./baseline/invoices/invoice-ai-processing/spec.md) | Baseline | Upload, Gemini, extracción y estados de procesamiento. |
| [Invoice Review and Approval](./baseline/invoices/invoice-review-approval/spec.md) | Baseline | Revisión manual, corrección, aprobación y creación de registros. |

### Tracks

| Spec | Estado | Resumen |
| --- | --- | --- |
| [Tracks and Circuits](./baseline/tracks/tracks-and-circuits/spec.md) | Baseline | Tracks normalizados, circuitos legacy, rankings y detalle. |
| [Track Records](./baseline/tracks/track-records/spec.md) | Baseline | CRUD de registros de pista, organizadores y campos de sesión. |

## Estados

- `Draft`: en definición.
- `Ready`: lista para implementar.
- `In Progress`: implementación activa.
- `Implemented`: implementada y pendiente de aceptación/revisión.
- `Baseline`: comportamiento existente documentado retrospectivamente.
- `Accepted`: aceptada tras PR/revisión.
- `Superseded`: reemplazada por otra spec.
- `Abandoned`: descartada.
