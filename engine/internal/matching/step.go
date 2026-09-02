package matching

import (
	"fmt"
	"depthwise/engine/internal/orderbook"
)

// StepExplanation provides structured context and human-readable reasoning
// for a single deterministic matching engine transition.
type StepExplanation struct {
	Seq         int                  `json:"seq"`
	EventType   string               `json:"event_type"` // "new" | "cancel"
	EventID     string               `json:"event_id"`
	Action      string               `json:"action"` // "rested", "matched_full", "matched_partial", "cancelled", "cancel_rejected"
	Summary     string               `json:"summary"`
	Details     []string             `json:"details"`
	Trades      []orderbook.Trade    `json:"trades"`
	Book        orderbook.BookSnapshot `json:"book"`
}

// ProcessStep executes a single OrderEvent deterministically and returns
// the executed trades along with an explanatory breakdown.
func (e *Engine) ProcessStep(ev orderbook.OrderEvent) ([]orderbook.Trade, StepExplanation) {
	tradesChan := make(chan orderbook.Trade, 100)
	
	var action string
	var summary string
	var details []string
	var executedTrades []orderbook.Trade

	if ev.Type == "cancel" {
		cancelledQty := 0
		cancelledSide := ""
		cancelledPrice := 0

		// Check bids
		for p, orders := range e.bids {
			for _, o := range orders {
				if o.ID == ev.ID {
					cancelledQty = o.Qty
					cancelledSide = "buy"
					cancelledPrice = p
					break
				}
			}
			if cancelledQty > 0 {
				break
			}
		}

		// Check asks if not in bids
		if cancelledQty == 0 {
			for p, orders := range e.asks {
				for _, o := range orders {
					if o.ID == ev.ID {
						cancelledQty = o.Qty
						cancelledSide = "sell"
						cancelledPrice = p
						break
					}
				}
				if cancelledQty > 0 {
					break
				}
			}
		}

		if cancelledQty > 0 {
			e.cancelOrder(ev.ID)
			action = "cancelled"
			summary = fmt.Sprintf("Cancelled resting %s order %s (%d units @ $%d).", cancelledSide, ev.ID, cancelledQty, cancelledPrice)
			details = append(details, fmt.Sprintf("Removed %s from price level $%d without affecting time priority of other resting orders.", ev.ID, cancelledPrice))
		} else {
			action = "cancel_rejected"
			summary = fmt.Sprintf("Cancel request for %s rejected — order is already filled or was not found in the book.", ev.ID)
			details = append(details, "Deterministic sequence order ensures cancellations racing fills are resolved strictly by arrival sequence.")
		}
	} else if ev.Type == "new" {
		// Collect prior state at target price level to determine time priority
		priorRestingAtPrice := 0
		if ev.Side == "buy" {
			priorRestingAtPrice = len(e.bids[ev.Price])
		} else if ev.Side == "sell" {
			priorRestingAtPrice = len(e.asks[ev.Price])
		}

		// Match order
		e.matchOrder(ev, tradesChan)
		close(tradesChan)

		for t := range tradesChan {
			executedTrades = append(executedTrades, t)
		}

		matchedQty := 0
		for _, t := range executedTrades {
			matchedQty += t.Qty
		}

		remainingQty := ev.Qty - matchedQty

		if len(executedTrades) > 0 {
			if remainingQty == 0 {
				action = "matched_full"
				summary = fmt.Sprintf("Order %s (%s %d @ $%d) completely filled across %d match(es).", ev.ID, ev.Side, ev.Qty, ev.Price, len(executedTrades))
			} else {
				action = "matched_partial"
				summary = fmt.Sprintf("Order %s partially matched for %d units; remaining %d units placed on %s book @ $%d.", ev.ID, matchedQty, remainingQty, ev.Side, ev.Price)
			}

			for _, t := range executedTrades {
				details = append(details, fmt.Sprintf("Matched %d units @ $%d between Buyer %s and Seller %s (Price-Time Priority).", t.Qty, t.Price, t.BuyerID, t.SellerID))
			}
			if remainingQty > 0 {
				details = append(details, fmt.Sprintf("Residual %d units rest on %s ladder @ $%d.", remainingQty, ev.Side, ev.Price))
			}
		} else {
			action = "rested"
			summary = fmt.Sprintf("Order %s (%s %d @ $%d) did not cross spread and was placed on the %s book.", ev.ID, ev.Side, ev.Qty, ev.Price, ev.Side)
			if priorRestingAtPrice > 0 {
				details = append(details, fmt.Sprintf("Queued behind %d existing resting order(s) at $%d (Time Priority Queue Position #%d).", priorRestingAtPrice, ev.Price, priorRestingAtPrice+1))
			} else {
				details = append(details, fmt.Sprintf("Established new depth at price level $%d (Queue Position #1).", ev.Price))
			}
		}
	}

	snap := e.Snapshot()
	explanation := StepExplanation{
		Seq:         ev.Seq,
		EventType:   ev.Type,
		EventID:     ev.ID,
		Action:      action,
		Summary:     summary,
		Details:     details,
		Trades:      executedTrades,
		Book:        snap,
	}

	return executedTrades, explanation
}
