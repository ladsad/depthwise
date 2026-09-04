# 0008 - Depth-over-Time Waterfall Heatmap Architecture

## Context

Static Level-2 order book ladders show instantaneous depth snapshots at a single point in time, but cannot convey how resting liquidity evolves, where cancellations occur, or how aggressive order flow consumes liquidity walls over time. Learning Lab simulations require a temporal dimension to make price drift and liquidity sweeps intuitive.

## Decision

Implement a Bookmap-style 2D Depth-over-Time Waterfall Heatmap surface in `frontend/src/components/Heatmap`.

Key architectural choices:
1. **Discrete Matrix Coordinate System**: X-axis maps to discrete sequence ticks ($T_0, T_1, \dots, T_N$); Y-axis maps to discrete price levels ($P_{min}$ to $P_{max}$).
2. **Normalized Volumetric Saturation**: Alpha opacity of each cell is proportional to resting volume relative to maximum visible depth ($\alpha = 0.15 + (q / q_{max}) \cdot 0.75$), using Terracotta for bids and Burgundy for asks.
3. **Temporal Trajectory Overlay**: An SVG vector polyline connects chronological mid-price points across sequence ticks, providing an immediate visual trace of price drift through consumed liquidity walls.
4. **Execution Print Markers**: Circular markers denote aggressive market executions directly at the (Price, Tick) coordinates where liquidity was cleared.

## Consequences

- Makes order-flow imbalance and liquidity exhaustion visually obvious without requiring users to manually compare successive book snapshots.
- Retains zero artificial shadows/blur filters, preserving the Light Technical Brutalism design system and high render performance.
- Enables deep interactivity: hover inspecting any cell displays exact resting queue size and matched trade volume.

## Alternatives Considered

- **Standard 2D Price-Time Candlestick Chart**: Rejected because candlesticks compress trade prints into OHLC bars and completely erase resting limit order depth.
- **Heavy WebGL/Shader Volume Surface**: Rejected to avoid heavy client-side GPU dependencies and unnecessary complexity for discrete simulation sequences.
