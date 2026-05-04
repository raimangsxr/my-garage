# Plan Técnico: Dashboard

Spec: ./spec.md
Estado: Baseline

## Backend

- `dashboard.py` calcula agregados con SQLModel/SQLAlchemy.
- Usa mantenimientos para gastos y actividad.
- Usa track records para resumen de circuitos.

## Frontend

- `DashboardService.getStats()` consume endpoint.
- `DashboardComponent` renderiza cards, chart y activity list.

## Notas de Evolución

- Nuevos KPIs deben especificar fórmula, filtros y fuente.
- Cambios visuales deben respetar `system.md`.
