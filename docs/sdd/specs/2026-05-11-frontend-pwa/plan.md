# Plan Técnico: Convertir el Frontend en PWA

Spec: ./spec.md
Estado: In Progress
Fecha: 2026-05-11

## Enfoque

Añadir el soporte PWA nativo de Angular sobre la aplicación standalone actual. Se habilitará `@angular/service-worker`, un manifiesto web, assets instalables derivados del icono existente y una capa runtime pequeña para notificar updates y cambios de conectividad desde `AppComponent`.

## Impacto por Capa

### Backend

- Sin cambios de API ni despliegue backend.

### Frontend

- Build/config: `frontend/package.json`, `frontend/angular.json`, `frontend/ngsw-config.json`
- Documento base: `frontend/src/index.html`
- Bootstrap/config app: `frontend/src/app/app.config.ts`
- Shell raíz: `frontend/src/app/app.component.ts`
- Runtime PWA: nuevo servicio `frontend/src/app/core/services/pwa.service.ts`
- Assets: `frontend/public/manifest.webmanifest`, iconos PWA en `frontend/public/assets/icons/`

### Datos

- Sin cambios.

### Seguridad

- Mantener el registro del service worker solo en producción.
- Evitar cachear respuestas API autenticadas; limitar `dataGroups` a navegación y recursos estáticos.
- No persistir tokens fuera de los mecanismos actuales.

### IA/Integraciones Externas

- No aplica.

## Cambios de Contrato

| Contrato | Cambio | Consumidores | Compatibilidad |
| --- | --- | --- | --- |
| Documento HTML base | añade `manifest`, `theme-color` y metadatos PWA | Navegador | Compatible |
| Build Angular producción | activa service worker y genera `ngsw.json` | Frontend/deploy estático | Compatible |
| Shell global | muestra snackbars de update y conectividad | Usuario final | Compatible |

## Estrategia de Implementación

1. Crear spec, plan y tasks de la iniciativa y registrar la spec en `docs/sdd/specs/index.md`.
2. Instalar `@angular/service-worker` y activar `serviceWorker`/`ngswConfigPath` en `angular.json`.
3. Añadir `manifest.webmanifest`, iconos PWA y metadatos base en `index.html`.
4. Registrar el service worker en `app.config.ts` solo en producción.
5. Crear un servicio PWA que observe actualizaciones y conectividad, reutilizando `MatSnackBar` y `LoggerService`.
6. Integrar el servicio en `AppComponent` y validar el build final.

## Estrategia de Pruebas

- Unitarias: no añadir tests nuevos salvo necesidad puntual; validar tipado de la integración.
- Frontend: `npx tsc -p tsconfig.app.json --noEmit`, `npm run build`.
- Manual/UI:
  - verificar `manifest.webmanifest` y `ngsw.json` en build producción;
  - validar instalación desde navegador compatible;
  - simular offline/online y ver snackbars;
  - confirmar que una actualización disponible ofrece recarga.
- Migración: no aplica.

## Riesgos

- Riesgo: cachear indebidamente llamadas autenticadas y servir datos obsoletos.
  Mitigación: no definir `dataGroups` para API en esta primera iteración.
- Riesgo: registrar service worker en desarrollo y dificultar depuración.
  Mitigación: condicionar el registro por `environment.production`.
- Riesgo: iconos incompletos o tamaños erróneos que degraden la instalación.
  Mitigación: generar tamaños estándar a partir del icono existente y declararlos explícitamente.

## Rollback

Revertir la dependencia `@angular/service-worker`, la activación en `angular.json`, el manifiesto y el servicio runtime PWA. La app volvería a comportarse como SPA tradicional.

## Observabilidad

- Logs esperados: errores al buscar o activar updates del service worker.
- Errores esperados: fallos silenciosos en navegadores no compatibles deben degradar sin romper la app.
- Métricas/manual checks: presencia de `ngsw.json`, instalación ofrecida por navegador y snackbars de estado.
