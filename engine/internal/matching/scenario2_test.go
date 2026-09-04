package matching

import (
	"testing"
	"depthwise/engine/internal/scenarios"
	"depthwise/engine/internal/signal"
)

func TestScenario2_OrderFlowImbalance(t *testing.T) {
	eng := NewEngine()
	ofiCalc := signal.NewOFICalculator(20, 3.0, 10)

	var lastOFIMetric signal.OFIMetric
	var allTrades []any
	maxIndividualTradeQty := 0

	for _, ev := range scenarios.Scenario2Events {
		trades, _ := eng.ProcessStep(ev)
		for _, tr := range trades {
			allTrades = append(allTrades, tr)
			if tr.Qty > maxIndividualTradeQty {
				maxIndividualTradeQty = tr.Qty
			}
		}

		snap := eng.Snapshot()
		lastOFIMetric = ofiCalc.Update(snap)
	}

	finalBook := eng.Snapshot()
	top := signal.ExtractTopOfBook(finalBook)

	// 1. Verify Price Drift Ground Truth ($100.50 -> $103.00)
	if !top.HasBids || top.BestBidPrice != 102 {
		t.Errorf("expected final best bid @ $102, got $%d (hasBids=%v)", top.BestBidPrice, top.HasBids)
	}
	if !top.HasAsks || top.BestAskPrice != 104 {
		t.Errorf("expected final best ask @ $104, got $%d (hasAsks=%v)", top.BestAskPrice, top.HasAsks)
	}

	finalMid := float64(top.BestBidPrice+top.BestAskPrice) / 2.0
	if finalMid < scenarios.Scenario2ExpectedFinalMid {
		t.Errorf("expected final mid price >= $%.2f, got $%.2f", scenarios.Scenario2ExpectedFinalMid, finalMid)
	}

	// 2. Verify Signal Layer Ground Truth: OFI is flagged with high ratio
	if !lastOFIMetric.Flagged {
		t.Errorf("expected OFI to be flagged in Scenario 2 ground truth")
	}
	if lastOFIMetric.Ratio < 3.0 {
		t.Errorf("expected OFI ratio >= 3.0, got %.2f", lastOFIMetric.Ratio)
	}

	// 3. Verify Footprint Isolation: Aggregate flow without massive block trades (max trade <= 10)
	if maxIndividualTradeQty > 10 {
		t.Errorf("expected max individual trade <= 10 shares to isolate OFI from trade footprint, got %d", maxIndividualTradeQty)
	}
}
