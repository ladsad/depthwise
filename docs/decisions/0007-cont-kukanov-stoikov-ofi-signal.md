# 0007 - Cont-Kukanov-Stoikov Order Flow Imbalance (OFI) Formulation

## Context

To quantify buying and selling pressure deterministically without relying on heuristics or black-box models, Depthwise requires an academic, mathematically rigorous metric capable of capturing changes across limit orders, market orders, and cancellations at the top of the order book (Level 1 / BBO).

## Decision

Adopt the Cont-Kukanov-Stoikov (2014) Order Flow Imbalance formulation in `engine/internal/signal/ofi.go`.

Between tick $t-1$ and tick $t$:
$$OFI_t = I_{\{P_B \ge P_B^{prev}\}} q_B - I_{\{P_B \le P_B^{prev}\}} q_B^{prev} - I_{\{P_A \le P_A^{prev}\}} q_A + I_{\{P_A \ge P_A^{prev}\}} q_A^{prev}$$

The engine maintains a rolling window of $W=20$ ticks and computes the imbalance ratio:
$$\text{Ratio} = \frac{\sum \text{Buy Flow}}{\sum \text{Sell Flow}}$$

The metric flags (`flagged = true`) when $\text{Ratio} \ge 3.0$ or $\text{Ratio} \le 0.33$, provided cumulative window flow meets minimum volume thresholds.

## Consequences

- Formulates buying and selling pressure strictly from top-of-book dynamics, isolating aggregate flow from single block trade footprint anomalies.
- Fully unit-testable and mathematically checkable against synthetic ground truth (Scenario 2).
- Serves as the primary quantitative driver for Kyle's Lambda price impact estimation ($\Delta P \approx \lambda \cdot OFI$).

## Alternatives Considered

- **Raw Traded Volume Skew (Taker Buy vs Taker Sell Volume)**: Rejected because it completely ignores passive limit additions, queue reinforcements, and cancellations, missing the vast majority of price formation signals.
- **Micro-price / Weighted Midpoint Skew**: Rejected as a primary flow metric because it captures static instantaneous book shape rather than dynamic directional flow.
