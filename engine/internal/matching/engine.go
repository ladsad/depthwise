package matching

import (
	"log"
	"sort"

	"depthwise/engine/internal/orderbook"
)

// Engine represents a single-owner event loop per symbol for the matching engine.
// It ensures strictly sequential processing of OrderEvents to guarantee deterministic
// price-time priority without fine-grained locking.
type Engine struct {
	bids map[int][]orderbook.RestingOrder
	asks map[int][]orderbook.RestingOrder
}

// NewEngine creates a new Engine instance.
func NewEngine() *Engine {
	return &Engine{
		bids: make(map[int][]orderbook.RestingOrder),
		asks: make(map[int][]orderbook.RestingOrder),
	}
}

// Run starts the event loop, consuming from the ordered events channel and emitting trades.
// It uses a reorder buffer to enforce strict sequence-number ordering (price-time priority)
// even if events arrive concurrently out-of-order over the channel.
//
// Known limitation: Currently, there is no timeout or max-buffer-size policy. If a sequence 
// number is genuinely lost, the engine will stall indefinitely waiting for it. This gap/timeout 
// handling is out of scope for this task and must be addressed for production.
func (e *Engine) Run(events <-chan orderbook.OrderEvent, trades chan<- orderbook.Trade) {
	nextExpectedSeq := 1
	pending := make(map[int]orderbook.OrderEvent)

	for ev := range events {
		if ev.Seq < nextExpectedSeq {
			// Duplicate or stale event that we already processed/passed
			log.Printf("Warning: dropped duplicate or stale event seq=%d\n", ev.Seq)
			continue
		} 
        
        if ev.Seq > nextExpectedSeq {
			// Out of order event, buffer it
			pending[ev.Seq] = ev
		} else {
			// ev.Seq == nextExpectedSeq
			e.processEvent(ev, trades)
			nextExpectedSeq++

			// Drain the buffer of any subsequent sequential events
			for {
				if pendingEv, ok := pending[nextExpectedSeq]; ok {
					delete(pending, nextExpectedSeq)
					e.processEvent(pendingEv, trades)
					nextExpectedSeq++
				} else {
					break
				}
			}
		}
	}
}

// Snapshot returns a copy of the current order book state.
func (e *Engine) Snapshot() orderbook.BookSnapshot {
	snap := orderbook.BookSnapshot{
		Bids: make(map[int][]orderbook.RestingOrder),
		Asks: make(map[int][]orderbook.RestingOrder),
	}
	for p, orders := range e.bids {
		snap.Bids[p] = append([]orderbook.RestingOrder(nil), orders...)
	}
	for p, orders := range e.asks {
		snap.Asks[p] = append([]orderbook.RestingOrder(nil), orders...)
	}
	return snap
}

func (e *Engine) processEvent(ev orderbook.OrderEvent, trades chan<- orderbook.Trade) {
	if ev.Type == "cancel" {
		e.cancelOrder(ev.ID)
		return
	}

	if ev.Type == "new" {
		e.matchOrder(ev, trades)
	}
}

func (e *Engine) cancelOrder(id string) {
	// Search in bids
	for p, orders := range e.bids {
		for i, o := range orders {
			if o.ID == id {
				// Remove the order while preserving time priority of the rest
				e.bids[p] = append(orders[:i], orders[i+1:]...)
				if len(e.bids[p]) == 0 {
					delete(e.bids, p)
				}
				return
			}
		}
	}
	// Search in asks
	for p, orders := range e.asks {
		for i, o := range orders {
			if o.ID == id {
				e.asks[p] = append(orders[:i], orders[i+1:]...)
				if len(e.asks[p]) == 0 {
					delete(e.asks, p)
				}
				return
			}
		}
	}
}

func (e *Engine) matchOrder(ev orderbook.OrderEvent, trades chan<- orderbook.Trade) {
	remQty := ev.Qty

	if ev.Side == "buy" {
		// Match against asks
		var prices []int
		for p := range e.asks {
			prices = append(prices, p)
		}
		sort.Ints(prices) // Lowest price first for buys

		for _, p := range prices {
			if p > ev.Price || remQty == 0 {
				break
			}

			orders := e.asks[p]
			var remainingOrders []orderbook.RestingOrder
			for i, o := range orders {
				if remQty == 0 {
					remainingOrders = append(remainingOrders, orders[i:]...)
					break
				}

				fillQty := o.Qty
				if remQty < fillQty {
					fillQty = remQty
				}

				trades <- orderbook.Trade{
					BuyerID:  ev.ID,
					SellerID: o.ID,
					Price:    p,
					Qty:      fillQty,
				}

				remQty -= fillQty
				o.Qty -= fillQty

				if o.Qty > 0 {
					remainingOrders = append(remainingOrders, o)
				}
			}

			if len(remainingOrders) > 0 {
				e.asks[p] = remainingOrders
			} else {
				delete(e.asks, p)
			}
		}

		// Add remaining quantity to book
		if remQty > 0 {
			e.bids[ev.Price] = append(e.bids[ev.Price], orderbook.RestingOrder{
				ID:  ev.ID,
				Qty: remQty,
			})
		}
	} else if ev.Side == "sell" {
		// Match against bids
		var prices []int
		for p := range e.bids {
			prices = append(prices, p)
		}
		sort.Slice(prices, func(i, j int) bool {
			return prices[i] > prices[j] // Highest price first for sells
		})

		for _, p := range prices {
			if p < ev.Price || remQty == 0 {
				break
			}

			orders := e.bids[p]
			var remainingOrders []orderbook.RestingOrder
			for i, o := range orders {
				if remQty == 0 {
					remainingOrders = append(remainingOrders, orders[i:]...)
					break
				}

				fillQty := o.Qty
				if remQty < fillQty {
					fillQty = remQty
				}

				trades <- orderbook.Trade{
					BuyerID:  o.ID,
					SellerID: ev.ID,
					Price:    p,
					Qty:      fillQty,
				}

				remQty -= fillQty
				o.Qty -= fillQty

				if o.Qty > 0 {
					remainingOrders = append(remainingOrders, o)
				}
			}

			if len(remainingOrders) > 0 {
				e.bids[p] = remainingOrders
			} else {
				delete(e.bids, p)
			}
		}

		// Add remaining quantity to book
		if remQty > 0 {
			e.asks[ev.Price] = append(e.asks[ev.Price], orderbook.RestingOrder{
				ID:  ev.ID,
				Qty: remQty,
			})
		}
	}
}
