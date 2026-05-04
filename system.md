# Sistema de Diseño y UX Unificado (My Garage)

## 1. Objetivo
Definir un sistema único de interfaz y experiencia de usuario para todos los módulos de la aplicación, eliminando diferencias visuales y de interacción entre pantallas.

Este documento es la referencia obligatoria para frontend en:
- diseño visual (look&feel)
- composición de pantallas
- comportamiento UX
- estados (loading, empty, error)
- responsive y accesibilidad

## 2. Diagnóstico actual (revisión)
Se observan inconsistencias claras entre módulos:
- Estilos de contenedor y cabeceras distintos (`dashboard` vs `maintenance/parts/suppliers/invoices/tracks/vehicles`).
- Densidad y tratamiento de tablas no homogéneo (padding, tamaño de texto, encabezados, acciones).
- Jerarquía visual dispar (algunas pantallas con hero fuerte, otras planas sin estructura equivalente).
- Estados de carga y estado vacío implementados con variaciones no sistematizadas.
- Responsive irregular: columnas y textos no siempre escalan con el mismo criterio.

## 3. Principios de producto (obligatorios)
1. **Consistencia primero**: mismo patrón para mismo problema.
2. **Legibilidad operativa**: prioridad a datos y acciones clave.
3. **Densidad controlada**: compacta pero escaneable.
4. **Feedback inmediato**: todo cambio de estado tiene respuesta visual.
5. **Mobile real**: no solo “encoge”, reordena y simplifica.

## 4. Design tokens base
Usar tokens globales y evitar hex sueltos en módulos nuevos.

### 4.1 Colores
- `--primary-color: #1a237e`
- `--accent-color: #00bfa5`
- `--bg-color: #f5f7fa`
- `--surface-color: #ffffff`
- `--text-primary: #212121`
- `--text-secondary: #757575`

### 4.2 Bordes y sombras
- `--radius-md: 12px`
- `--radius-lg: 20px`
- `--shadow-sm: 0 2px 4px rgba(0,0,0,0.05)`
- `--shadow-md: 0 4px 6px rgba(0,0,0,0.1)`
- `--shadow-lg: 0 10px 15px rgba(0,0,0,0.1)`

### 4.3 Espaciado
Escala recomendada: `4, 8, 12, 16, 24, 32`.

## 5. Patrones de layout por pantalla

### 5.1 Estructura estándar de módulo
1. `container` (máx ancho + padding responsive)
2. `hero/header` (título, subtítulo, KPIs rápidos opcionales)
3. `toolbar` (filtro, búsqueda, acciones globales)
4. `content card` (tabla/lista principal)
5. `paginator`
6. `empty state`

### 5.2 Tipografía
- Título de módulo: 32/700 desktop, 24/700 mobile.
- Subtítulo: 15-16/400.
- Cabecera de tabla: 11-12/700 uppercase ligero.
- Celda: 13-14/400-600.

## 6. Patrones de componentes

### 6.1 Loader de página
Usar siempre `app-page-loader` para carga de pantalla.
- Icono contextual por módulo.
- Mensaje descriptivo.
- No usar `mat-spinner` como loader principal de pantalla.
- `mat-spinner` solo para microestado local (ej: fila en procesamiento).

### 6.2 Tabla de datos
- Header sticky visual uniforme (fondo suave + borde inferior).
- Hover de fila suave y consistente.
- Columna de acciones con ancho fijo.
- Descripciones largas: `line-clamp` + tooltip cuando aplique.
- En mobile: ocultado progresivo de columnas secundarias por breakpoint.

### 6.3 Estado vacío
Siempre con:
- icono
- mensaje principal
- texto secundario accionable (siguiente paso)

### 6.4 Estado error
Patrón único:
- icono + mensaje claro
- acción de recuperación (`Retry`)

### 6.5 Botones
- CTA principal a la derecha en header.
- Tamaño mínimo 40px altura.
- Etiquetas consistentes (`New X`, `Add X`, no mezclar sin criterio).

## 7. UX de interacción
- Búsqueda con debounce (250ms) en todos los listados.
- Sorting/paginación resetean página al cambiar criterio.
- Acciones destructivas con confirmación.
- Mensajes de feedback homogéneos en `snackbar` (éxito/error).

## 8. Responsive y breakpoints
- `<=1200px`: ocultar columnas de soporte.
- `<=980px`: priorizar columnas núcleo.
- `<=680px`: ajustar paddings/tipografía y permitir scroll horizontal controlado.
- Botones de cabecera en mobile: full width cuando no quepan.

## 9. Accesibilidad mínima
- Contraste AA para texto y controles.
- Objetivos táctiles >= 40px.
- `aria-label` en acciones icon-only.
- Estados de foco visibles en teclado.

## 10. Rendimiento UI
- Evitar efectos pesados por módulo.
- Reutilizar componentes compartidos (`app-page-loader`, `empty-state`, etc.).
- Limitar sombras/gradientes extremos fuera de pantallas hero.

## 11. Estrategia de homogeneización por módulos
Orden recomendado:
1. `maintenance` (ya alineado como referencia de tabla moderna).
2. `invoices`, `parts`, `suppliers` (misma familia de pantallas CRUD tabla).
3. `tracks` listado y detalle (ajustar densidad y patrón de hero/tabla).
4. `vehicles` listado (alinear header/toolbar/empty/paginator).
5. `dashboard` (mantener identidad pero converger a tokens y espaciado del sistema).

## 12. Definition of Done (DoD) visual por módulo
Un módulo se considera homogenizado cuando:
- usa estructura estándar de layout
- usa loader `app-page-loader`
- tiene estado empty/error estándar
- cumple breakpoints definidos
- no introduce colores/espaciados fuera de tokens
- pasa revisión visual desktop + móvil

## 13. Gobernanza
- Cualquier pantalla nueva debe implementarse contra este `system.md`.
- Si se necesita una excepción, debe documentarse explícitamente en el PR con justificación.
- Todo PR de UI debe citar las secciones de este documento que aplica.
- Todo componente nuevo debe declarar si reutiliza, extiende o reemplaza un patrón existente.
- Si dos componentes resuelven el mismo problema, debe mantenerse uno solo o documentarse una variante explícita.

## 14. Patrones específicos de comparación en circuito
Estas reglas consolidan el contenido anterior de `.interface-design/system.md`.

### 14.1 Dirección visual
- Contexto: UI de producto orientada a datos (analítica de circuito y vehículo).
- Enfoque: comparación competitiva y claridad operativa.
- Priorizar señales que representen rendimiento real; evitar decoración sin función.

### 14.2 Estrategia de profundidad
- Usar capas suaves con borde y contraste de superficie.
- Reservar sombras intensas para hover/focus.
- Evitar pilas de sombra agresivas en tablas y modales de datos.

### 14.3 Gráfico de comparación de vueltas
- Modo por defecto: **record step line** + **session line**.
- Línea de récord: más gruesa y prioritaria.
- Línea de sesión: más fina y secundaria (dash).
- Eje Y: tiempos más rápidos arriba.
- Tooltip mínimo: vehículo, tiempo, fecha.

### 14.4 Controles de comparación
- Modos explícitos:
  - Record + Sessions
  - Record only
  - Sessions only
- Controles compactos, accesibles por teclado y con estados claros.

### 14.5 Formato de datos
- Vueltas en `M:SS.mmm`.
- Mejoras en segundos con 3 decimales.
- Fechas cortas y legibles en densidad alta.

### 14.6 Mobile en analítica de circuito
- No ocultar el gráfico principal en móvil.
- Reducir densidad de etiquetas antes de eliminar información.
- Mantener tamaños táctiles adecuados para leyendas y marcadores.

## 15. Matriz de componentes obligatoria

Antes de crear un componente visual nuevo, revisar esta matriz.

| Necesidad | Patrón obligatorio | Extender cuando | No crear |
| --- | --- | --- | --- |
| Página de módulo | `mg-page` + `mg-page-header` + `mg-page-actions` | La pantalla necesita hero o layout analítico | Contenedores locales tipo `container`, `header`, `page-wrapper` sin motivo |
| Card/superficie | `mg-surface-card` o `mg-form-card` | La card necesita variante compacta, media o métrica | Cards locales con sombras/radios/colores propios |
| Tabla/listado denso | `mg-table` dentro de `mg-table-shell` | Necesita columnas responsive o acciones | Tablas con estilos propios para CRUD repetidos |
| Lista de entidades | `app-entity-card` o componente compartido derivado | Necesita slots, leading icon, meta o actions | Divs clicables con estilos propios |
| Estado vacío | `app-empty-state` | Necesita variante compacta o CTA | `.empty-state` local con icono/copy propio |
| Carga de pantalla | `app-page-loader` | Necesita modo sección o inline | `mat-spinner` como estado principal de pantalla |
| Formulario/dialog | `mg-form-card` y patrón de dialog compartido | Necesita layout por pasos o columnas | Acciones, paddings y validaciones inconsistentes por diálogo |

Regla: si un patrón no cubre el caso, se amplía el patrón compartido antes de crear una solución local.

## 16. Componentes interactivos y accesibilidad

### 16.1 Botones de icono

- Todo botón icon-only debe tener `aria-label`.
- `matTooltip` no sustituye `aria-label`.
- El label debe expresar la acción: `Edit part`, `Delete invoice`, `Search maintenance`.
- Usar `title` solo como fallback, no como contrato accesible principal.
- Acciones destructivas requieren confirmación o undo window.

### 16.2 Semántica clickable

- Navegación: usar link/routerLink.
- Acción: usar button.
- Card clickable: debe ser accesible por teclado. Preferir que el componente compartido renderice semántica adecuada.
- Evitar `div` con `(click)` salvo que tenga rol, tabindex, handler de teclado y justificación.

### 16.3 Focus

- Todo control interactivo debe tener foco visible.
- No usar `outline: none` sin reemplazo `:focus-visible`.
- Los grupos compuestos pueden usar `:focus-within` para elevar la superficie.

## 17. Tokens ampliados y uso de color

Los módulos no deben introducir hex sueltos salvo al ampliar tokens globales.

### 17.1 Jerarquía recomendada

- Texto:
  - `--text-primary`
  - `--text-secondary`
  - `--text-muted`
  - `--text-inverse`
- Superficies:
  - `--surface-color`
  - `--surface-muted`
  - `--surface-selected`
  - `--surface-hover`
- Bordes:
  - `--border-soft`
  - `--border-muted`
  - `--border-strong`
- Semánticos:
  - `--success-color`
  - `--warning-color`
  - `--danger-color`
  - `--info-color`
- Interacción:
  - `--focus-ring`
  - `--hover-shadow`

### 17.2 Color de dominio

My Garage puede usar señales del mundo automoción/taller/pista, pero con función:

- índigo: navegación, estructura principal, marca;
- teal: acción positiva/progreso;
- ámbar: mantenimiento/advertencia;
- rojo: destructivo/caducado/error;
- verde: correcto/aprobado/mejora;
- azul: información/circuito/analytics.

No usar gradientes decorativos en módulos operativos salvo hero o visualización justificada.

## 18. Movimiento e interacción

- Prohibido `transition: all`.
- Listar propiedades: `background-color`, `border-color`, `box-shadow`, `transform`, `color`, `opacity`.
- Animar solo `transform` y `opacity` cuando haya movimiento.
- Mantener transiciones entre `120ms` y `220ms` para microinteracciones.
- Respetar `prefers-reduced-motion` en animaciones no esenciales.

## 19. Tablas, listas y cards

### 19.1 Tabla estándar

Una tabla de CRUD debe tener:

- shell con scroll horizontal controlado;
- header visual uniforme;
- columna de acciones de ancho fijo;
- labels accesibles en acciones;
- empty state dentro del mismo contenedor;
- loading state de sección;
- paginador si hay paginación;
- responsive por ocultación progresiva de columnas secundarias.

### 19.2 Lista de entidad

Usar listas/cards cuando:

- hay poco ancho;
- el contenido es narrativo o visual;
- la entidad requiere hero/media;
- el usuario compara pocos elementos.

Usar tabla cuando:

- el usuario compara muchas filas;
- hay sorting/paginación;
- las columnas son homogéneas.

### 19.3 Cards

- Cards repetidas no deben redefinir sombra/radio/color.
- Si una card es interactiva, su hover/focus debe ser visible y consistente.
- No meter cards dentro de cards salvo contenido realmente anidado y justificado.

## 20. Estados

### 20.1 Loading

- Página completa: `app-page-loader`.
- Zona dentro de una card: variante section de loader o patrón equivalente.
- Celda/fila concreta: `mat-spinner` inline permitido.
- Los textos de loading deben terminar con `…`.

### 20.2 Empty

Todo estado vacío debe tener:

- icono contextual;
- mensaje principal;
- texto secundario o CTA cuando ayude a avanzar;
- variante compacta cuando está dentro de una card densa.

### 20.3 Error

Todo error recuperable debe tener:

- icono;
- mensaje con siguiente paso;
- acción primaria de recuperación;
- logging técnico fuera de la UI.

## 21. Formularios y diálogos

- Formularios con `mat-form-field` deben tener labels visibles.
- Inputs deben usar `type`, `autocomplete` e `inputmode` cuando aplique.
- Errores deben mostrarse junto al campo.
- Acciones de diálogo: secundaria a la izquierda, primaria a la derecha.
- Botón primario específico: `Save Vehicle`, `Approve Invoice`, `Save API Key`; evitar `Continue` genérico.
- Si hay cambios sin guardar en formularios largos, añadir confirmación de salida.

## 22. Excepciones

Una excepción visual es válida solo si cumple:

- cita sección de `system.md` que no cubre el caso;
- explica por qué el patrón compartido no sirve;
- define si la excepción es temporal o permanente;
- incluye screenshot o nota visual en PR;
- si la excepción se repite dos veces, debe convertirse en patrón compartido.
