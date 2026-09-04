package scenarios

import (
	"depthwise/engine/internal/orderbook"
)

// Scenario 2: Order-Flow Imbalance (OFI)
// Demonstrates how sustained aggregate buying pressure (4-5x buy vs sell volume)
// deterministically drives upward price drift through repeated ask exhaustion and bid stepping,
// without any large single block trades (trade size footprint remains unflagged).

var Scenario2Events = []orderbook.OrderEvent{
	// Phase 1: Establish Initial Balanced Book ($100 Bid vs $101 Ask)
	{Seq: 1, Type: "new", ID: "B_init_1", Side: "buy", Price: 100, Qty: 10},
	{Seq: 2, Type: "new", ID: "B_init_2", Side: "buy", Price: 100, Qty: 10},
	{Seq: 3, Type: "new", ID: "B_init_3", Side: "buy", Price: 99, Qty: 15},
	{Seq: 4, Type: "new", ID: "S_init_1", Side: "sell", Price: 101, Qty: 10},
	{Seq: 5, Type: "new", ID: "S_init_2", Side: "sell", Price: 101, Qty: 10},
	{Seq: 6, Type: "new", ID: "S_init_3", Side: "sell", Price: 102, Qty: 15},

	// Phase 2: Skewed Buy-Side Pressure Begins (Lifting Ask Level 101)
	{Seq: 7, Type: "new", ID: "B_flow_1", Side: "buy", Price: 101, Qty: 6},  // Partial fill against S_init_1 (6/10)
	{Seq: 8, Type: "new", ID: "B_step_1", Side: "buy", Price: 100, Qty: 12}, // Passive buyer reinforces 100 bid
	{Seq: 9, Type: "new", ID: "B_flow_2", Side: "buy", Price: 101, Qty: 4},  // Clears remaining S_init_1 (4/10)
	{Seq: 10, Type: "new", ID: "B_flow_3", Side: "buy", Price: 101, Qty: 10}, // Clears S_init_2 @ 101 (Ask moves to 102)

	// Phase 3: Bids Step Up to $101 and Absorb Flow
	{Seq: 11, Type: "new", ID: "B_step_2", Side: "buy", Price: 101, Qty: 15}, // New Best Bid established @ 101!
	{Seq: 12, Type: "new", ID: "S_retail_1", Side: "sell", Price: 103, Qty: 5}, // Small retail sell added high
	{Seq: 13, Type: "new", ID: "B_flow_4", Side: "buy", Price: 102, Qty: 8},  // Partial fill against S_init_3 (8/15 @ 102)
	{Seq: 14, Type: "new", ID: "B_step_3", Side: "buy", Price: 101, Qty: 10}, // More bids arrive at 101
	{Seq: 15, Type: "new", ID: "B_flow_5", Side: "buy", Price: 102, Qty: 7},  // Clears remaining S_init_3 (7/15 @ 102, Ask moves to 103)

	// Phase 4: Bids Step Up to $102 (Price Drift Completed: $100.50 -> $102.50)
	{Seq: 16, Type: "new", ID: "B_step_4", Side: "buy", Price: 102, Qty: 14}, // New Best Bid established @ 102!
	{Seq: 17, Type: "new", ID: "S_retail_2", Side: "sell", Price: 104, Qty: 10},
	{Seq: 18, Type: "new", ID: "B_flow_6", Side: "buy", Price: 103, Qty: 5},  // Clears S_retail_1 @ 103 (Ask moves to 104)
}

// Scenario2ExpectedInitialMid is the starting mid price before the imbalance ($100.50).
const Scenario2ExpectedInitialMid = 100.5

// Scenario2ExpectedFinalMid is the ending mid price after the imbalance ($103.00).
const Scenario2ExpectedFinalMid = 103.0
