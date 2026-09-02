# Validation Results

## Basic Matching

### Scenario 1

**Actual Trades Output:**
- `BuyerID: "B3", SellerID: "S1", Price: 101, Qty: 3`
- `BuyerID: "B2", SellerID: "S2", Price: 100, Qty: 5`

**Actual Final Book Snapshot:**
- **Bids:** `101: [{ID: "B4", Qty: 5}]`
- **Asks:** *(Empty)*

### Scenario 1 - Concurrency

**Concurrency Test Result:**
- Verified that `TestScenario1_ConcurrentCancelRace` handles out-of-order sequence arrivals successfully. 
- Passed cleanly with `-race -count=20`.
- **Approach used:** Reorder-buffer inside the event loop `Run()` to strictly enforce sequence-number ordering regardless of channel arrival times.
- **Known limitation:** No timeout or max-buffer-size gap handling is currently implemented; if a sequence number is genuinely lost rather than delayed, the loop will stall indefinitely.

## Order-Flow Imbalance

## Price Discovery

## Liquidity Shock

## Engine Benchmarks

*(Note: These are in-memory, single-symbol, no I/O numbers. They represent pure engine throughput and latency without network, persistence, or serialization overhead).*

**Date:** 2026-08-05
**Batch Size:** 100,000 events
**Composition:** ~70% new orders (10% market, 90% limit), ~30% cancel orders

**Throughput:**
- ~330,000 orders/sec

**Latency (End-to-End processing per event):**
- **p50:** 0.00 탎
- **p95:** 0.00 탎
- **p99:** 0.00 탎
*(Note: Because the engine mutation takes ~3탎 on average, individual event measurements frequently resolve to exactly 0.00 탎 due to standard timer resolution limits on Windows).*

