package signal

import (
	"math"
	"depthwise/engine/internal/orderbook"
)

// TopOfBook encapsulates the price and aggregate volume at Level 1 (BBO).
type TopOfBook struct {
	BestBidPrice int  `json:"best_bid_price"`
	BestBidQty   int  `json:"best_bid_qty"`
	BestAskPrice int  `json:"best_ask_price"`
	BestAskQty   int  `json:"best_ask_qty"`
	HasBids      bool `json:"has_bids"`
	HasAsks      bool `json:"has_asks"`
}

// ExtractTopOfBook derives the Best Bid and Best Ask from a BookSnapshot.
func ExtractTopOfBook(snap orderbook.BookSnapshot) TopOfBook {
	top := TopOfBook{}

	// Best Bid: Maximum price with resting orders
	maxBid := -1
	for p, orders := range snap.Bids {
		total := 0
		for _, o := range orders {
			total += o.Qty
		}
		if total > 0 && (maxBid == -1 || p > maxBid) {
			maxBid = p
			top.BestBidPrice = p
			top.BestBidQty = total
			top.HasBids = true
		}
	}

	// Best Ask: Minimum price with resting orders
	minAsk := -1
	for p, orders := range snap.Asks {
		total := 0
		for _, o := range orders {
			total += o.Qty
		}
		if total > 0 && (minAsk == -1 || p < minAsk) {
			minAsk = p
			top.BestAskPrice = p
			top.BestAskQty = total
			top.HasAsks = true
		}
	}

	return top
}

// OFIMetric represents the calculated Order Flow Imbalance state.
type OFIMetric struct {
	DeltaOFI       int     `json:"delta_ofi"`
	CumulativeOFI  int     `json:"cumulative_ofi"`
	BuyFlowWindow  int     `json:"buy_flow_window"`
	SellFlowWindow int     `json:"sell_flow_window"`
	Ratio          float64 `json:"ratio"`
	Flagged        bool    `json:"flagged"`
}

// OFICalculator maintains rolling state for Cont-Kukanov-Stoikov Order Flow Imbalance.
type OFICalculator struct {
	windowSize      int
	ratioThreshold  float64
	minFlowVolume   int
	prevTop         *TopOfBook
	cumOFI          int
	history         []int
	head            int
	count           int
}

// NewOFICalculator creates an OFI calculator with the specified rolling window size.
func NewOFICalculator(windowSize int, ratioThreshold float64, minFlowVolume int) *OFICalculator {
	if windowSize <= 0 {
		windowSize = 20
	}
	if ratioThreshold <= 1.0 {
		ratioThreshold = 3.0
	}
	if minFlowVolume <= 0 {
		minFlowVolume = 5
	}
	return &OFICalculator{
		windowSize:     windowSize,
		ratioThreshold: ratioThreshold,
		minFlowVolume:  minFlowVolume,
		history:        make([]int, windowSize),
	}
}

// CalculateDelta computes the tick-level Cont-Kukanov-Stoikov OFI between two book states:
// OFI_t = I_{P_B >= P_B_prev} * q_B - I_{P_B <= P_B_prev} * q_B_prev
//       - I_{P_A <= P_A_prev} * q_A + I_{P_A >= P_A_prev} * q_A_prev
func CalculateDelta(prev, curr TopOfBook) int {
	delta := 0

	// 1. Bid side contribution
	if !prev.HasBids && curr.HasBids {
		delta += curr.BestBidQty
	} else if prev.HasBids && !curr.HasBids {
		delta -= prev.BestBidQty
	} else if prev.HasBids && curr.HasBids {
		if curr.BestBidPrice > prev.BestBidPrice {
			delta += curr.BestBidQty
		} else if curr.BestBidPrice == prev.BestBidPrice {
			delta += (curr.BestBidQty - prev.BestBidQty)
		} else {
			delta -= prev.BestBidQty
		}
	}

	// 2. Ask side contribution
	if !prev.HasAsks && curr.HasAsks {
		delta -= curr.BestAskQty
	} else if prev.HasAsks && !curr.HasAsks {
		delta += prev.BestAskQty
	} else if prev.HasAsks && curr.HasAsks {
		if curr.BestAskPrice > prev.BestAskPrice {
			delta += prev.BestAskQty // Ask lifted (buy pressure)
		} else if curr.BestAskPrice == prev.BestAskPrice {
			delta -= (curr.BestAskQty - prev.BestAskQty)
		} else {
			delta -= curr.BestAskQty // Ask dropped (sell pressure)
		}
	}

	return delta
}

// Update processes a new BookSnapshot and returns the updated OFIMetric.
func (c *OFICalculator) Update(snap orderbook.BookSnapshot) OFIMetric {
	currTop := ExtractTopOfBook(snap)

	delta := 0
	if c.prevTop != nil {
		delta = CalculateDelta(*c.prevTop, currTop)
	}
	c.prevTop = &currTop
	c.cumOFI += delta

	// Update circular buffer
	c.history[c.head] = delta
	c.head = (c.head + 1) % c.windowSize
	if c.count < c.windowSize {
		c.count++
	}

	// Calculate window buy/sell flows
	buyFlow := 0
	sellFlow := 0
	for i := 0; i < c.count; i++ {
		val := c.history[i]
		if val > 0 {
			buyFlow += val
		} else if val < 0 {
			sellFlow += -val
		}
	}

	// Ratio calculation
	ratio := 1.0
	flagged := false

	totalFlow := buyFlow + sellFlow
	if totalFlow >= c.minFlowVolume {
		if sellFlow == 0 && buyFlow > 0 {
			ratio = float64(buyFlow)
			flagged = true
		} else if buyFlow == 0 && sellFlow > 0 {
			ratio = 1.0 / float64(sellFlow)
			flagged = true
		} else if sellFlow > 0 {
			ratio = float64(buyFlow) / float64(sellFlow)
			if ratio >= c.ratioThreshold || ratio <= (1.0/c.ratioThreshold) {
				flagged = true
			}
		}
	}

	// Round ratio to 2 decimal places for clean reporting
	ratio = math.Round(ratio*100) / 100

	return OFIMetric{
		DeltaOFI:       delta,
		CumulativeOFI:  c.cumOFI,
		BuyFlowWindow:  buyFlow,
		SellFlowWindow: sellFlow,
		Ratio:          ratio,
		Flagged:        flagged,
	}
}

// Reset clears state for a new simulation session.
func (c *OFICalculator) Reset() {
	c.prevTop = nil
	c.cumOFI = 0
	c.count = 0
	c.head = 0
	for i := range c.history {
		c.history[i] = 0
	}
}
