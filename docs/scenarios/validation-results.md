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
