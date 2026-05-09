# Spec: Añadir Manifests Kubernetes Base

Estado: In Progress
Fecha: 2026-05-09
Tipo: chore
Owner: Codex

## Resumen

Añadir un conjunto base de manifests Kubernetes para desplegar My Garage con Traefik, PostgreSQL externo y almacenamiento persistente de media.

## Problema

El repositorio no dispone de manifests versionados para desplegar backend y frontend en Kubernetes con una configuración operativa coherente. Esto dificulta repetir despliegues, revisar cambios de infraestructura y alinear routing, secretos y almacenamiento persistente.

## Usuarios y Contexto

- Usuario principal: mantenedor técnico / operador de despliegue
- Contexto de uso: preparación y despliegue de My Garage en clúster Kubernetes
- Frecuencia esperada: puntual con revisiones periódicas

## Objetivos

- Versionar manifests mínimos de namespace, config, secretos de ejemplo, storage, migraciones, backend, frontend e ingress.
- Documentar el flujo de despliegue y los ajustes operativos necesarios antes de aplicar los manifests.

## Fuera de Alcance

- Automatizar CI/CD o GitOps.
- Proveer secretos reales o valores productivos cerrados.
- Validar un despliegue real en un clúster dentro de esta iniciativa.

## Comportamiento Esperado

### Escenario Principal

1. Un operador revisa `deploy/k8s/README.md`.
2. Ajusta imágenes, dominio, secretos y parámetros NFS.
3. Aplica los manifests en el orden documentado para desplegar migración, backend, frontend e ingress.

### Casos Límite

- Clúster con políticas `restricted`: los pods deben declarar hardening compatible.
- Entorno con media pública: el ingress debe enrutar `/media` al backend.

## Requisitos Funcionales

- RF-1: El repositorio debe incluir manifests para namespace, configmap, secret de ejemplo, PV/PVC de media, job de migración, backend, frontend e ingress.
- RF-2: La documentación debe explicar variables que el operador debe personalizar antes del despliegue.
- RF-3: Los manifests deben contemplar el acceso público a `/api` y `/media`.

## Requisitos No Funcionales

- Rendimiento: no aplica
- Seguridad: los pods deben usar una configuración endurecida compatible con `restricted`.
- Accesibilidad: no aplica
- Responsive: no aplica
- Observabilidad: los manifests deben declarar probes HTTP para backend y frontend.

## UX y Diseño

- Referencia visual: no aplica
- Pantallas afectadas: no aplica
- Estados requeridos: no aplica
- Componentes compartidos a reutilizar/extender: no aplica
- Capturas/mockups: no aplica

## Contratos de Datos

### Backend/API

- Endpoint(s): `/api`, `/media`, `/health`
- Request: no aplica
- Response: no aplica
- Errores esperados: no aplica

### Frontend

- Servicio(s): no aplica
- Interface(s): no aplica
- Estado local/global: no aplica

## Migraciones

- Requiere migración: no
- Backfill: no aplica
- Compatibilidad con datos existentes: depende de configurar `DATABASE_URL` y volumen de media externos

## Criterios de Aceptación

- CA-1: Dado un operador con un clúster Kubernetes, cuando revisa `deploy/k8s`, entonces encuentra manifests separados para namespace, configuración, secretos de ejemplo, storage, migración, backend, frontend e ingress.
- CA-2: Dado un despliegue que sirve media pública, cuando se consulta la documentación, entonces queda indicado que `/media` debe enrutar al backend.
- CA-3: Dado un clúster con restricciones de seguridad, cuando se inspeccionan los manifests, entonces backend, frontend y job de migración usan contexto de seguridad endurecido.

## Pruebas Esperadas

- Backend: no aplica
- Frontend: no aplica
- Manual/UI: revisión estática de manifests y README
- No ejecutable ahora: validación real con `kubectl apply --dry-run` o despliegue en clúster si no hay contexto Kubernetes configurado

## Dependencias

- Kubernetes con Ingress Traefik
- PostgreSQL accesible externamente
- Volumen NFS o almacenamiento equivalente para media

## Preguntas Abiertas

- Ninguna por ahora.

## Decisiones Relacionadas

- ADR: no aplica
