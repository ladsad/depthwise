package scenarios

import (
	"depthwise/engine/internal/orderbook"
)

// Scenario 1: Basic Matching
// - Events 1-2: same price, time priority queues B2 behind B1
// - Event 3: rests, doesn't cross the book
// - Event 4: crosses and partially fills S1 (8 -> 5 remaining)
// - Event 5: cancels S1's remaining 5 (a partially-filled order, not untouched)
// - Event 6: cancels B1 (an untouched order)
// - Event 7: matches best remaining bid, must hit B2 not the already-cancelled B1
// - Event 8: no asks left (S1 was cancelled), rests instead of crossing

var Scenario1Events = []orderbook.OrderEvent{
	{Seq: 1, Type: "new",    ID: "B1", Side: "buy",  Price: 100, Qty: 10},
	{Seq: 2, Type: "new",    ID: "B2", Side: "buy",  Price: 100, Qty: 5},
	{Seq: 3, Type: "new",    ID: "S1", Side: "sell", Price: 101, Qty: 8},
	{Seq: 4, Type: "new",    ID: "B3", Side: "buy",  Price: 101, Qty: 3},
	{Seq: 5, Type: "cancel", ID: "S1"},
	{Seq: 6, Type: "cancel", ID: "B1"},
	{Seq: 7, Type: "new",    ID: "S2", Side: "sell", Price: 100, Qty: 5},
	{Seq: 8, Type: "new",    ID: "B4", Side: "buy",  Price: 101, Qty: 5},
}

var Scenario1ExpectedTrades = []orderbook.Trade{
	{BuyerID: "B3", SellerID: "S1", Price: 101, Qty: 3}, // from event 4
	{BuyerID: "B2", SellerID: "S2", Price: 100, Qty: 5}, // from event 7
}

var Scenario1ExpectedBook = orderbook.BookSnapshot{
	Bids: map[int][]orderbook.RestingOrder{
		101: {{ID: "B4", Qty: 5}},
	},
	Asks: map[int][]orderbook.RestingOrder{}, // empty
}
