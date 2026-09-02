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
5. **Intentional Semantic Accents**: Use high-contrast, purposeful color coding to accelerate data comprehension without adding visual clutter:
   - **Bids & Executions**: Success green (`#16A34A`) for bid prices, positive fills, and depth fills (`bg-emerald-100`).
   - **Asks & Cancellations**: Danger red (`#DC2626`) for ask prices, sell orders, and depth fills (`bg-rose-100`).
   - **Active Touched Queue States**: Highlighted with high-contrast ringed badges (`bg-emerald-100`/`bg-rose-100` with solid borders).
   - **Event Explanations & Takeaways**: Accent indicator bars (`border-l-4 border-l-accent-primary`) and semantic action tags (`[ FULL MATCH ]`, `[ PARTIAL MATCH ]`, `[ CANCELLED ]`).
   - **Primary Controls & Brand**: Primary purple (`#6D28D9`) and secondary cyan (`#06B6D4`) for active tabs, scenario metadata, and spread metrics.

## Consequences

- Interface feels like a sophisticated technical workspace and engineering instrument rather than a marketing dashboard.
- Sharp semantic accents make high-density Level-2 ladders, spread crossing, and FIFO queue states instantly parsable at a glance.
- Reduces CSS overhead and eliminates rendering performance penalties associated with backdrop blurs and heavy drop-shadow filters.

## Alternatives Considered

- **Dark-Themed SaaS Dashboard**: Common in crypto/trading tools, but prone to excessive glow, poor contrast on complex ladder queues, and visual fatigue during deep analytical work.
- **Material / Neumorphic Elevation**: Relies on artificial shadows and physical metaphors that conflict with flat, high-density data visualization.
