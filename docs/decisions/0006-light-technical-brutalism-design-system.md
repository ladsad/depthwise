# 0006 - Light Technical Brutalism Design System

## Context

Financial engineering tools, market microstructure simulators, and trading platforms often default to either generic dark-mode SaaS layouts (floating cards, heavy drop-shadows, glow effects) or cluttered, unreadable tables. Depthwise requires a visual design system that conveys engineering rigor, precision, and information density on a single 2D plane without distracting artificial depth.

## Decision

Adopt the **Light Technical Brutalism / Swiss-Grid** design language across the frontend application.

Key tenets:
1. **Single 2D Canvas**: Everything exists on one architectural plane using an off-white paper canvas (#F7F8FA).
2. **Zero Artificial Depth**: Prohibit drop shadows, floating cards, heavy gradients, elevation levels, and glassmorphism. Visual hierarchy is established via spacing, 1px solid borders (#D9DDE3), background contrast, and typography.
3. **Restrained Engineered Geometry**: Enforce crisp 0–4px border radii (no pill-shaped containers or bubbly buttons).
4. **Information Architecture**: Utilize monospace typography (`JetBrains Mono`) for technical metrics, sequence numbers, identifiers, and section dividers (`01 / LEVEL-2 ORDER BOOK`, `02 / TRADE EXECUTION TAPE`, `03 / EVENT INSPECTOR`).
5. **Intentional Semantic Accents & Technical Palette**:
   - **Canvas & Surfaces**: Off-White/Light Gray paper canvas (`#E7E6E3`) with crisp solid borders in Beige Tint (`#CABFAC` / `#A89C87`).
   - **Text & Typography**: Dark Charcoal / Off-Black (`#33312E`) with secondary captions in muted taupe (`#66625C`).
   - **Bids, Purchases & Primary Warm Focus**: Warm Terracotta Brown (`#AA784F` / `#82542E` / `#FAF4EF`) for bid prices, buy-side depth fills, scenario identifiers, and positive execution mechanics.
   - **Asks, Sales & Cancellations**: Deep Burgundy Red (`#6B0C08` / `#520805` / `#FAF0EF`) for ask prices, sell orders, cancellations, and step tick action triggers.
   - **Navigation & Telemetry Accents**: Muted Navy Blue (`#3A3F5F` / `#E1E3ED`) for engine telemetry, inside spread highlights, and secondary operational states.
   - **Active Touched Queue States**: Highlighted with high-contrast ringed badges (`bg-terracotta-light`/`bg-burgundy-light` with solid borders).

## Consequences

- Interface feels like a sophisticated technical workspace and engineering instrument rather than a marketing dashboard.
- Sharp semantic accents make high-density Level-2 ladders, spread crossing, and FIFO queue states instantly parsable at a glance.
- Reduces CSS overhead and eliminates rendering performance penalties associated with backdrop blurs and heavy drop-shadow filters.

## Alternatives Considered

- **Dark-Themed SaaS Dashboard**: Common in crypto/trading tools, but prone to excessive glow, poor contrast on complex ladder queues, and visual fatigue during deep analytical work.
- **Material / Neumorphic Elevation**: Relies on artificial shadows and physical metaphors that conflict with flat, high-density data visualization.
