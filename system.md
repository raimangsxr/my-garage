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
