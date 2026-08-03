---
name: scenario-specs
description: Specifications for the four Learning Lab synthetic scenarios — basic matching, order-flow imbalance, price discovery, liquidity shock. Use whenever building, modifying, or testing a Lab scenario, or the synthetic order-flow generator.
---

# Learning Lab Scenario Specs (v0.1 draft — tune against real output)

Every scenario must define: (1) the synthetic order flow that produces it, (2) the known ground truth about what should happen, and (3) what the ensemble in the signal layer is expected to report. Use these to validate the ensemble, per `architecture-principles`. Treat the specific numbers below as a reasonable starting point, not fixed truth — adjust once you see actual engine output, and update this file when you do, so it stays the source of truth for what "correct" looks like.

## 1. Basic order matching

**Purpose:** teach price-time priority, partial fills, cancels — the foundational lesson, no price movement needed to be interesting.

**Setup:** A small, hand-scripted sequence of limit orders at 2-3 price levels, including at least one case of two orders at the same price (time priority matters), one partial fill, one cancel racing a fill.

**Ground truth:** exact expected trade sequence and resulting book state, computed by hand, checked into the test suite as fixture data.

**Ensemble expectation:** not applicable — no price move to evaluate, this scenario is about the mechanics only.

## 2. Order-flow imbalance

**Purpose:** demonstrate a real, engine-verified price move caused by lopsided buy/sell pressure — the clearest possible teaching case for the `order_flow_imbalance` metric.

**Setup:** Start from a balanced book. Inject a sustained skew — draft starting point: buy-side order volume at ~4-5x sell-side volume over a short synthetic window, ramping up gradually rather than instantly (instant, discontinuous skew is less realistic and less illustrative).

**Ground truth:** price should drift upward over the window in proportion to the imbalance; the imbalance is the *only* injected cause (no large individual trades, no spread manipulation).

**Ensemble expectation:** `order_flow_imbalance.flagged = true` with high confidence; `volatility_adjusted_move` should also flag if the resulting move is large enough relative to the synthetic baseline volatility; `trade_size_footprint` should NOT flag (the point of this scenario is that it's driven by aggregate imbalance, not big individual trades) — if it does flag, the scenario's synthetic flow needs rebalancing so the scenario isolates the intended mechanism.

## 3. Price discovery

**Purpose:** teach how a call-auction-style process converges on a single clearing price — mathematically checkable ground truth.

**Setup:** Generate a batch of buy and sell limit orders at varying prices/quantities, all submitted "pre-open" (no matching until the batch is complete), then run the clearing algorithm: find the price that maximizes matched volume.

**Ground truth:** the clearing price and matched volume are exactly computable from the input order set — compute this independently (e.g. a small script separate from the engine) and assert the engine's output matches exactly. This is the scenario with the tightest, most checkable ground truth of the four — treat mismatches here as a serious bug, not a tuning issue.

**Ensemble expectation:** not the primary focus of this scenario (it's a matching-correctness demo more than a signal-layer demo), but once the auction resolves, the resulting single price move from "no price" to "clearing price" can optionally be run through the ensemble as a secondary teaching moment.

## 4. Liquidity shock

**Purpose:** show what a large market order does when it sweeps through resting liquidity — teaches the relationship between book depth, price impact, and spread.

**Setup:** Start from a book with realistic, moderate depth. Inject a single large market order sized to consume several price levels on one side (draft starting point: sized to consume ~60-70% of visible depth on that side).

**Ground truth:** price should move sharply through the consumed levels; spread should widen immediately after (thinned-out book); this is driven by trade-size footprint, not sustained imbalance.

**Ensemble expectation:** `trade_size_footprint.flagged = true` (should be the strongest signal here); `spread_behavior.flagged = true`; `order_flow_imbalance` may or may not flag depending on whether resting orders replenish during the window — worth checking both cases (replenishment on vs. off) as this is realistic variation.

## Cross-scenario check

Once all four exist, run them together and confirm the ensemble's flagged metrics are distinguishable per scenario — i.e. scenario 2 and scenario 4 should NOT produce the same flag pattern, since they represent genuinely different mechanisms. If they do produce the same pattern, the metrics aren't actually independent enough and need revisiting — this cross-check is more informative than any single scenario passing in isolation.
