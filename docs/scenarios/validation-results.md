# Validation Results

## Scenario 1: Basic Matching & Price-Time Priority
- **Status:** PASS (`TestScenario1_BasicMatching`, `TestProcessStepScenario1`)
- **Actual Trades Output:**
  - `BuyerID: "B3", SellerID: "S1", Price: 101, Qty: 3`
  - `BuyerID: "B2", SellerID: "S2", Price: 100, Qty: 5`
- **Actual Final Book Snapshot:**
  - **Bids:** `101: [{ID: "B4", Qty: 5}]`
  - **Asks:** *(Empty)*

### Scenario 1 - Concurrency
- **Concurrency Test Result:** Verified that `TestScenario1_ConcurrentCancelRace` handles out-of-order sequence arrivals successfully. Passed cleanly with `-race -count=20`.
- **Approach used:** Reorder-buffer inside the event loop `Run()` to strictly enforce sequence-number ordering regardless of channel arrival times.

## Scenario 2: Order-Flow Imbalance (OFI)
- **Status:** PASS (`TestScenario2_OrderFlowImbalance`)
- **Actual Price Drift:**
  - Initial Inside Mid: `$100.50` (Bid: `$100`, Ask: `$101`)
  - Final Inside Mid: `$103.00` (Bid: `$102`, Ask: `$104`)
  - Drift: `+$2.50` (`+2.49%`)
- **Signal Layer Output:**
  - `order_flow_imbalance.ratio`: `4.50+`
  - `order_flow_imbalance.flagged`: `true`
  - `max_individual_trade_qty`: `10` shares (isolating aggregate flow from single block trades)
- **Actual Final Book Snapshot:**
  - **Bids:** `102: [{ID: "B_step_4", Qty: 14}]`, `101: [{ID: "B_step_2", Qty: 15}, {ID: "B_step_3", Qty: 10}]`, `100: [{ID: "B_init_1", Qty: 10}, {ID: "B_init_2", Qty: 10}, {ID: "B_step_1", Qty: 12}]`, `99: [{ID: "B_init_3", Qty: 15}]`
  - **Asks:** `104: [{ID: "S_retail_2", Qty: 10}]`

## Scenario 3: Price Discovery (Call Auction)
*(Pending implementation)*

## Scenario 4: Liquidity Shock
*(Pending implementation)*

## Engine Benchmarks
- **Date:** 2026-08-05
- **Batch Size:** 100,000 events
- **Composition:** ~70% new orders (10% market, 90% limit), ~30% cancel orders
- **Throughput:** ~330,000 orders/sec
- **Latency (Hot Path):** p50 = <1.0 us, p95 = <1.0 us, p99 = <1.0 us
