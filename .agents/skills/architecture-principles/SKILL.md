---
name: architecture-principles
description: The core architectural rule for Depthwise — the LLM is never the source of truth. Use whenever writing or modifying code, prompts, or copy that touches the signal layer, the evidence object, or the LLM explanation layer, and whenever writing any user-facing text about what the system found.
---

# Architecture Principles — Read Before Touching Signal/Evidence/LLM Code

## The one rule that matters most

**The LLM is never the source of truth.** Market data flows through the matching engine and signal layer to produce structured, deterministic evidence first. The LLM's only job, downstream of that, is to explain the evidence in plain language. It cannot compute the evidence, override it, or substitute its own judgment for it.

Concretely, this means:

- The signal layer (order-flow imbalance, volatility-adjusted move size, spread behavior, trade-size footprint, and their aggregation) is implemented as deterministic code — same input always produces the same output. No LLM call anywhere in that path.
- The LLM receives the already-computed Evidence object as input and produces explanatory text as output. It does not receive raw market data and "reason" its way to a verdict.
- If a task seems to require the LLM to make an analytical judgment (e.g. "should the agent decide if this move is significant?") — stop and flag it. That judgment belongs in the signal layer as a new deterministic metric or threshold, not in a prompt.
- Every deterministic component must be independently unit-testable without invoking the LLM at all. If you can't test a piece of logic without calling the LLM, it's in the wrong layer.

## The Evidence object (data contract)

This is the boundary between the deterministic core and the LLM layer. Treat its shape as a stable interface — changes to it should be deliberate, not incidental side effects of unrelated work.

```
Evidence {
  symbol: string
  timestamp: ISO8601
  move_size_pct: float
  metrics: {
    volatility_adjusted_move: { zscore: float, flagged: bool }
    order_flow_imbalance:     { ratio: float, flagged: bool }
    spread_behavior:          { widening_pct: float, flagged: bool }
    trade_size_footprint:     { largest_trade_share_pct: float, flagged: bool }
  }
  flagged_count: int        // how many of the 4 metrics flagged, 0-4
  source: "synthetic" | "live"
  scenario_id?: string      // present only in Lab mode, for ground-truth validation
}
```

The LLM explanation layer receives exactly this object (plus whatever chart/UI state it needs to reference) — never raw order book ticks, never unprocessed price series.

## Language rules — apply everywhere, including UI copy and docs

Never write or generate text (in code, prompts, comments, UI strings, or documentation) that claims a move "is real," "is fake," "is manipulation," or otherwise asserts ground truth about causality in Live Pulse mode. Ground truth only exists in Learning Lab mode, where it was synthetically injected.

Approved framing pattern: *"Evidence suggests this move is supported by [unusually strong / weak / mixed] order-flow characteristics"* — always describing the evidence, never asserting the underlying fact.

In Learning Lab mode, since ground truth is known, it's fine to say things like "this scenario injected a genuine imbalance, and the ensemble correctly flagged it" — that's a claim about the simulation, not about a real market.

## Why this matters (context for judgment calls)

Systems that let an LLM reason freely over raw data to produce a verdict are hard to audit, not reliably testable, and read as an "AI wrapper" to experienced engineers — a pattern reviewers have learned to distrust on sight. A system where the LLM only explains an already-computed, testable evidence object is auditable, and the LLM becomes a genuinely replaceable presentation layer over real infrastructure. This distinction is central to the project's credibility with both its target audiences (quant engineers and FDE-style reviewers) — don't erode it for convenience.
