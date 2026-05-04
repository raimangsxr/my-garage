# Plan Técnico: Settings Management

Spec: ./spec.md
Estado: Baseline

## Backend

- `Settings` pertenece a usuario.
- Endpoint GET crea defaults si faltan.
- Endpoint PUT actualiza campos enviados.

## Frontend

- `SettingsService` gestiona lectura/escritura.
- `SettingsComponent` presenta formulario.
- `settings.model.ts` define contrato TS.

## Notas de Evolución

- Cualquier campo secreto nuevo debe especificar visibilidad, almacenamiento y logs.
- Cambios en Gemini/Google settings afectan specs de integraciones.
