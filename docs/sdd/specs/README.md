# Specs

Cada iniciativa SDD debe vivir en una carpeta propia:

```text
docs/sdd/specs/<yyyy-mm-dd-slug>/
  spec.md
  plan.md
  tasks.md
```

Ejemplo:

```text
docs/sdd/specs/2026-05-04-invoice-review-improvements/
```

Usa las plantillas de `_template/` y mantenlas actualizadas durante la implementación. Si una spec cambia de forma importante después de empezar, deja constancia en `plan.md` o crea un ADR.

## Baseline

Las capacidades existentes documentadas retrospectivamente viven en:

```text
docs/sdd/specs/baseline/
```

Estas specs tienen estado `Baseline`. Para modificar una capacidad existente, lee primero la baseline correspondiente y crea una spec fechada nueva para el cambio.
