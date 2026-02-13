# Interface Design System

## Direction and Feel
- Context: data-heavy product UI for track analytics in a garage management app.
- Intent: emphasize competitive comparison between vehicles on the same circuit over time.
- Visual tone: technical, high-clarity, low-noise; avoid decorative gradients that do not encode meaning.
- Core story in charts: active lap record progression (step line) plus optional raw session trace.

## Depth Strategy
- Use subtle borders and soft surface layering.
- Keep shadows restrained and reserved for hover/focus feedback only.
- Prefer border/elevation contrast over heavy shadow stacks.

## Spacing Unit
- Base spacing unit: 8px.
- Typical rhythm: 8 / 12 / 16 / 24 / 32.
- Chart density should remain readable on mobile without hiding critical visuals.

## Key Component Patterns

### Circuit Comparison Chart
- Default mode: show both `record step line` and `session line` per vehicle.
- Record line: thicker, solid, highest visual priority.
- Session line: thinner, dashed, secondary priority.
- Legend is interactive, not static:
  - Single click toggles vehicle visibility.
  - Double click isolates one vehicle.
  - Include explicit reset action.
- Hover/click state should focus one vehicle and dim others.
- Tooltip content: vehicle name, lap time, date.
- Y axis: faster lap times higher on chart.

### Comparison Controls
- Provide explicit view modes:
  - Record + Sessions
  - Record only
  - Sessions only
- Controls must be compact and keyboard-focusable.

### Time and Numeric Formatting
- Lap times in `M:SS.mmm`.
- Improvement deltas in seconds with 3 decimals.
- Date labels short and scan-friendly for dense timelines.

### Mobile Behavior
- Never hide the main comparison chart on mobile.
- Reduce label density and legend density before removing data.
- Keep tap targets large enough for marker and legend interactions.
