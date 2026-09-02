# Architecture Overview

## The Deterministic Core

The matching engine and signal computation layer are strictly deterministic. Market data and synthetic event sequences flow into a single-threaded sequential event loop per symbol:

* **Engine (`engine/internal/matching`)**: Enforces deterministic price-time priority (FIFO queueing per price level), resting order management, and sequence number ordering.
* **Step Processor (`engine/internal/matching/step.go`)**: Executes discrete event transitions, generating structured telemetry (`StepExplanation`) that exposes FIFO queue positions, spread-crossing mechanics, and partial fill resolutions.
* **Signal Layer (`engine/internal/signal`)**: Computes quantitative microstructure metrics (Cont-Kukanov-Stoikov Order Flow Imbalance, Volatility-Adjusted Move Z-Score, Spread Widening %, Trade Size Concentration) strictly through deterministic algorithms.

## Evidence Data Contract

The `Evidence` struct defined in [`engine/internal/evidence/evidence.go`](file:///C:/Users/shaur/Desktop/Projects/depthwise/engine/internal/evidence/evidence.go) forms the stable interface boundary between the deterministic core and downstream presentation/explanation layers:

```json
{
  "symbol": "SYNTH_SCENARIO_1",
  "timestamp": "2026-09-02T10:00:00Z",
  "move_size_pct": 1.0,
  "metrics": {
    "volatility_adjusted_move": { "zscore": 0.0, "flagged": false },
    "order_flow_imbalance":     { "ratio": 1.0, "flagged": false },
    "spread_behavior":          { "widening_pct": 0.0, "flagged": false },
    "trade_size_footprint":     { "largest_trade_share_pct": 0.0, "flagged": false }
  },
  "flagged_count": 0,
  "source": "synthetic",
  "scenario_id": "scenario_1"
}
```

## The LLM Explanation Layer

**The LLM is never the source of truth.** Downstream LLM agents (Cloudflare Workers AI) receive only pre-computed, deterministic `Evidence` objects and chart context. The LLM translates structured numerical evidence into clear, pedagogical explanations without calculating metrics, overriding deterministic output, or hallucinating causality.
